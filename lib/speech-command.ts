export type SpeechRecognitionResultLike = {
  transcript: string;
};

export type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
  resultIndex: number;
};

export type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
};

export function createSpeechCommand(
  createRecognition: () => SpeechRecognitionLike,
  onTranscript: (transcript: string) => void,
  onEnd: () => void = () => {},
) {
  const recognition = createRecognition();

  recognition.onend = onEnd;

  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex];
    const transcript = result?.[0]?.transcript ?? "";

    const trimmed = transcript.trim();

    if (trimmed) {
      onTranscript(trimmed);
    }
  };

  return {
    start() {
      recognition.start();
    },

    stop() {
      recognition.stop();
    },
  };
}
