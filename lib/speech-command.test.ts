import { describe, expect, it, vi } from "vitest";
import {
  createSpeechCommand,
  type SpeechRecognitionLike,
} from "./speech-command";

describe("speech command", () => {
  it("starts listening and reports a final transcript", () => {
    const recognition: SpeechRecognitionLike = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onend: null,
      onerror: null,
    };

    const onTranscript = vi.fn();

    const command = createSpeechCommand(
      () => recognition,
      onTranscript,
    );

    command.start();

    expect(recognition.start).toHaveBeenCalledTimes(1);

    recognition.onresult?.({
      results: [
        [
          {
            transcript: "Compare supplier A and supplier B",
          },
        ],
      ],
      resultIndex: 0,
    });

    expect(onTranscript).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );
  });

  it("stops listening without submitting", () => {
    const recognition: SpeechRecognitionLike = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onend: null,
      onerror: null,
    };

    const onTranscript = vi.fn();
    const onSubmit = vi.fn();

    const command = createSpeechCommand(
      () => recognition,
      onTranscript,
    );

    command.start();
    command.stop();

    expect(recognition.stop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("speech command lifecycle", () => {
  it("reports when recognition ends", () => {
    const recognition: SpeechRecognitionLike = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onend: null,
      onerror: null,
    };

    const onTranscript = vi.fn();
    const onEnd = vi.fn();

    const command = createSpeechCommand(
      () => recognition,
      onTranscript,
      onEnd,
    );

    command.start();

    recognition.onend?.();

    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
