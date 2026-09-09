"use client";

import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { deleteCategory } from "@/lib/actions/admin-categories";
import type { Category } from "@/lib/types";

export function CategoryRow({ category }: { category: Category }) {
  const onDelete = async () => {
    if (!confirm(`Delete "${category.name}"? Products in this category will become uncategorized.`)) return;
    const result = await deleteCategory(category.id);
    if (!result.success) toast.error(result.error ?? "Failed to delete");
    else toast.success("Category deleted");
  };

  return (
    <tr className="border-b border-border/60">
      <td className="py-3 pr-4 font-medium">{category.name}</td>
      <td className="py-3 pr-4 text-muted-foreground">{category.slug}</td>
      <td className="py-3 pr-4 text-muted-foreground">{category.sort_order}</td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-2">
          <CategoryFormDialog
            category={category}
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
