"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { activitySchema, type ActivityInput } from "@/lib/validations/admin";
import { createActivity, updateActivity } from "@/lib/actions/admin-activities";
import { slugify } from "@/lib/utils";
import type { Activity } from "@/lib/types";

export function ActivityFormDialog({ activity, trigger }: { activity?: Activity; trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!activity;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          title: activity.title,
          slug: activity.slug,
          description: activity.description ?? "",
          image_url: activity.image_url ?? "",
          price: activity.price,
          event_date: activity.event_date,
          start_time: activity.start_time,
          end_time: activity.end_time ?? "",
          capacity: activity.capacity,
          location: activity.location ?? "",
          is_active: activity.is_active,
          is_featured: activity.is_featured,
          status: activity.status,
        }
      : { price: 10000, capacity: 10, is_active: true, is_featured: false, status: "open" },
  });

  const title = watch("title");
  React.useEffect(() => {
    if (!isEdit && title) setValue("slug", slugify(title));
  }, [title, isEdit, setValue]);

  const onSubmit = async (values: ActivityInput) => {
    setSubmitting(true);
    const result = isEdit ? await updateActivity(activity!.id, values) : await createActivity(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(isEdit ? "Activity updated" : "Activity created");
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Plus className="h-4 w-4" /> Add Activity</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Activity" : "Add Activity"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} className="mt-1.5" placeholder="Korean Ramen Night" />
            {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...register("slug")} className="mt-1.5" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} className="mt-1.5" />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input {...register("image_url")} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" {...register("event_date")} className="mt-1.5" />
              {errors.event_date && <p className="mt-1 text-sm text-destructive">{errors.event_date.message}</p>}
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" {...register("start_time")} className="mt-1.5" />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" {...register("end_time")} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Price (₦)</Label>
              <Input type="number" {...register("price")} className="mt-1.5" />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input type="number" {...register("capacity")} className="mt-1.5" />
            </div>
            <div>
              <Label>Location</Label>
              <Input {...register("location")} className="mt-1.5" placeholder="In-store" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select defaultValue={activity?.status ?? "open"} onValueChange={(v) => setValue("status", v as any)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-accent/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Featured</span>
              <Switch checked={watch("is_featured")} onCheckedChange={(v) => setValue("is_featured", v)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Activity"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
