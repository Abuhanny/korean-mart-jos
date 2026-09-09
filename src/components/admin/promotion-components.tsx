"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { promotionSchema, type PromotionInput } from "@/lib/validations/admin";
import { createPromotion, updatePromotion, deletePromotion } from "@/lib/actions/admin-promotions";
import type { Promotion } from "@/lib/types";

export function PromotionFormDialog({ promotion, trigger }: { promotion?: Promotion; trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!promotion;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PromotionInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: promotion
      ? {
          title: promotion.title,
          description: promotion.description ?? "",
          image_url: promotion.image_url ?? "",
          discount_text: promotion.discount_text ?? "",
          start_date: promotion.start_date ?? "",
          end_date: promotion.end_date ?? "",
          is_active: promotion.is_active,
        }
      : { is_active: true },
  });

  const onSubmit = async (values: PromotionInput) => {
    setSubmitting(true);
    const result = isEdit ? await updatePromotion(promotion!.id, values) : await createPromotion(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(isEdit ? "Promotion updated" : "Promotion created");
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Plus className="h-4 w-4" /> Add Promotion</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? "Edit Promotion" : "Add Promotion"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} className="mt-1.5" placeholder="Weekend Ramen Special" />
            {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} className="mt-1.5" />
          </div>
          <div>
            <Label>Discount Text</Label>
            <Input {...register("discount_text")} className="mt-1.5" placeholder="Buy 2 Get 1 Free" />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input {...register("image_url")} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register("start_date")} className="mt-1.5" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" {...register("end_date")} className="mt-1.5" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-accent/40 p-3">
            <span className="text-sm">Active</span>
            <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Promotion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PromotionRow({ promotion }: { promotion: Promotion }) {
  const onDelete = async () => {
    if (!confirm(`Delete "${promotion.title}"?`)) return;
    const result = await deletePromotion(promotion.id);
    if (!result.success) toast.error(result.error ?? "Failed to delete");
    else toast.success("Promotion deleted");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{promotion.title}</p>
          <Badge variant={promotion.is_active ? "success" : "outline"}>{promotion.is_active ? "Active" : "Inactive"}</Badge>
        </div>
        {promotion.discount_text && <p className="text-sm text-secondary">{promotion.discount_text}</p>}
        {(promotion.start_date || promotion.end_date) && (
          <p className="text-xs text-muted-foreground">{promotion.start_date ?? "—"} to {promotion.end_date ?? "—"}</p>
        )}
      </div>
      <div className="flex gap-2">
        <PromotionFormDialog
          promotion={promotion}
          trigger={
            <button className="rounded-full p-2 hover:bg-accent" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
          }
        />
        <button onClick={onDelete} className="rounded-full p-2 hover:bg-accent" aria-label="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
