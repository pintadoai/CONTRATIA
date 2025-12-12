/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_MUSIC: string;
  readonly VITE_WEBHOOK_BOOTH: string;
  readonly VITE_WEBHOOK_DJ: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
