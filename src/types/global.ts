export {};

declare global {
  interface Window {
    api: {
      send: (channel: string, ...args: any[]) => void;
    };
  }
}