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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { experienceSchema, type ExperienceInput } from "@/lib/validations/admin";
import { createExperience, updateExperience } from "@/lib/actions/admin-experiences";
import { slugify } from "@/lib/utils";
import type { Experience } from "@/lib/types";

export function ExperienceFormDialog({ experience, trigger }: { experience?: Experience; trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!experience;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience
      ? {
          name: experience.name,
          slug: experience.slug,
          description: experience.description ?? "",
          image_url: experience.image_url ?? "",
          default_price: experience.default_price,
          default_duration_minutes: experience.default_duration_minutes,
          default_capacity: experience.default_capacity,
          is_active: experience.is_active,
          is_featured: experience.is_featured,
        }
      : { default_price: 5000, default_duration_minutes: 90, default_capacity: 8, is_active: true, is_featured: false },
  });

  const name = watch("name");
  React.useEffect(() => {
    if (!isEdit && name) setValue("slug", slugify(name));
  }, [name, isEdit, setValue]);

  const onSubmit = async (values: ExperienceInput) => {
    setSubmitting(true);
    const result = isEdit ? await updateExperience(experience!.id, values) : await createExperience(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(isEdit ? "Experience updated" : "Experience created");
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Plus className="h-4 w-4" /> Add Experience</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Experience" : "Add Experience"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} className="mt-1.5" placeholder="Eat & Cook" />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
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
              <Label>Default Price (₦)</Label>
              <Input type="number" {...register("default_price")} className="mt-1.5" />
            </div>
            <div>
              <Label>Duration (mins)</Label>
              <Input type="number" {...register("default_duration_minutes")} className="mt-1.5" />
            </div>
            <div>
              <Label>Default Capacity</Label>
              <Input type="number" {...register("default_capacity")} className="mt-1.5" />
            </div>
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
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Experience"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
