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
import { productSchema, type ProductInput } from "@/lib/validations/admin";
import { createProduct, updateProduct } from "@/lib/actions/admin-products";
import { slugify } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";

export function ProductFormDialog({
  categories,
  product,
  trigger,
}: {
  categories: Category[];
  product?: Product;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: product.price,
          compare_at_price: product.compare_at_price ?? undefined,
          category_id: product.category_id ?? undefined,
          sku: product.sku ?? "",
          image_url: product.image_url ?? "",
          in_stock: product.in_stock,
          stock_quantity: product.stock_quantity ?? undefined,
          is_featured: product.is_featured,
          is_new_arrival: product.is_new_arrival,
          is_active: product.is_active,
        }
      : { in_stock: true, is_featured: false, is_new_arrival: false, is_active: true },
  });

  const name = watch("name");
  React.useEffect(() => {
    if (!isEdit && name) setValue("slug", slugify(name));
  }, [name, isEdit, setValue]);

  const onSubmit = async (values: ProductInput) => {
    setSubmitting(true);
    const result = isEdit ? await updateProduct(product!.id, values) : await createProduct(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(isEdit ? "Product updated" : "Product created");
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (₦)</Label>
              <Input type="number" step="0.01" {...register("price")} className="mt-1.5" />
              {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label>Compare-at Price (₦)</Label>
              <Input type="number" step="0.01" {...register("compare_at_price")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select
              defaultValue={product?.category_id ?? undefined}
              onValueChange={(v) => setValue("category_id", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU (optional)</Label>
              <Input {...register("sku")} className="mt-1.5" />
            </div>
            <div>
              <Label>Stock Quantity (optional)</Label>
              <Input type="number" {...register("stock_quantity")} className="mt-1.5" placeholder="Leave blank if untracked" />
            </div>
          </div>
          <div>
            <Label>Image URL</Label>
            <Input {...register("image_url")} className="mt-1.5" placeholder="https://..." />
            <p className="mt-1 text-xs text-muted-foreground">
              Upload the image to Supabase Storage (product-images bucket) and paste the public URL here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-accent/40 p-3">
            <ToggleField label="In Stock" name="in_stock" watch={watch} setValue={setValue} />
            <ToggleField label="Featured" name="is_featured" watch={watch} setValue={setValue} />
            <ToggleField label="New Arrival" name="is_new_arrival" watch={watch} setValue={setValue} />
            <ToggleField label="Active" name="is_active" watch={watch} setValue={setValue} />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToggleField({
  label,
  name,
  watch,
  setValue,
}: {
  label: string;
  name: keyof ProductInput;
  watch: any;
  setValue: any;
}) {
  const value = watch(name);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={!!value} onCheckedChange={(v) => setValue(name, v)} />
    </div>
  );
}
