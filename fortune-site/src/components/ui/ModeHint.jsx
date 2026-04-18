import { motion as Motion, AnimatePresence } from "framer-motion";
import { Hand, Sparkles } from "lucide-react";
import { APP_STATES } from "../../utils/animation";

const labels = {
  [APP_STATES.IDLE]: "點擊籤筒，抽出刮刮卡",
  [APP_STATES.DRAWING]: "卡片正在離筒",
  [APP_STATES.REVEALED]: "按住外圍可翻看，金色覆蓋處可刮",
  [APP_STATES.SCRATCH_MODE]: "正在刮除金色覆層",
  [APP_STATES.DISINTEGRATING]: "卡片滑離，籤筒待命",
  [APP_STATES.RESETTING]: "重新歸位",
};

export function ModeHint({ state, percent }) {
  return (
    <AnimatePresence mode="wait">
      <Motion.div
        key={state}
        className="mode-hint"
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
        transition={{ duration: 0.38 }}
      >
        {state === APP_STATES.SCRATCH_MODE ? <Hand size={15} /> : <Sparkles size={15} />}
        <span>{labels[state]}</span>
        {(state === APP_STATES.SCRATCH_MODE || state === APP_STATES.REVEALED) && (
          <strong>{percent}%</strong>
        )}
      </Motion.div>
    </AnimatePresence>
  );
}
