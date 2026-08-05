import { Outlet } from "react-router";
import { DialogProvider } from "../providers/dialog";
import { KeyboardLayerProvider } from "../providers/keyboard-layer";
import { ToastProvider } from "../providers/toast";

export function RootLayout() {
  return (
    <ToastProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <Outlet />
        </DialogProvider>
      </KeyboardLayerProvider>
    </ToastProvider>
  );
}
