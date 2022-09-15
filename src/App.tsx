import { useEffect, useMemo, useState } from "react";
import { use100vh } from "react-div-100vh";
import { GiDrumKit, GiPerspectiveDiceFive } from "react-icons/gi";
import {
  MdDarkMode,
  MdPauseCircle,
  MdPlayCircle,
  MdWbSunny,
} from "react-icons/md";
import styled, { createGlobalStyle } from "styled-components";
import { useDrumMachine, DRUM_KITS } from "./drumMachine";
import { Metronome } from "./Metronome";
import { Music } from "./Music";
import { GiMetronome } from "react-icons/gi";

const GlogbalStyle = createGlobalStyle<{ $darkMode: boolean }>`
  :root {
    ${({ $darkMode }) =>
      $darkMode
        ? `
        --background-color: black;
        --text-color: white;
    `
        : `
        --background-color: white;
        --text-color: black;
      
    `}
  }

  body {
    ${({ $darkMode }) =>
      $darkMode
        ? `
      background-color: black;

      label,
      h1 {
        color: white;
      }
    `
        : ""}
  }

  * {
    box-sizing: border-box;
  }  
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DarkModeToggle = styled.button`
  position: fixed;
  top: 5px;
  right: 5px;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
`;

const HiddenButton = styled.button`
  display: flex;
  background-color: transparent;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: 25px;
  }

  .fade {
    opacity: 0.4;
  }
`;

function loop(patterns: string[], times: number) {
  return patterns.map((pattern) => Array(times).fill(pattern).join(", "));
}

function randomArrayItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

const METRONOME = "M/q, m/q, m/q, m/q";

const KICKS = [
  "K/q, /q, K/q, /q",
  "K/q, K/q, K/q, K/q",
  "K/q, K/8, /16, K/16, K/q, K/q",
  "K/q, /8, K/8, K/q, K/q",
  "/16, K/16, /8, /16, K/16, /8, /16, K/16, /8, /16, K/16, /8",
  "/8, K/8, /8, K/8, /8, K/8, /8, K/8",
  "/8, /16, K/16, /8, /16, K/16, /8, /16, K/16, /8, /16, K/16",
  "K/8, K/8, /q, K/8, K/8, /q",
];

const HIHATS = [
  "H/8, H/8, H/8, H/8, H/8, H/8, H/8, H/16, H/16",
  "H/16, H/16, H/8, H/8, H/8, H/8, H/8, H/8, H/8",
  "/8, H/8, /8, H/8, /8, H/8, /8, H/8",
  // "/16, H/16, /16, H/16, /16, H/16, /16, H/16, /16, H/16, /16, H/16, /16, H/16, /16, H/16",
];

const SNARES = ["/q, S/q, /q, S/q", "/q, /q, /8, /16, s/16, S/q", "/h, S/h"];

function App() {
  const [metronomeMode, setMetronomeMode] = useState(0);
  const height = use100vh() ?? 0;

  const [randomSignal, setRandomSignal] = useState(0);

  const [UP_VOICES, DOWN_VOICES, VOICES] = useMemo(() => {
    const SNARE = randomArrayItem(SNARES);
    const HIHAT = randomArrayItem(HIHATS);
    const KICK = randomArrayItem(KICKS);

    const UP_VOICES = loop([SNARE, HIHAT], 2);
    const DOWN_VOICES = loop([KICK], 2);
    const METRONOME_VOICE = loop([METRONOME], 2)

    const VOICES = [...UP_VOICES, ...DOWN_VOICES, ...METRONOME_VOICE];
    return [UP_VOICES, DOWN_VOICES, VOICES];
  }, [randomSignal]);

  const [bpm, setBpm] = useState(100);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ?? false
  );
  const [selectedKit, setSelectedKit] = useState(0);
  const [bar, setBar] = useState(0);
  const [running, setRunning] = useState(false);

  const drumMachine = useDrumMachine(
    VOICES,
    DRUM_KITS[selectedKit % DRUM_KITS.length],
    bpm,
    metronomeMode > 0,
    (running) => setRunning(running),
    (bar) => setBar(bar)
  );

  useEffect(() => {
    if (metronomeMode === 2 && bar === 0) {
      setBpm((v) => v + 1);
    }
  }, [metronomeMode, bar]);

  return (
    <>
      <GlogbalStyle $darkMode={darkMode} />

      <DarkModeToggle onClick={() => setDarkMode((v) => !v)}>
        {darkMode ? <MdDarkMode /> : <MdWbSunny />}
      </DarkModeToggle>

      <Page style={{ height }}>
        <Metronome
          beat={Math.floor(bar * 4)}
          bpm={bpm}
          onBpmChange={(value) => setBpm(value)}
        />
        <Music
          upVoices={UP_VOICES}
          downVoices={DOWN_VOICES}
          highlightTo={bar}
          darkMode={darkMode}
        />
        <div style={{ height: 50 }} />
        <FlexRow>
          <HiddenButton
            className="fade"
            onClick={() => setRandomSignal((v) => v + 1)}
          >
            <GiPerspectiveDiceFive color="var(--text-color)" size={38} />
          </HiddenButton>

          <HiddenButton
            onClick={running ? drumMachine.stop : drumMachine.start}
          >
            {running ? (
              <MdPauseCircle color="var(--text-color)" size={55} />
            ) : (
              <MdPlayCircle color="var(--text-color)" size={55} />
            )}
          </HiddenButton>

          <HiddenButton
            className={metronomeMode === 0 ? "fade" : undefined}
            onClick={() => setMetronomeMode((v) => (v + 1) % 3)}
          >
            <GiMetronome
              color={metronomeMode === 2 ? "red" : "var(--text-color)"}
              size={36}
            />
          </HiddenButton>

          {/* <HiddenButton
            className="fade"
            onClick={() => setSelectedKit((v) => v + 1)}
          >
            <GiDrumKit color="var(--text-color)" size={38} />
          </HiddenButton> */}
        </FlexRow>
      </Page>
    </>
  );
}

export default App;
