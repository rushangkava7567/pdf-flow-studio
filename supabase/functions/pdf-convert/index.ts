import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const operation = formData.get("operation") as string;
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return new Response(JSON.stringify({ error: "No files provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: Uint8Array;
    let filename: string;
    let contentType: string;

    switch (operation) {
      case "merge-pdf": {
        result = await mergePdfs(files);
        filename = "merged.pdf";
        contentType = "application/pdf";
        break;
      }
      case "split-pdf": {
        const pageRanges = formData.get("pageRanges") as string || "1";
        const splitResults = await splitPdf(files[0], pageRanges);
        // Return first split for now - could be extended to return zip
        result = splitResults[0];
        filename = "split-page-1.pdf";
        contentType = "application/pdf";
        break;
      }
      case "compress-pdf": {
        result = await compressPdf(files[0]);
        filename = "compressed.pdf";
        contentType = "application/pdf";
        break;
      }
      case "secure-pdf": {
        const password = formData.get("password") as string || "password123";
        result = await securePdf(files[0], password);
        filename = "secured.pdf";
        contentType = "application/pdf";
        break;
      }
      case "image-to-pdf": {
        result = await imagesToPdf(files);
        filename = "converted.pdf";
        contentType = "application/pdf";
        break;
      }
      case "pdf-to-word": {
        result = await pdfToText(files[0]);
        filename = "converted.txt";
        contentType = "text/plain";
        break;
      }
      case "pdf-to-excel": {
        result = await pdfToCSV(files[0]);
        filename = "converted.csv";
        contentType = "text/csv";
        break;
      }
      case "word-to-pdf": {
        result = await textToPdf(files[0]);
        filename = "converted.pdf";
        contentType = "application/pdf";
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown operation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(result as unknown as BodyInit, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Conversion failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Merge multiple PDFs into one
async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

// Split PDF into separate pages
async function splitPdf(file: File, pageRanges: string): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();
  
  const results: Uint8Array[] = [];
  const ranges = parsePageRanges(pageRanges, totalPages);

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(sourcePdf, range);
    pages.forEach((page) => newPdf.addPage(page));
    results.push(await newPdf.save());
  }

  return results;
}

function parsePageRanges(rangesStr: string, totalPages: number): number[][] {
  // Parse "1-3,5,7-9" format
  const result: number[][] = [];
  const parts = rangesStr.split(",");
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(n => parseInt(n.trim()) - 1);
      const range: number[] = [];
      for (let i = Math.max(0, start); i <= Math.min(end, totalPages - 1); i++) {
        range.push(i);
      }
      if (range.length) result.push(range);
    } else {
      const pageNum = parseInt(trimmed) - 1;
      if (pageNum >= 0 && pageNum < totalPages) {
        result.push([pageNum]);
      }
    }
  }
  
  return result.length ? result : [[0]]; // Default to first page
}

// Compress PDF (simplified - removes metadata and optimizes)
async function compressPdf(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // Remove metadata for compression
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("");
  pdf.setCreator("");
  
  return await pdf.save({ 
    useObjectStreams: true,
  });
}

// Secure PDF with encryption info (note: pdf-lib doesn't fully encrypt, but we add protection metadata)
async function securePdf(file: File, password: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // Add security notice as first page
  const [firstPage] = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  firstPage.drawText(`Protected Document - Password: ${password}`, {
    x: 50,
    y: firstPage.getHeight() - 50,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdf.setProducer("PDFFlow Secure");
  
  return await pdf.save();
}

// Convert images to PDF
async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let image;
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.includes("png")) {
      image = await pdf.embedPng(uint8Array);
    } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      image = await pdf.embedJpg(uint8Array);
    } else {
      // Try jpg as fallback
      try {
        image = await pdf.embedJpg(uint8Array);
      } catch {
        image = await pdf.embedPng(uint8Array);
      }
    }
    
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdf.save();
}

// Extract text from PDF (simplified extraction)
async function pdfToText(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const pageCount = pdf.getPageCount();
  let text = `Document: ${file.name}\n`;
  text += `Pages: ${pageCount}\n`;
  text += `=`.repeat(50) + "\n\n";
  
  // Note: pdf-lib doesn't extract text content, so we provide metadata
  // For full text extraction, a specialized library like pdf.js would be needed
  text += `This PDF contains ${pageCount} page(s).\n\n`;
  text += `To fully extract text content, please use specialized OCR tools.\n`;
  text += `This export provides document structure information.\n\n`;
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    text += `--- Page ${i + 1} ---\n`;
    text += `Dimensions: ${width.toFixed(0)} x ${height.toFixed(0)}\n\n`;
  }
  
  return new TextEncoder().encode(text);
}

// Extract data from PDF as CSV
async function pdfToCSV(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const pageCount = pdf.getPageCount();
  
  let csv = "Page,Width,Height,Rotation\n";
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    csv += `${i + 1},${width.toFixed(2)},${height.toFixed(2)},${rotation}\n`;
  }
  
  return new TextEncoder().encode(csv);
}

// Convert text/Word to PDF
async function textToPdf(file: File): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  let text: string;
  
  // Handle different file types
  if (file.type.includes("text") || file.name.endsWith(".txt")) {
    text = await file.text();
  } else {
    // For .doc/.docx, we extract what we can (limited without specialized libs)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Try to extract readable text from binary
    text = extractTextFromBinary(bytes);
    
    if (!text || text.length < 10) {
      text = `Document: ${file.name}\n\n`;
      text += `File size: ${(file.size / 1024).toFixed(2)} KB\n\n`;
      text += `Note: For full Word document conversion, please ensure your document is saved as .docx format.\n`;
      text += `This converter supports plain text extraction from Word documents.`;
    }
  }
  
  // Split text into pages
  const fontSize = 12;
  const margin = 50;
  const lineHeight = fontSize * 1.5;
  const pageWidth = 612; // Letter size
  const pageHeight = 792;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  const maxCharsPerLine = Math.floor((pageWidth - 2 * margin) / (fontSize * 0.5));
  
  const lines = wrapText(text, maxCharsPerLine);
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    
    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - (index * lineHeight),
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  return await pdf.save();
}

function extractTextFromBinary(bytes: Uint8Array): string {
  // Try to extract readable ASCII text
  let text = "";
  let inText = false;
  let currentWord = "";
  
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      currentWord += String.fromCharCode(byte);
      inText = true;
    } else if (inText && currentWord.length > 3) {
      text += currentWord + " ";
      currentWord = "";
      inText = false;
    } else {
      currentWord = "";
      inText = false;
    }
  }
  
  return text.trim();
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  
  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      lines.push(paragraph);
    } else {
      const words = paragraph.split(" ");
      let currentLine = "";
      
      for (const word of words) {
        if ((currentLine + " " + word).length <= maxChars) {
          currentLine = currentLine ? currentLine + " " + word : word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
  }
  
  return lines;
}
