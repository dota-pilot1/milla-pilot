export const SERVER_ROOT_PATH =
  import.meta.env.VITE_SERVER_ROOT_PATH ||
  "/Users/terecal/milla-pilot/donation-platform-server";

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4301"
  : "https://dxline-tallent.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
