import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ConversionOperation = 
  | "pdf-to-word"
  | "pdf-to-excel"
  | "word-to-pdf"
  | "image-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "secure-pdf";

interface ConversionOptions {
  pageRanges?: string;
  password?: string;
}

export function usePdfConversion() {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const convert = async (
    files: File[],
    operation: ConversionOperation,
    options?: ConversionOptions
  ) => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsConverting(true);
    setProgress(10);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("operation", operation);
      
      for (const file of files) {
        formData.append("files", file);
      }

      if (options?.pageRanges) {
        formData.append("pageRanges", options.pageRanges);
      }
      if (options?.password) {
        formData.append("password", options.password);
      }

      setProgress(30);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pdf-convert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Conversion failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || getDefaultFilename(operation);

      setProgress(100);
      setResult({ blob, filename });
      toast.success("Conversion complete!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error(error instanceof Error ? error.message : "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const download = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    isConverting,
    progress,
    result,
    convert,
    download,
    reset,
  };
}

function getDefaultFilename(operation: ConversionOperation): string {
  const filenames: Record<ConversionOperation, string> = {
    "pdf-to-word": "converted.txt",
    "pdf-to-excel": "converted.csv",
    "word-to-pdf": "converted.pdf",
    "image-to-pdf": "converted.pdf",
    "merge-pdf": "merged.pdf",
    "split-pdf": "split.pdf",
    "compress-pdf": "compressed.pdf",
    "secure-pdf": "secured.pdf",
  };
  return filenames[operation];
}
