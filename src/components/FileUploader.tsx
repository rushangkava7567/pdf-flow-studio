import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  acceptedFiles?: string[];
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

export const FileUploader = ({
  acceptedFiles = [".pdf"],
  maxFiles = 10,
  onFilesChange,
  className,
}: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedFiles.includes(extension);
    }).slice(0, maxFiles - files.length);

    if (validFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn("upload-zone", isDragging && "dragging")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFiles.join(",")}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Drop your files here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted formats: {acceptedFiles.join(", ")}
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-pulse">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <span className="text-sm font-medium">Uploading...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {files.length > 0 && !isUploading && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border animate-fade-in"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-tool-secure" />
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && !isUploading && (
        <Button variant="hero" size="lg" className="w-full">
          Convert {files.length} {files.length === 1 ? "File" : "Files"}
        </Button>
      )}
    </div>
  );
};
