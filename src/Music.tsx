import { useEffect, useMemo, useRef } from "react";
import { Vex, Beam, BarlineType } from "vexflow";
import { createBeatParser } from "./beatParser";
import styled from "styled-components";

const Sheet = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    height: 165px;
  }
`;

const { Factory } = Vex.Flow;

export function Music({
  upVoices,
  downVoices,
  highlightTo = 0,
  darkMode = true,
}: {
  upVoices: string[];
  downVoices: string[];
  highlightTo: number;
  darkMode: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const upBeatParser = useMemo(() => createBeatParser(upVoices), [upVoices]);
  const downBeatParser = useMemo(
    () => createBeatParser(downVoices),
    [downVoices]
  );

  useEffect(() => {
    const elm = ref.current;
    if (elm) {
      elm.innerHTML = "";
      let elmWidth = 0;

      const vf = new Factory({
        renderer: {
          elementId: "output",
          height: elm.offsetHeight,
          width: elm.offsetWidth,
        },
      });
      const score = vf.EasyScore();

      if (darkMode) {
        // @ts-ignore
        vf.context.setFillStyle("white");
        // @ts-ignore
        vf.context.setStrokeStyle("white");
      }

      let x = 0;
      let y = 50;

      const appendSystem = (width: number) => {
        elmWidth += width + 10;
        const system = vf.System({ x, y, width, spaceBetweenStaves: 10 });
        x += width;
        return system;
      };

      const voice1Sections = upBeatParser.getNotes(1, highlightTo, darkMode);
      const voice2Sections = downBeatParser.getNotes(-1, highlightTo, darkMode);

      const beamSets: Beam[][] = [];

      for (
        let i = 0;
        i < Math.min(voice1Sections.length, voice2Sections.length);
        i++
      ) {
        const voice1 = score.voice(voice1Sections[i]);
        const voice2 = score.voice(voice2Sections[i]);

        beamSets.push(
          ...[voice1, voice2].map((v, i) =>
            Beam.applyAndGetBeams(v, i === 0 ? 1 : -1)
          )
        );

        let system = appendSystem(i === 0 ? 420 : 375);
        const stave = system.addStave({
          voices: [voice1, voice2],
        });

        if (darkMode) {
          // @ts-ignore
          vf.context.setFillStyle("white");
          // @ts-ignore
          vf.context.setStrokeStyle("white");
        }

        if (i === 0) {
          stave.addClef("percussion").addTimeSignature("4/4");
        }
        if (i === voice1Sections.length - 1) {
          stave.setEndBarType(BarlineType.REPEAT_END);
        }
      }

      // // Draw it!
      vf.draw();

      for (const beams of beamSets) {
        for (const beam of beams) {
          if (darkMode) {
            beam.setStyle({ fillStyle: "white" });
          }

          beam.setContext(vf.getContext()).draw();
        }
      }

      // @ts-ignore
      elm.getElementsByTagName("svg")[0].style.width = `${elmWidth}px`;
    }
  }, [upBeatParser, downBeatParser, highlightTo, darkMode]);

  return <Sheet ref={ref} id="output" />;
}
