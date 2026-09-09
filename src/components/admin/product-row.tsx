"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { toggleProductField, deleteProduct } from "@/lib/actions/admin-products";
import { formatNaira } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";

export function ProductRow({ product, categories }: { product: Product; categories: Category[] }) {
  const [pending, setPending] = React.useState(false);

  const toggle = async (field: "in_stock" | "is_featured" | "is_new_arrival", value: boolean) => {
    setPending(true);
    const result = await toggleProductField(product.id, field, value);
    setPending(false);
    if (!result.success) toast.error(result.error ?? "Failed to update");
  };

  const onDelete = async () => {
    if (!confirm(`Remove "${product.name}" from the storefront?`)) return;
    const result = await deleteProduct(product.id);
    if (!result.success) toast.error(result.error ?? "Failed to delete");
    else toast.success("Product removed");
  };

  return (
    <tr className="border-b border-border/60">
      <td className="py-3 pr-4">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
      </td>
      <td className="py-3 pr-4">{formatNaira(product.price)}</td>
      <td className="py-3 pr-4">
        <Switch checked={product.in_stock} onCheckedChange={(v) => toggle("in_stock", v)} disabled={pending} />
      </td>
      <td className="py-3 pr-4">
        <Switch checked={product.is_featured} onCheckedChange={(v) => toggle("is_featured", v)} disabled={pending} />
      </td>
      <td className="py-3 pr-4">
        <Switch checked={product.is_new_arrival} onCheckedChange={(v) => toggle("is_new_arrival", v)} disabled={pending} />
      </td>
      <td className="py-3 pr-4">
        {product.stock_quantity !== null ? (
          <Badge variant={product.stock_quantity <= 5 ? "warning" : "outline"}>{product.stock_quantity}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Not tracked</span>
        )}
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-2">
          <ProductFormDialog
            categories={categories}
            product={product}
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
      </td>
    </tr>
  );
}
