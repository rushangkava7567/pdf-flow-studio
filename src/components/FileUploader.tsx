import { useCallback, useState, useEffect } from "react";
import { Upload, FileText, X, CheckCircle, Download, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePdfConversion, ConversionOperation } from "@/hooks/usePdfConversion";

interface FileUploaderProps {
  acceptedFiles?: string[];
  maxFiles?: number;
  toolId?: string;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

export const FileUploader = ({
  acceptedFiles = [".pdf"],
  maxFiles = 10,
  toolId,
  onFilesChange,
  className,
}: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pageRanges, setPageRanges] = useState("1");
  const [password, setPassword] = useState("");
  
  const { isConverting, progress, result, convert, download, reset } = usePdfConversion();

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
  }, [files, maxFiles, acceptedFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, [files, maxFiles, acceptedFiles]);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedFiles.includes(extension);
    }).slice(0, maxFiles - files.length);

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    reset();
  };

  const handleConvert = () => {
    if (!toolId || files.length === 0) return;
    
    const options: { pageRanges?: string; password?: string } = {};
    if (toolId === "split-pdf") options.pageRanges = pageRanges;
    if (toolId === "secure-pdf") options.password = password;
    
    convert(files, toolId as ConversionOperation, options);
  };

  const handleReset = () => {
    setFiles([]);
    reset();
    setPageRanges("1");
    setPassword("");
  };

  const showSplitOptions = toolId === "split-pdf" && files.length > 0 && !result;
  const showSecureOptions = toolId === "secure-pdf" && files.length > 0 && !result;

  return (
    <div className={cn("space-y-4", className)}>
      {!result && (
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
            disabled={isConverting}
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
      )}

      {isConverting && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <span className="text-sm font-medium">Converting your file...</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
        </div>
      )}

      {files.length > 0 && !isConverting && !result && (
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

      {/* Split PDF Options */}
      {showSplitOptions && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <Label htmlFor="pageRanges" className="text-sm font-medium">
            Page Ranges (e.g., "1-3, 5, 7-9")
          </Label>
          <Input
            id="pageRanges"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
            placeholder="1-3, 5, 7-9"
            className="bg-background"
          />
        </div>
      )}

      {/* Secure PDF Options */}
      {showSecureOptions && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Set Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to protect PDF"
            className="bg-background"
          />
        </div>
      )}

      {files.length > 0 && !isConverting && !result && (
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full"
          onClick={handleConvert}
          disabled={toolId === "secure-pdf" && !password}
        >
          Convert {files.length} {files.length === 1 ? "File" : "Files"}
        </Button>
      )}

      {/* Success State */}
      {result && (
        <div className="bg-card rounded-xl p-8 border border-tool-secure/30 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-tool-secure/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-tool-secure" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Conversion Complete!
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your file is ready for download
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" onClick={download} className="gap-2">
              <Download className="h-5 w-5" />
              Download {result.filename}
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Convert Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
