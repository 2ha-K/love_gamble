import { motion as Motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export function ResetButton({ visible, disabled, onReset }) {
  if (!visible) return null;

  return (
    <Motion.button
      className="reset-button"
      type="button"
      aria-label="重製抽籤"
      title="重製抽籤"
      disabled={disabled}
      initial={{ opacity: 0, x: 24, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onReset}
    >
      <RotateCcw size={22} strokeWidth={1.7} />
    </Motion.button>
  );
}
