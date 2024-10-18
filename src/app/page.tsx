"use client";
import Link from "next/link";
import { api } from "rbrgs/trpc/react";
// import { useEffect } from "react";
import { Vega } from "react-vega";
import SingleTimeseries from "./_components/SingleTimeseries";
import StackedTimeseries from "./_components/StackedTimeseries";
import { useEffect, useState } from "react";
import { Input } from "r/components/ui/input";
import AddRoboGraphic from "./_components/AddRoboGraphic";

export default function Home() {
  // 15 min ago
  const [from, setFrom] = useState(
    new Date(new Date().getTime() - 15 * 60 * 1000),
  );
  const [to, setTo] = useState<Date | null>(new Date());
  // const statics = api.metrics.getStatics.useQuery();
  const machines = api.metrics.getAllMachineStats.useQuery({
    from,
    to: to ?? undefined,
  });
  const processes = api.metrics.getAllProcessStats.useQuery({
    from,
    to: to ?? undefined,
  });
  const utils = api.useUtils();

  // each 0.5 seconds refresh the data

  const [pick, setPick] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!live) return;
      void utils.invalidate();
    }, 750);

    return () => clearInterval(interval);
  }, []);

  const [option, setOption] = useState("15 min");

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">RoboMetrics</h1>
        {/* Set time from and to */}
        <div className="flex gap-4">
          <select
            value={option}
            onChange={(e) => {
              if (e.target.value === "pick") {
                setPick(true);
              } else {
                setPick(false);
                if (e.target.value === "15 min") {
                  setFrom(new Date(new Date().getTime() - 15 * 60 * 1000));
                } else if (e.target.value === "30 min") {
                  setFrom(new Date(new Date().getTime() - 30 * 60 * 1000));
                } else if (e.target.value === "1 hour") {
                  setFrom(new Date(new Date().getTime() - 60 * 60 * 1000));
                } else if (e.target.value === "3 hours") {
                  setFrom(new Date(new Date().getTime() - 3 * 60 * 60 * 1000));
                } else if (e.target.value === "6 hours") {
                  setFrom(new Date(new Date().getTime() - 6 * 60 * 60 * 1000));
                } else if (e.target.value === "12 hours") {
                  setFrom(new Date(new Date().getTime() - 12 * 60 * 60 * 1000));
                } else if (e.target.value === "1 day") {
                  setFrom(new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
                }
                setTo(new Date());
              }
              setOption(e.target.value);
            }}
          >
            <option value="15 min">15 min</option>
            <option value="30 min">30 min</option>
            <option value="1 hour">1 hour</option>
            <option value="3 hours">3 hours</option>
            <option value="6 hours">6 hours</option>
            <option value="12 hours">12 hours</option>
            <option value="1 day">1 day</option>
            <option value="pick">Pick</option>
          </select>
          {pick && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="from">From</label>
                <Input
                  id="from"
                  type="datetime-local"
                  value={from ? from.toISOString().slice(0, -8) : ""}
                  onChange={(e) => setFrom(new Date(e.target.value))}
                />
              </div>
              {!live && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="to">To</label>
                  <Input
                    id="to"
                    type="datetime-local"
                    value={to ? to.toISOString().slice(0, -8) : ""}
                    onChange={(e) =>
                      setTo(e.target.value ? new Date(e.target.value) : null)
                    }
                  />
                </div>
              )}
            </>
          )}
          <button
            onClick={() => {
              setLive(!live);
              setTo(null);
            }}
            className={`${
              !live ? "bg-green-500" : "bg-red-500"
            } rounded-md px-4 py-2 text-white`}
          >
            {live ? "Stop" : "Start"} Live
          </button>
        </div>
        <div className="grid w-[84vw] grid-cols-3 gap-12">
          <SingleTimeseries
            data={
              machines.data?.map((stat) => ({
                date: new Date(stat.created_at * 1000),
                value: stat.cpu_percent ?? 0,
              })) ?? []
            }
            labels={{
              title: "CPU Usage",
              x: "Time",
              y: "CPU Usage (%)",
            }}
          />
          <SingleTimeseries
            data={
              machines.data
                ?.map((stat) => ({
                  date: new Date(stat.created_at * 1000),
                  value: stat.cpu_percent ?? 0,
                }))
                .slice(0, 10) ?? []
            }
            labels={{
              x: "Date2",
            }}
          />
          <SingleTimeseries
            data={
              machines.data
                ?.map((stat) => ({
                  date: new Date(stat.created_at * 1000),
                  value: stat.cpu_percent ?? 0,
                }))
                .slice(0, 10) ?? []
            }
          />
          <SingleTimeseries
            data={
              machines.data
                ?.map((stat) => ({
                  date: new Date(stat.created_at * 1000),
                  value: stat.cpu_percent ?? 0,
                }))
                .slice(0, 10) ?? []
            }
          />
          <StackedTimeseries
            data={
              (
                processes.data?.filter((stat) => stat.cpu_percent !== null) ??
                []
              ).map((stat) => ({
                date: new Date((stat.created_at ?? 0) * 1000),
                value: stat.cpu_percent ?? 0,
                id: stat.name + stat.machine_id + stat.pid,
              })) ?? []
            }
            labels={{
              title: "CPU Usage",
              x: "Time",
              y: "CPU Usage (%)",
            }}
          />
          <AddRoboGraphic from={from} to={to ?? undefined} />
        </div>
      </div>
    </main>
  );
}
