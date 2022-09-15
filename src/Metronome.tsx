import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const Tempo = styled.div`
  padding: 3px 5px;
  background-color: var(--text-color);
  color: var(--background-color);
  text-transform: uppercase;
  border-radius: 5px;
  font-size: 0.65rem;
  margin-bottom: 3px;
  opacity: 0.4;
`;

const Border = styled.div<{ $pulse: boolean }>`
  height: 100px;
  width: 100px;
  border-radius: 50%;
  border: 2px solid transparent;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${({ $pulse }) =>
    $pulse
      ? `
    border-color: var(--text-color);
  `
      : `
    transition: border-color 0.5s;
    border-color: transparent;
  `}
`;

const Input = styled.input`
  font-size: 2rem;
  line-height: 1em;
  color: var(--text-color);
  width: 100%;
  background-color: transparent;
  text-align: center;
  border: none;
  margin-bottom: -5px;
`;

export function Metronome({
  beat,
  bpm,
  onBpmChange,
}: {
  beat: number;
  bpm: number;
  onBpmChange: (val: number) => any;
}) {
  const [focused, setFocused] = useState(false);
  const [pulse, setPulse] = useState(false);

  const onChangeRef = useRef(onBpmChange);
  onChangeRef.current = onBpmChange;
  useEffect(() => {
    if (!focused) {
      onChangeRef.current(clamp(bpm, 40, 300));
    }
  }, [bpm, focused]);

  useEffect(() => {
    setPulse(true);
    const id = window.setTimeout(() => {
      setPulse(false);
    }, 100);
    return () => {
      window.clearTimeout(id);
    };
  }, [beat]);

  return (
    <Border $pulse={pulse}>
      <Tempo>Tempo</Tempo>
      <Input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type={focused ? "number" : undefined}
        value={bpm}
        onChange={(e) => onBpmChange(e.target.valueAsNumber)}
      />
    </Border>
  );
}
