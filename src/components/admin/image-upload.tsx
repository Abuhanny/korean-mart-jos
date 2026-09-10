"use client";

import * as React from "react";
import { toast } from "sonner";
import { UploadCloud, X, Loader2, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — matches the bucket's file_size_limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type MediaFolder = "products" | "categories" | "experiences" | "activities" | "promotions" | "homepage";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: MediaFolder;
  label?: string;
}

// Uploads directly from the browser to the `media` Supabase Storage bucket.
// Storage RLS (see supabase/migrations/0004_storage.sql) only allows this
// for logged-in staff/admin, so this component is safe to use anywhere in
// the admin dashboard without extra checks here.
export function ImageUpload({ value, onChange, folder, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlDraft, setUrlDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please choose a JPEG, PNG, WEBP, or GIF image.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "Image is too large — please choose one under 5MB.";
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setShowUrlInput((s) => !s)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <LinkIcon className="h-3 w-3" /> {showUrlInput ? "Hide URL field" : "Paste a URL instead"}
        </button>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop an image, or <span className="font-medium text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP, or GIF — up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
      />

      {showUrlInput && (
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="https://..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (urlDraft.trim()) {
                onChange(urlDraft.trim());
                setUrlDraft("");
                setShowUrlInput(false);
              }
            }}
          >
            Use URL
          </Button>
        </div>
      )}
    </div>
  );
}
