"use client";

import { useCallback, useState } from "react";
import { Vega } from "react-vega";

export default function SingleTimeseries({
  data,
  labels,
}: {
  data: { date: Date; value: number }[];
  labels?: {
    x?: string;
    y?: string;
    title?: string;
  };
}) {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);
  const divRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setWidth(node.clientWidth);
      setHeight(node.clientHeight);
    }
  }, []);
  return (
    <div ref={divRef} className="h-full w-full">
      <Vega
        spec={{
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          width: width,
          height: 250,
          data: { values: data },
          mark: { type: "area", point: true, line: true, opacity: 0.8 },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              axis: { title: labels?.x ?? "Date" },
            },
            y: {
              field: "value",
              type: "quantitative",
              axis: { title: labels?.y ?? "Value" },
            },
            color: { value: "steelblue" },
          },
          title: labels?.title,
          signals: [
            {
              name: "tooltip",
              value: {},
              on: [
                { events: "rect:mouseover", update: "datum" },
                { events: "rect:mouseout", update: "{}" },
              ],
            },
          ],
        }}
      />
    </div>
  );
}
