/// <reference types="vite/client" />

interface Window {
  webkitSpeechRecognition: any;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: () => void;
  onresult: (event: any) => void;
  start: () => void;
  stop: () => void;
}