import { createContext } from "react";

export const CameraContext = createContext({
  cameraActive: false,
  setCameraActive: () => {},
});