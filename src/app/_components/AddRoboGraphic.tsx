"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "r/components/ui/dialog";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "r/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "r/components/ui/form";
import { Button } from "r/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "r/components/ui/select";
import ContructGraph from "./ContructGraph";
import { Checkbox } from "rbrgs/components/ui/checkbox";
import { Label } from "r/components/ui/label";
import { api } from "rbrgs/trpc/react";

const formSchema = z.object({
  labels: z.object({
    title: z.string().optional(),
    x: z.string().optional(),
    y: z.string().optional(),
  }),
  query: z.object({
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
      customs: z.array(z.object({ machine_id: z.string() })),
    }),
    stat: z.enum([
      "cpu_percent",
      "memory_percent",
      "gpu_percent",
      "gpu_memory",
    ]),
    // from: z.date(),
    // to: z.date().optional(),
    __new_process: z.object({
      machine_id: z.string(),
      name: z.string(),
      pid: z.number(),
    }),
  }),
});

export default function AddRoboGraphic({
  from,
  to,
}: {
  from: Date;
  to?: Date;
}) {
  const [open, setOpen] = useState(true);

  const { data: machinesProcesses } =
    api.metrics.getProcessesGroupedByMachineIdAndPIDName.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: {
        process: {
          all: false,
          customs: [],
        },
        machine: {
          customs: [],
        },
        stat: "cpu_percent",
      },
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(op) => {
        setOpen(op);
      }}
    >
      <DialogTrigger>
        <div className="ml-16 flex h-60 w-[600] items-center justify-center rounded-xl border-2 border-dotted border-gray-600 bg-gray-50 hover:cursor-pointer hover:bg-gray-100">
          <p className="text-xl font-semibold">Add RoboGraphic2</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[1000px]">
        <>
          <DialogHeader>
            <DialogTitle>Add RoboGraphic</DialogTitle>
          </DialogHeader>

          <div className="w-11/12">
            <ContructGraph
              query={{ ...form.getValues().query, from, to }}
              labels={form.getValues().labels}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <>
                <FormField
                  control={form.control}
                  name="labels.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={"title-graph"}>Title</FormLabel>
                      <FormControl>
                        <Input
                          id={"title-graph"}
                          {...field}
                          placeholder="Title"
                        />
                      </FormControl>
                      <FormDescription>The title of the graph</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="labels.x"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={"x-graph"}>X Axis</FormLabel>
                        <FormControl>
                          <Input
                            id={"x-graph"}
                            {...field}
                            placeholder="X Axis"
                          />
                        </FormControl>
                        <FormDescription>The x axis label</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labels.y"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={"y-graph"}>Y Axis</FormLabel>
                        <FormControl>
                          <Input
                            id={"y-graph"}
                            {...field}
                            placeholder="Y Axis"
                          />
                        </FormControl>
                        <FormDescription>The y axis label</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="query.stat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={"stat-graph"}>Stat</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>{field.value}</SelectTrigger>
                          <SelectContent>
                            {[
                              "cpu_percent",
                              "memory_percent",
                              "gpu_percent",
                              "gpu_memory",
                            ].map((stat) => (
                              <SelectItem key={stat} value={stat}>
                                {stat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>The stat to display</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-lg font-semibold">Process</h3>
                  <FormField
                    control={form.control}
                    name="query.process.all"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={field.value}
                              onClick={() => field.onChange(!field.value)}
                              id="all-processes"
                            >
                              All
                            </Checkbox>
                            <Label htmlFor="all-processes">All processes</Label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="query.__new_process"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {/** Select machine_id then process in it */}
                        <div>
                          <h5 className="text-lg font-semibold">
                            Add process record query
                          </h5>
                          <div className="flex items-center gap-4">
                            <div className="w-1/2">
                              <Label htmlFor="machine_id-select">Machine</Label>
                              <Select
                                value={field.value?.machine_id ?? ""}
                                onValueChange={(val) =>
                                  field.onChange({
                                    ...field.value,
                                    machine_id: val,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  {field.value?.machine_id ?? "Select machine"}
                                </SelectTrigger>
                                <SelectContent>
                                  {machinesProcesses?.map((machine) => (
                                    <SelectItem
                                      key={machine.machine_id}
                                      value={machine.machine_id}
                                    >
                                      {machine.machine_id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-1/2">
                              <Label htmlFor="process-name+pid">Process</Label>
                              <Select
                                value={
                                  field.value?.name + "$" + field.value?.pid
                                }
                                onValueChange={(val) =>
                                  field.onChange({
                                    ...field.value,
                                    name: val.split("$")[0],
                                    pid: Number(val.split("$")[1]!),
                                  })
                                }
                              >
                                <SelectTrigger>
                                  {field.value?.name + "$" + field.value?.pid}
                                </SelectTrigger>
                                <SelectContent>
                                  {machinesProcesses
                                    ?.find(
                                      (machine) =>
                                        machine.machine_id ===
                                        field.value?.machine_id,
                                    )
                                    ?.ids.map((process) => (
                                      <SelectItem key={process} value={process}>
                                        {process.replace("$", "$")}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={() => {
                                form.setValue("query.process.customs", [
                                  ...form.getValues().query.process.customs,
                                  field.value,
                                ]);
                                field.onChange(null);
                              }}
                              className="self-end"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="query.process.customs"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {/** Select machine_id then process in it */}
                        <>
                          {field.value.map((process, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <p>{process.machine_id}</p>
                              <p>{process.name}</p>
                              <p>{process.pid}</p>
                              <Button
                                onClick={() => {
                                  form.setValue(
                                    "query.process.customs",
                                    field.value.filter((_, idx) => idx !== i),
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit</Button>
              </>
            </form>
          </Form>
        </>
      </DialogContent>
    </Dialog>
  );
}
