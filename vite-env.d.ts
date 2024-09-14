/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
