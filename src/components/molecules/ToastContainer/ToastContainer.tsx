import { AnimatePresence } from "framer-motion";
import { Toast } from "../Toast";
import { useToastStore } from "@/store/toastSlice";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-md">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
