import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";
import { createBeatParser } from "./beatParser";
import { useDeepCompareMemoize } from "use-deep-compare-effect";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DRUM_KITS = ["acoustic", "909"];

export function useDrumMachine(
  voices: string[],
  kit: string,
  bpm: number,
  enableMetronome: boolean,
  onStateChange?: (running: boolean) => any,
  onTimeChange?: (bars: number) => any
) {
  const metronome = useMemo(
    () =>
      new Howl({
        src: [`/metronome.mp3`],
        sprite: {
          click1: [0, 500],
          click2: [500, 500],
        },
      }),
    []
  );

  useEffect(() => {
    metronome.volume(+enableMetronome);
  }, [metronome, enableMetronome]);

  const sound = useMemo(
    () =>
      new Howl({
        src: [`/${kit}-kit.mp3`],
        sprite: {
          kick: [0, 500],
          snare: [500, 500],
          hihat: [1000, 500],
        },
      }),
    [kit]
  );

  const quietSound = useMemo(
    () =>
      new Howl({
        src: [`/${kit}-kit.mp3`],
        sprite: {
          kick: [0, 500],
          snare: [500, 500],
          hihat: [1000, 500],
        },
        volume: 0.5,
      }),
    [kit]
  );
  const totalDuration = useRef(-1);
  const stopRef = useRef(false);

  const beatParser = useMemo(() => {
    totalDuration.current = 0;
    return createBeatParser(voices);
  }, [voices.join("")]);
  const beatParserRef = useRef(beatParser);
  beatParserRef.current = beatParser;

  const bpmRef = useRef(bpm)
  bpmRef.current = bpm

  const start = async () => {
    if (stopRef.current) {
      return;
    }

    const { triggers, duration } = beatParserRef.current.next();

    if (triggers.indexOf("K") !== -1) {
      sound.play("kick");
    }
    if (triggers.indexOf("S") !== -1) {
      sound.play("snare");
    }
    if (triggers.indexOf("s") !== -1) {
      quietSound.play("snare");
    }
    if (triggers.indexOf("H") !== -1) {
      sound.play("hihat");
    }
    if (triggers.indexOf("M") !== -1) {
      metronome.play("click1");
    }
    if (triggers.indexOf("m") !== -1) {
      metronome.play("click2");
    }

    onTimeChange?.(totalDuration.current);
    totalDuration.current += duration;

    await sleep(duration * (60 / bpmRef.current) * 4 * 1000);

    if (!beatParserRef.current.hasNext()) {
      totalDuration.current = 0;
      beatParserRef.current.reset();
    }
    start();
  };

  return {
    start: () => {
      totalDuration.current = 0;
      onTimeChange?.(totalDuration.current);
      onStateChange?.(true);
      stopRef.current = false;
      start();
    },
    stop: () => {
      totalDuration.current = -1;
      onTimeChange?.(totalDuration.current);
      onStateChange?.(false);
      stopRef.current = true;
      beatParserRef.current.reset();
    },
  };
}
