"use client";
import { api } from "rbrgs/trpc/react";
import SingleTimeseries from "./SingleTimeseries";
import StackedTimeseries from "./StackedTimeseries";
import { useCallback, useState } from "react";
import { Skeleton } from "r/components/ui/skeleton";

export default function ContructGraph({
  query,
  labels,
}: {
  query: {
    process: {
      all: boolean;
      customs: {
        name: string;
        machine_id: string;
        pid: number;
      }[];
    };
    machine: {
      customs: {
        machine_id: string;
      }[];
    };
    stat: "cpu_percent" | "memory_percent" | "gpu_percent" | "gpu_memory";
    from: Date;
    to?: Date;
  };
  labels?: {
    title?: string;
    x?: string;
    y?: string;
  };
}) {
  const labelsGraph = {
    title: labels?.title ?? undefined,
    x: labels?.x ?? "Time",
    y: labels?.y ?? query.stat,
  };
  const twoOrMore =
    query.process.customs.length > 1 ||
    query.machine.customs.length > 1 ||
    query.process.all;

  const { isLoading, data } = api.metrics.customGraph.useQuery(query);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!data) {
    return <SingleTimeseries data={[]} labels={labelsGraph} />;
  }

  if (twoOrMore) {
    return (
      <StackedTimeseries
        data={data.map((stat) => ({
          date: new Date(stat.date * 1000),
          value: stat.value,
          id: stat.id,
        }))}
        labels={labelsGraph}
      />
    );
  } else {
    return (
      <SingleTimeseries
        data={data.map((stat) => ({
          date: new Date(stat.date * 1000),
          value: stat.value,
        }))}
        labels={labelsGraph}
      />
    );
  }
}
