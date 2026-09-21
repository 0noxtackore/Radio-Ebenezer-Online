interface NetworkConnection extends EventTarget {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  addEventListener(type: "change", listener: () => void): void;
}

interface Navigator {
  connection?: NetworkConnection;
}

interface ImportMetaEnv {
  readonly VITE_STREAM_URL: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
