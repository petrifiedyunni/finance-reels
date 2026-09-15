const MIN_CHUNK = 5 * 1024 * 1024;
const MAX_CHUNK = 64 * 1024 * 1024;

export interface ChunkPlan {
  chunkSize: number;
  totalChunkCount: number;
}

/**
 * TikTok FILE_UPLOAD rules:
 * - under 5MB: one whole-file chunk
 * - 5–64MB: one chunk
 * - over 64MB: multiple chunks; last chunk may exceed chunkSize up to 128MB
 * - total_chunk_count = floor(video_size / chunk_size)
 */
export function planChunks(videoSize: number): ChunkPlan {
  if (videoSize <= 0) {
    throw new Error("Video file is empty.");
  }
  if (videoSize <= MAX_CHUNK) {
    return { chunkSize: videoSize, totalChunkCount: 1 };
  }

  let chunkSize = MAX_CHUNK;
  let totalChunkCount = Math.floor(videoSize / chunkSize);
  if (totalChunkCount < 2) {
    chunkSize = Math.max(MIN_CHUNK, Math.ceil(videoSize / 2));
    chunkSize = Math.min(MAX_CHUNK, chunkSize);
    totalChunkCount = Math.floor(videoSize / chunkSize);
  }
  if (totalChunkCount < 1) {
    return { chunkSize: videoSize, totalChunkCount: 1 };
  }
  return { chunkSize, totalChunkCount };
}

export function chunkRanges(videoSize: number, plan: ChunkPlan): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let start = 0;
  for (let i = 0; i < plan.totalChunkCount; i++) {
    const isLast = i === plan.totalChunkCount - 1;
    const end = isLast ? videoSize : Math.min(videoSize, start + plan.chunkSize);
    ranges.push({ start, end });
    start = end;
  }
  return ranges;
}
