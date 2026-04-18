import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { MoonStar } from "lucide-react";
import "./App.css";
import { RitualScene } from "./components/scene/RitualScene";
import { ModeHint } from "./components/ui/ModeHint";
import { ResetButton } from "./components/ui/ResetButton";
import { scratchCards } from "./data/scratchCards";
import { useRitualAudio } from "./hooks/useRitualAudio";
import { APP_STATES } from "./utils/animation";

export default function App() {
  const [state, setState] = useState(APP_STATES.IDLE);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [hasStartedScratch, setHasStartedScratch] = useState(false);
  const lastDrawIndexRef = useRef(-1);
  const resetTimerRef = useRef(null);
  const audio = useRitualAudio();

  const activeCard = useMemo(() => {
    if (activeIndex < 0) return null;
    return scratchCards[activeIndex % scratchCards.length];
  }, [activeIndex]);

  const displayCard =
    !hasStartedScratch &&
    (state === APP_STATES.DRAWING ||
      state === APP_STATES.REVEALED ||
      state === APP_STATES.DISINTEGRATING)
      ? activeCard
      : null;
  const showTitle = state === APP_STATES.IDLE || Boolean(displayCard);

  const startDraw = useCallback(() => {
    if (state !== APP_STATES.IDLE) return;
    audio.draw();
    setScratchPercent(0);
    setHasStartedScratch(false);
    setActiveIndex(() => {
      if (scratchCards.length <= 1) return 0;
      let nextIndex = Math.floor(Math.random() * scratchCards.length);
      while (nextIndex === lastDrawIndexRef.current) {
        nextIndex = Math.floor(Math.random() * scratchCards.length);
      }
      lastDrawIndexRef.current = nextIndex;
      return nextIndex;
    });
    setState(APP_STATES.DRAWING);
  }, [audio, state]);

  const completeDraw = useCallback(() => {
    setState(APP_STATES.REVEALED);
  }, []);

  const enterScratchMode = useCallback(() => {
    setState((current) => {
      if (current !== APP_STATES.REVEALED) return current;
      audio.scratchReady();
      setHasStartedScratch(true);
      return APP_STATES.SCRATCH_MODE;
    });
  }, [audio]);

  const leaveScratchMode = useCallback(() => {
    setState((current) => (current === APP_STATES.SCRATCH_MODE ? APP_STATES.REVEALED : current));
  }, []);

  const handleScratchProgress = useCallback((percent) => {
    setScratchPercent(percent);
  }, []);

  const reset = useCallback(() => {
    if (
      state === APP_STATES.IDLE ||
      state === APP_STATES.RESETTING ||
      state === APP_STATES.DISINTEGRATING
    ) {
      return;
    }

    audio.ash();
    setState(APP_STATES.DISINTEGRATING);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => {
      setActiveIndex(-1);
      setState(APP_STATES.RESETTING);
      window.setTimeout(() => {
        setResetKey((key) => key + 1);
        setScratchPercent(0);
        setHasStartedScratch(false);
        setState(APP_STATES.IDLE);
      }, 460);
    }, 2550);
  }, [audio, state]);

  const resetVisible = state !== APP_STATES.IDLE && state !== APP_STATES.RESETTING;

  return (
    <main className="app-shell">
      <div className="grain" aria-hidden="true" />
      <RitualScene
        state={state}
        activeCard={activeCard}
        resetKey={resetKey}
        onDraw={startDraw}
        onDrawComplete={completeDraw}
        onScratchMode={enterScratchMode}
        onScratchEnd={leaveScratchMode}
        onScratchProgress={handleScratchProgress}
        audio={audio}
      />

      <section className="ritual-chrome" aria-label="抽籤與刮刮樂儀式">
        <Motion.div
          className="brand-mark"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <MoonStar size={17} strokeWidth={1.6} />
          <span>Dark Fortune Ritual</span>
        </Motion.div>

        <AnimatePresence mode="wait">
          {showTitle && (
            <Motion.div
              key={displayCard?.id || "idle"}
              className="card-title"
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              transition={{ duration: 0.45 }}
            >
              <span>{displayCard ? displayCard.subtitle : "水獺命籤"}</span>
              <h1>{displayCard ? displayCard.title : "玄夜抽籤"}</h1>
            </Motion.div>
          )}
        </AnimatePresence>

        <ModeHint state={state} percent={scratchPercent} />
      </section>

      <AnimatePresence>
        <ResetButton
          visible={resetVisible}
          disabled={state === APP_STATES.DISINTEGRATING}
          onReset={reset}
        />
      </AnimatePresence>
    </main>
  );
}
