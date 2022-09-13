import { Howl } from "howler";
import { createBeatParser } from "./beatParser";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DRUM_KITS = ['acoustic', '909']

const BPM = 120;

export function createDrumMachine(
  voices: string[],
  kit: string,
  onStateChange?: (running: boolean) => any,
  onTimeChange?: (bars: number) => any
) {
  const sound = new Howl({
    src: [`/${kit}-kit.mp3`],
    sprite: {
      kick: [0, 500],
      snare: [500, 500],
      hihat: [1000, 500],
    },
  });

  let totalDuration = -1
  onTimeChange?.(totalDuration)
  const stopRef = { current: false };

  const beatParser = createBeatParser(voices);

  const start = async () => {
    if (stopRef.current) {
      return;
    }

    const { triggers, duration } = beatParser.next();

    if (triggers.indexOf("K") !== -1) {
      sound.play("kick");
    }
    if (triggers.indexOf("S") !== -1) {
      sound.play("snare");
    }
    if (triggers.indexOf("H") !== -1) {
      sound.play("hihat");
    }

    onTimeChange?.(totalDuration)
    totalDuration += duration

    await sleep(duration * (60 / BPM) * 4 * 1000);

    if (!beatParser.hasNext()) {
      totalDuration = 0
      beatParser.reset();
    }
    start();
  };

  return {
    start: () => {
      totalDuration = 0
      onTimeChange?.(totalDuration)
      onStateChange?.(true);
      stopRef.current = false;
      start();
    },
    stop: () => {
      totalDuration = -1
      onTimeChange?.(totalDuration)
      onStateChange?.(false);
      stopRef.current = true;
      beatParser.reset();
      
    },
  };
}
