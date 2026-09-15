import type { Scene, SceneTiming, WordTimestamp } from "../content/schema";
import { DURATION } from "../config";
import { stripPunctuation, wordsArray } from "../utils/words";

function normalizeTokens(text: string): string[] {
  return wordsArray(text).map(stripPunctuation).filter(Boolean);
}

function findPhrase(
  words: WordTimestamp[],
  phrase: string,
  fromIndex = 0,
): { startIndex: number; endIndex: number } | null {
  const needle = normalizeTokens(phrase);
  if (needle.length === 0) return null;
  const hay = words.map((w) => stripPunctuation(w.word));

  for (let i = fromIndex; i <= hay.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return { startIndex: i, endIndex: i + needle.length - 1 };
    }
  }

  if (needle.length >= 2) {
    const shorter = needle.slice(0, Math.max(2, needle.length - 1));
    for (let i = fromIndex; i <= hay.length - shorter.length; i++) {
      let match = true;
      for (let j = 0; j < shorter.length; j++) {
        if (hay[i + j] !== shorter[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return { startIndex: i, endIndex: i + shorter.length - 1 };
      }
    }
  }

  return null;
}

function sentenceBoundaries(words: WordTimestamp[]): number[] {
  const ends: number[] = [];
  words.forEach((w, i) => {
    if (/[.!?]$/.test(w.word) && i < words.length - 1) {
      ends.push(i);
    }
  });
  return ends;
}

function clampTimeline(
  raw: Array<Omit<SceneTiming, "source"> & { source: SceneTiming["source"] }>,
  totalSeconds: number,
): SceneTiming[] {
  const minScene = DURATION.minSceneSeconds;
  const cleaned = raw.map((s) => ({ ...s }));

  for (let i = 0; i < cleaned.length; i++) {
    cleaned[i].startSeconds = Math.max(0, cleaned[i].startSeconds);
    cleaned[i].endSeconds = Math.min(totalSeconds, cleaned[i].endSeconds);
    if (i > 0) {
      cleaned[i].startSeconds = Math.max(
        cleaned[i].startSeconds,
        cleaned[i - 1].endSeconds,
      );
    }
    if (cleaned[i].endSeconds <= cleaned[i].startSeconds) {
      cleaned[i].endSeconds = Math.min(
        totalSeconds,
        cleaned[i].startSeconds + minScene,
      );
    }
  }

  if (cleaned.length > 0) {
    cleaned[0].startSeconds = 0;
    cleaned[cleaned.length - 1].endSeconds = totalSeconds;
  }

  for (let i = 1; i < cleaned.length; i++) {
    if (cleaned[i].startSeconds < cleaned[i - 1].endSeconds) {
      const mid = (cleaned[i].startSeconds + cleaned[i - 1].endSeconds) / 2;
      cleaned[i - 1].endSeconds = mid;
      cleaned[i].startSeconds = mid;
    }
  }

  for (let i = 0; i < cleaned.length; i++) {
    const dur = cleaned[i].endSeconds - cleaned[i].startSeconds;
    if (dur < minScene && cleaned.length > 1) {
      const need = minScene - dur;
      if (i < cleaned.length - 1) {
        const nextDur =
          cleaned[i + 1].endSeconds - cleaned[i + 1].startSeconds;
        const steal = Math.min(need, Math.max(0, nextDur - minScene * 0.6));
        cleaned[i].endSeconds += steal;
        cleaned[i + 1].startSeconds += steal;
      } else if (i > 0) {
        const prevDur =
          cleaned[i - 1].endSeconds - cleaned[i - 1].startSeconds;
        const steal = Math.min(need, Math.max(0, prevDur - minScene * 0.6));
        cleaned[i].startSeconds -= steal;
        cleaned[i - 1].endSeconds -= steal;
      }
    }
  }

  return cleaned.map((s) => ({
    sceneId: s.sceneId,
    startSeconds: Number(s.startSeconds.toFixed(3)),
    endSeconds: Number(s.endSeconds.toFixed(3)),
    source: s.source,
  }));
}

function proportional(
  scenes: Scene[],
  totalSeconds: number,
): SceneTiming[] {
  const weights = scenes.map((scene, index) => {
    if (scene.type === "hook") return 0.9;
    if (scene.type === "takeaway" || scene.type === "payoff") return 1.05;
    if (index === scenes.length - 1) return 1.1;
    return 1;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let cursor = 0;
  return scenes.map((scene, i) => {
    const start = cursor;
    const end = i === scenes.length - 1 ? totalSeconds : cursor + (weights[i] / sum) * totalSeconds;
    cursor = end;
    return {
      sceneId: scene.id,
      startSeconds: start,
      endSeconds: end,
      source: "proportional" as const,
    };
  });
}

export function buildSceneTimeline(input: {
  scenes: Scene[];
  words: WordTimestamp[];
  totalSeconds: number;
  startPadding?: number;
}): SceneTiming[] {
  const { scenes, words, totalSeconds } = input;
  if (scenes.length === 0) {
    throw new Error("Cannot build a timeline without scenes.");
  }
  if (totalSeconds <= 0) {
    throw new Error("Timeline duration must be positive.");
  }

  if (words.length === 0) {
    return clampTimeline(proportional(scenes, totalSeconds), totalSeconds);
  }

  const anchors: Array<{
    sceneId: string;
    start: number;
    end: number;
    source: SceneTiming["source"];
  }> = [];

  let searchFrom = 0;
  let usedAnchors = 0;

  for (const scene of scenes) {
    const startPhrase = scene.narrationAnchorStart;
    if (!startPhrase) {
      anchors.push({
        sceneId: scene.id,
        start: -1,
        end: -1,
        source: "proportional",
      });
      continue;
    }

    const endPhrase = scene.narrationAnchorEnd ?? startPhrase;
    const startHit = findPhrase(words, startPhrase, searchFrom);
    if (!startHit) {
      anchors.push({
        sceneId: scene.id,
        start: -1,
        end: -1,
        source: "proportional",
      });
      continue;
    }

    const endHit =
      findPhrase(words, endPhrase, startHit.startIndex) ?? startHit;
    usedAnchors += 1;
    searchFrom = Math.max(searchFrom, startHit.startIndex);
    anchors.push({
      sceneId: scene.id,
      start: words[startHit.startIndex].start,
      end: words[endHit.endIndex].end,
      source: "anchor",
    });
  }

  const sentenceEnds = sentenceBoundaries(words);
  if (usedAnchors < Math.ceil(scenes.length * 0.5) && sentenceEnds.length >= scenes.length - 1) {
    const cuts = [0, ...sentenceEnds.map((i) => i + 1), words.length];
    const uniqueCuts = [...new Set(cuts)].sort((a, b) => a - b);
    const fallback = scenes.map((scene, i) => {
      const startIdx = uniqueCuts[Math.min(i, uniqueCuts.length - 2)];
      const endIdx = uniqueCuts[Math.min(i + 1, uniqueCuts.length - 1)] - 1;
      return {
        sceneId: scene.id,
        startSeconds: words[Math.max(0, startIdx)].start,
        endSeconds: words[Math.max(0, endIdx)].end,
        source: "sentence" as const,
      };
    });
    return clampTimeline(fallback, totalSeconds);
  }

  if (usedAnchors === 0) {
    return clampTimeline(proportional(scenes, totalSeconds), totalSeconds);
  }

  const withTimes: SceneTiming[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const current = anchors[i];
    if (current.start >= 0) {
      const start = i === 0 ? 0 : current.start;
      let end = current.end;
      const next = anchors[i + 1];
      if (next && next.start >= 0) {
        end = Math.max(end, next.start);
      }
      withTimes.push({
        sceneId: current.sceneId,
        startSeconds: start,
        endSeconds: end,
        source: current.source,
      });
    } else {
      withTimes.push({
        sceneId: current.sceneId,
        startSeconds: -1,
        endSeconds: -1,
        source: "proportional",
      });
    }
  }

  const known = withTimes.filter((s) => s.startSeconds >= 0);
  if (known.length !== withTimes.length) {
    const prop = proportional(scenes, totalSeconds);
    for (let i = 0; i < withTimes.length; i++) {
      if (withTimes[i].startSeconds < 0) {
        withTimes[i] = prop[i];
      }
    }
  }

  return clampTimeline(withTimes, totalSeconds);
}
