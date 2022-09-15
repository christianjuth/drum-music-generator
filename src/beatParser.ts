import { StaveNote } from "vexflow";

const parsePattern = (pattern: string) =>
  pattern.split(/,\s*/).map((beat) => beat.split("/"));

const DURATIONS = {
  EIGHTH: 1 / 8,
  EIGHTH_TRIP: 1 / 8 / 3,
  QUARTER: 1 / 4,
  HALF: 1 / 2,
  SIXTEENTH: 1 / 16,
};

export function createBeatParser(patterns: string[]) {
  let runningBars = 0;
  let _patterns: string[][][] = [];
  let delays: number[] = [];

  const reset = () => {
    delays = patterns.map(() => 0);
    _patterns = patterns.map(parsePattern);
    runningBars = 0;
  };
  reset();

  const next = () => {
    let triggers = "";
    let beatDurations: number[] = [];

    let i = 0;
    for (const pattern of _patterns) {
      if (delays[i] > 0) {
        i++;
        continue;
      }

      triggers += pattern[0][0];

      const duration = pattern[0][1];

      let durationFloat = 0;
      switch (duration) {
        case "h":
          durationFloat = DURATIONS.HALF;
          break;
        case "q":
          durationFloat = DURATIONS.QUARTER;
          break;
        case "8":
          durationFloat = DURATIONS.EIGHTH;
          break;
        case "8t":
          durationFloat = DURATIONS.EIGHTH;
          break;
        case "16":
          durationFloat = DURATIONS.SIXTEENTH;
          break;
      }

      beatDurations.push(durationFloat);
      delays[i] += durationFloat;

      pattern.shift();
      i++;
    }

    const minBeat = Math.max(Math.min(...beatDurations), 0);

    // update delays
    for (let j = 0; j < delays.length; j++) {
      delays[j] -= minBeat;
    }

    const out = {
      triggers,
      duration: minBeat,
      position: runningBars,
    };

    runningBars += minBeat;

    return out;
  };

  const hasNext = () => {
    for (const pattern of _patterns) {
      if (pattern.length > 0) {
        return true;
      }
    }
    return false;
  };

  const getNotes = (
    stemDirection: number,
    highlightTo = 0,
    darkMode = false
  ) => {
    let runningDuration = 0;
    let outputDuration = 0;
    let output: StaveNote[][] = [];
    let running: StaveNote[] = [];
    let highlighted = false;

    while (hasNext()) {
      if (outputDuration >= 1) {
        output.push(running);
        running = [];
        outputDuration = 0;
      }

      const { triggers, duration } = next();

      outputDuration += duration;

      let keys = [];

      if (triggers.indexOf("K") !== -1) {
        keys.push("f/4");
      }
      if (triggers.indexOf("S") !== -1) {
        keys.push("b/4");
      }
      if (triggers.indexOf("s") !== -1) {
        keys.push("b/4");
      }
      if (triggers.indexOf("H") !== -1) {
        keys.push("g/5/x2");
      }

      let durationStr = "";

      switch (duration) {
        case DURATIONS.HALF:
          durationStr = "h";
          break;
        case DURATIONS.QUARTER:
          durationStr = "q";
          break;
        case DURATIONS.EIGHTH:
          durationStr = "8";
          break;
        case DURATIONS.EIGHTH_TRIP:
          durationStr = "8t";
          break;
        case DURATIONS.SIXTEENTH:
          durationStr = "16";
          break;
      }

      if (keys.length === 0) {
        keys.push(stemDirection > 0 ? "g/5" : "f/4");
        durationStr += "r";
      }

      const s = new StaveNote({
        keys,
        duration: durationStr,
        stem_direction: stemDirection,
      });

      if (highlightTo === runningDuration && !highlighted) {
        s.setStyle({ fillStyle: "red", strokeStyle: "red" });
        highlighted = true;
      } else if (darkMode) {
        s.setStyle({ fillStyle: "white", strokeStyle: "white" });
      }
      runningDuration += duration;

      running.push(s);
    }

    if (running.length > 0) {
      output.push(running);
    }

    reset();

    return output;
  };

  return {
    next,
    hasNext,
    getNotes,
    reset,
  };
}
