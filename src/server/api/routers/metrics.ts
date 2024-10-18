import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "rbrgs/server/api/trpc";

export const metricsRouter = createTRPCRouter({
  getStatics: publicProcedure.query(async ({ ctx }) => {
    const statics = await ctx.db.static_machines.findMany({
      distinct: ["machine_id"],
      orderBy: { created_at: "desc" },
    });
    return statics;
  }),
  getAllMachineStats: publicProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.machines.findMany({
        orderBy: { created_at: "desc" },
        where: {
          created_at: {
            gte: input.from.getTime() / 1000,
            ...{
              ...(input.to && { lte: input.to.getTime() / 1000 }),
            },
          },
        },
      });
      return stats;
    }),
  getAllProcessStats: publicProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.processes.findMany({
        orderBy: { created_at: "desc" },
        where: {
          created_at: {
            gte: input.from.getTime() / 1000,
            ...{
              ...(input.to && { lte: input.to.getTime() / 1000 }),
            },
          },
        },
      });
      return stats;
    }),
  customGraph: publicProcedure
    .input(
      z.object({
        process: z.object({
          all: z.boolean(),
          customs: z.array(
            z.object({
              name: z.string(),
              machine_id: z.string(),
              pid: z.number(),
            }),
          ),
        }),
        machine: z.object({
          customs: z.array(
            z.object({
              machine_id: z.string(),
            }),
          ),
        }),
        stat: z.union([
          z.literal("cpu_percent"),
          z.literal("memory_percent"),
          z.literal("memory"),
          z.literal("gpu_percent"),
          z.literal("gpu_memory"),
        ]),
        from: z.date(),
        to: z.date().default(new Date()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const processes = input.process.customs;
      const machines = input.machine.customs;
      const stats = [] as { date: number; value: number; id: string }[];
      if (input.process.all) {
        const processStats = await ctx.db.processes.findMany({
          orderBy: { created_at: "desc" },
          where: {
            created_at: {
              gte: input.from.getTime() / 1000,
              ...{
                ...(input.to && { lte: input.to.getTime() / 1000 }),
              },
            },
          },
        });
        processStats.forEach((stat) => {
          stats.push({
            date: (stat.created_at ?? 0) * 1000,
            value:
              (input.stat === "cpu_percent"
                ? stat.cpu_percent
                : input.stat === "memory_percent"
                  ? stat.memory_percent
                  : input.stat === "memory"
                    ? -1
                    : input.stat === "gpu_percent"
                      ? stat.gpu_memory_percent
                      : input.stat === "gpu_memory"
                        ? stat.gpu_memory
                        : -1) ?? 0,
            id: stat.name + stat.machine_id + stat.pid,
          });
        });
      } else if (processes.length > 0) {
        const processStats = await ctx.db.processes.findMany({
          orderBy: { created_at: "desc" },
          where: {
            created_at: {
              gte: input.from.getTime() / 1000,
              ...{
                ...(input.to && { lte: input.to.getTime() / 1000 }),
              },
            },
            OR: processes.map((process) => ({
              name: process.name,
              machine_id: process.machine_id,
              pid: process.pid,
            })),
          },
        });
        processStats.forEach((stat) => {
          stats.push({
            date: (stat.created_at ?? 0) * 1000,
            value:
              (input.stat === "cpu_percent"
                ? stat.cpu_percent
                : input.stat === "memory_percent"
                  ? stat.memory_percent
                  : input.stat === "memory"
                    ? -1
                    : input.stat === "gpu_percent"
                      ? stat.gpu_memory_percent
                      : input.stat === "gpu_memory"
                        ? stat.gpu_memory
                        : -1) ?? 0,
            id: stat.name + stat.machine_id + stat.pid,
          });
        });
      }

      if (machines.length > 0) {
        const machineStats = await ctx.db.machines.findMany({
          orderBy: { created_at: "desc" },
          where: {
            created_at: {
              gte: input.from.getTime() / 1000,
              ...{
                ...(input.to && { lte: input.to.getTime() / 1000 }),
              },
            },
            AND: machines.map((machine) => ({
              machine_id: machine.machine_id,
            })),
          },
        });
        machineStats.forEach((stat) => {
          stats.push({
            date: stat.created_at * 1000,
            value:
              (input.stat === "cpu_percent"
                ? stat.cpu_percent
                : input.stat === "memory_percent"
                  ? stat.memory_percent
                  : input.stat === "memory"
                    ? -1
                    : input.stat === "gpu_percent"
                      ? stat.gpu_memory_percent
                      : input.stat === "gpu_memory"
                        ? -1
                        : -1) ?? 0,
            id: stat.machine_id ?? "A",
          });
        });
      }
      return stats;
    }),
  getProcessesGroupedByMachineIdAndPIDName: publicProcedure.query(
    async ({ ctx }) => {
      const processes = await ctx.db.processes.findMany({
        distinct: ["machine_id", "pid", "name"],
      });
      console.log(processes, "ASDASDQWE");
      const machine_ids = processes.map((process) => process.machine_id);
      // unique machine_ids
      const unique_machine_ids = Array.from(new Set(machine_ids));
      const groupedProcesses = {} as Record<string, Set<string>>;
      unique_machine_ids.forEach((machine_id) => {
        groupedProcesses[machine_id] = new Set();
      });

      processes.forEach((process) => {
        if (
          process.machine_id === undefined ||
          !(process.machine_id in groupedProcesses)
        ) {
          return;
        }
        groupedProcesses[process.machine_id]!.add(
          process.name + "$" + process.pid,
        );
      });

      const res = Object.entries(groupedProcesses).map(
        ([machine_id, names]) => ({
          machine_id,
          ids: Array.from(names),
        }),
      );

      return res;
    },
  ),
});
