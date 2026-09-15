import AVFoundation
import Foundation

func arg(_ name: String) -> String? {
  let args = Array(CommandLine.arguments.dropFirst())
  guard let index = args.firstIndex(of: name), index + 1 < args.count else { return nil }
  return args[index + 1]
}

func fail(_ message: String) -> Never {
  fputs("\(message)\n", stderr)
  exit(1)
}

let text = arg("--text")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
let outPath = arg("--out") ?? ""
let requested = arg("--voice") ?? "Nicky"
let rate = Float(arg("--rate") ?? "0.515") ?? 0.515
let pitch = Float(arg("--pitch") ?? "1.04") ?? 1.04

if text.isEmpty || outPath.isEmpty {
  fail("usage: macos-tts --text \"...\" --out file.caf --voice Nicky")
}

let identifiers: [String: String] = [
  "nicky": "com.apple.ttsbundle.siri_nicky_en-US_compact",
  "samantha": "com.apple.voice.compact.en-US.Samantha",
  "catherine": "com.apple.ttsbundle.siri_catherine_en-AU_compact",
  "martha": "com.apple.ttsbundle.siri_martha_en-GB_compact",
]

func isFemale(_ voice: AVSpeechSynthesisVoice) -> Bool {
  voice.gender == .female
}

func pickVoice() -> AVSpeechSynthesisVoice {
  let english = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.lowercased().hasPrefix("en") }
  let women = english.filter(isFemale)

  if let identifier = identifiers[requested.lowercased()],
     let voice = AVSpeechSynthesisVoice(identifier: identifier),
     isFemale(voice) {
    return voice
  }

  if let named = women.first(where: { $0.name.caseInsensitiveCompare(requested) == .orderedSame }) {
    return named
  }

  if let nicky = AVSpeechSynthesisVoice(identifier: "com.apple.ttsbundle.siri_nicky_en-US_compact"), isFemale(nicky) {
    return nicky
  }

  if let samantha = women.first(where: { $0.name == "Samantha" }) {
    return samantha
  }

  guard let fallback = women.first else {
    fail("No English female voice is installed.")
  }
  return fallback
}

let voice = pickVoice()
if !isFemale(voice) {
  fail("Refusing male/unspecified voice \(voice.name) (\(voice.identifier))")
}

let utterance = AVSpeechUtterance(string: text)
utterance.voice = voice
utterance.rate = min(max(rate, 0.42), 0.54)
utterance.pitchMultiplier = min(max(pitch, 0.95), 1.12)
utterance.volume = 1
utterance.preUtteranceDelay = 0.04
utterance.postUtteranceDelay = 0.06

let outURL = URL(fileURLWithPath: outPath)
try? FileManager.default.removeItem(at: outURL)
try? FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)

let synthesizer = AVSpeechSynthesizer()
var audioFile: AVAudioFile?
var lastError: String?
var finished = false

synthesizer.write(utterance) { buffer in
  guard let pcm = buffer as? AVAudioPCMBuffer else { return }
  if pcm.frameLength == 0 {
    finished = true
    return
  }
  do {
    if audioFile == nil {
      audioFile = try AVAudioFile(
        forWriting: outURL,
        settings: pcm.format.settings,
        commonFormat: pcm.format.commonFormat,
        interleaved: pcm.format.isInterleaved
      )
    }
    try audioFile?.write(from: pcm)
  } catch {
    lastError = error.localizedDescription
    finished = true
  }
}

let deadline = Date().addingTimeInterval(40)
while !finished, Date() < deadline {
  RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.02))
}

if let lastError { fail(lastError) }
guard FileManager.default.fileExists(atPath: outPath) else {
  fail("Neural TTS produced no audio file.")
}

print("\(voice.name)\tfemale\t\(voice.identifier)")
