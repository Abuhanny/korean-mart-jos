"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sessionSchema, type SessionInput } from "@/lib/validations/admin";
import { createSession } from "@/lib/actions/admin-experiences";
import type { Experience } from "@/lib/types";

export function SessionFormDialog({ experience }: { experience: Experience }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      experience_id: experience.id,
      capacity: experience.default_capacity,
      price: experience.default_price,
    },
  });

  const onSubmit = async (values: SessionInput) => {
    setSubmitting(true);
    const result = await createSession({ ...values, experience_id: experience.id });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success("Session added");
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> Add Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New session for {experience.name}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("session_date")} className="mt-1.5" />
            {errors.session_date && <p className="mt-1 text-sm text-destructive">{errors.session_date.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input type="time" {...register("start_time")} className="mt-1.5" />
              {errors.start_time && <p className="mt-1 text-sm text-destructive">{errors.start_time.message}</p>}
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" {...register("end_time")} className="mt-1.5" />
              {errors.end_time && <p className="mt-1 text-sm text-destructive">{errors.end_time.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Capacity</Label>
              <Input type="number" {...register("capacity")} className="mt-1.5" />
            </div>
            <div>
              <Label>Price (₦)</Label>
              <Input type="number" {...register("price")} className="mt-1.5" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add Session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
