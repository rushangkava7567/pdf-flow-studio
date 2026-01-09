import { 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Merge, 
  Scissors, 
  Minimize2, 
  Shield, 
  Workflow,
  FileType
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  path: string;
  acceptedFiles: string[];
}

export const tools: Tool[] = [
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents to editable Word files",
    icon: FileText,
    color: "text-tool-pdf-word",
    bgColor: "bg-tool-pdf-word/10",
    path: "/tools/pdf-to-word",
    acceptedFiles: [".pdf"],
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract tables from PDF to Excel spreadsheets",
    icon: FileSpreadsheet,
    color: "text-tool-pdf-excel",
    bgColor: "bg-tool-pdf-excel/10",
    path: "/tools/pdf-to-excel",
    acceptedFiles: [".pdf"],
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileType,
    color: "text-tool-word-pdf",
    bgColor: "bg-tool-word-pdf/10",
    path: "/tools/word-to-pdf",
    acceptedFiles: [".doc", ".docx"],
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert images to PDF documents",
    icon: Image,
    color: "text-tool-image-pdf",
    bgColor: "bg-tool-image-pdf/10",
    path: "/tools/image-to-pdf",
    acceptedFiles: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    icon: Merge,
    color: "text-tool-merge",
    bgColor: "bg-tool-merge/10",
    path: "/tools/merge-pdf",
    acceptedFiles: [".pdf"],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Split a PDF into multiple separate files",
    icon: Scissors,
    color: "text-tool-split",
    bgColor: "bg-tool-split/10",
    path: "/tools/split-pdf",
    acceptedFiles: [".pdf"],
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size without losing quality",
    icon: Minimize2,
    color: "text-tool-compress",
    bgColor: "bg-tool-compress/10",
    path: "/tools/compress-pdf",
    acceptedFiles: [".pdf"],
  },
  {
    id: "secure-pdf",
    name: "Secure PDF",
    description: "Password protect and encrypt your PDFs",
    icon: Shield,
    color: "text-tool-secure",
    bgColor: "bg-tool-secure/10",
    path: "/tools/secure-pdf",
    acceptedFiles: [".pdf"],
  },
  {
    id: "workflow",
    name: "Workflow Builder",
    description: "Create custom PDF processing workflows",
    icon: Workflow,
    color: "text-tool-workflow",
    bgColor: "bg-tool-workflow/10",
    path: "/workflow",
    acceptedFiles: [".pdf"],
  },
];

export const getToolById = (id: string) => tools.find(tool => tool.id === id);
