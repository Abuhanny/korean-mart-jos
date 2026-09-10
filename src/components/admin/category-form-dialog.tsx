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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { categorySchema, type CategoryInput } from "@/lib/validations/admin";
import { createCategory, updateCategory } from "@/lib/actions/admin-categories";
import { ImageUpload } from "@/components/admin/image-upload";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryFormDialog({ category, trigger }: { category?: Category; trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          image_url: category.image_url ?? "",
          sort_order: category.sort_order,
        }
      : { sort_order: 0 },
  });

  const name = watch("name");
  React.useEffect(() => {
    if (!isEdit && name) setValue("slug", slugify(name));
  }, [name, isEdit, setValue]);

  const onSubmit = async (values: CategoryInput) => {
    setSubmitting(true);
    const result = isEdit ? await updateCategory(category!.id, values) : await createCategory(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(isEdit ? "Category updated" : "Category created");
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} className="mt-1.5" />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...register("slug")} className="mt-1.5" />
            {errors.slug && <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} className="mt-1.5" />
          </div>
          <ImageUpload
            label="Category Image (optional)"
            folder="categories"
            value={watch("image_url")}
            onChange={(url) => setValue("image_url", url ?? "")}
          />
          <div>
            <Label>Sort Order</Label>
            <Input type="number" {...register("sort_order")} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
