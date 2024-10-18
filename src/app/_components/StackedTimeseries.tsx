"use client";

import { useCallback, useState } from "react";
import { Vega } from "react-vega";

export default function StackedTimeseries({
  data,
  labels,
}: {
  data: { date: Date; value: number; id: string }[];
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
      setWidth(node.clientWidth - 250);
      setHeight(node.clientHeight);
    }
  }, []);
  return (
    <div ref={divRef} className="col-span-2 h-full w-full px-16">
      <Vega
        spec={{
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          width: width,
          height: 250,
          data: { values: data },
          mark: { type: "area", opacity: 0.8, interpolate: "monotone" },
          encoding: {
            x: {
              field: "date",
              type: "temporal",
              axis: { title: labels?.x ?? "Date" },
            },
            y: {
              aggregate: "sum",
              stack: "zero",
              field: "value",
              axis: { title: labels?.y ?? "Value" },
            },
            color: {
              field: "id",
              // scale: { scheme: "category20b" },
              scale: { nice: true },
            },
          },
          signals: [
            {
              name: "tooltip",
              value: {},
              on: [
                { events: "rect:mouseover", update: "datum" },
                { events: "rect:mouseout", update: "{}" },
              ],
            },
            {
              name: "tooltipOut",
              value: {},
              on: [{ events: "rect:mouseout", update: "{}" }],
            },
          ],
        }}
        signalListeners={{
          tooltip: (name, value) => {
            console.log("tooltip", value);
          },
          tooltipOut: (name, value) => {
            console.log("tooltipOut", value);
          },
        }}
      />
    </div>
  );
}
