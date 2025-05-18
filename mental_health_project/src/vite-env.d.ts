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

interface ImportMetaEnv {
  readonly VITE_LLAMA_API_KEY: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
