import { useEffect, useMemo, useState } from "react";
import { createDrumMachine, DRUM_KITS } from "./drumMachine";
import { Music } from "./Music";

function loop(patterns: string[], times: number) {
  return patterns.map((pattern) => Array(times).fill(pattern).join(", "));
}

const KICK = "K/q, K/q, K/q, K/q";

const SNARE = "/q, S/q, /q, S/q";

// const HIHAT = "/16, H/16, /8, /h, H/8t, H/8t, H/8t";
const HIHAT = "H/8, H/8, H/8, H/8, H/8, H/8, H/8, H/16, H/16";
// const HIHAT = "H/16, H/16, H/8, H/8, H/8, H/8, H/8, H/8, H/8";

const UP_VOICES = loop([SNARE, HIHAT], 2);
const DOWN_VOICES = loop([KICK], 2);
const VOICES = [...UP_VOICES, ...DOWN_VOICES];

function App() {
  const [selectedKit, setSelectedKit] = useState(DRUM_KITS[0]);
  const [bar, setBar] = useState(0);
  const [running, setRunning] = useState(false);

  const drumMachine = useMemo(
    () =>
      createDrumMachine(
        VOICES,
        selectedKit,
        (running) => setRunning(running),
        (bar) => setBar(bar)
      ),
    [selectedKit]
  );

  useEffect(() => {
    return () => {
      drumMachine.stop();
    };
  }, [drumMachine]);

  return (
    <>
      <select onChange={(e) => setSelectedKit(e.target.value)}>
        {DRUM_KITS.map((kit) => (
          <option value={kit}>{kit}</option>
        ))}
      </select>
      <button onClick={running ? drumMachine.stop : drumMachine.start}>
        {running ? "Stop" : "Start"}
      </button>
      <Music upVoices={UP_VOICES} downVoices={DOWN_VOICES} highlightTo={bar} />
    </>
  );
}

export default App;
