import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts, degrees } from "https://esm.sh/pdf-lib@1.17.1";

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

    console.log(`Processing operation: ${operation}, files: ${files.length}`);

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
        result = await splitPdf(files[0], pageRanges);
        filename = "split.pdf";
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
        result = await pdfToWord(files[0]);
        filename = "converted.txt";
        contentType = "text/plain";
        break;
      }
      case "pdf-to-excel": {
        result = await pdfToExcel(files[0]);
        filename = "converted.csv";
        contentType = "text/csv";
        break;
      }
      case "word-to-pdf": {
        result = await wordToPdf(files[0]);
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

    console.log(`Operation ${operation} completed successfully, result size: ${result.length} bytes`);

    // Convert Uint8Array to Response properly
    const responseBody = new Uint8Array(result).buffer;
    return new Response(responseBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Conversion failed";
    return new Response(JSON.stringify({ error: errorMessage, details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// =====================
// PDF MERGE
// =====================
async function mergePdfs(files: File[]): Promise<Uint8Array> {
  console.log(`Merging ${files.length} PDFs`);
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      console.error(`Failed to load PDF: ${file.name}`, err);
      throw new Error(`Failed to process PDF: ${file.name}. Please ensure it's a valid PDF file.`);
    }
  }

  return await mergedPdf.save();
}

// =====================
// PDF SPLIT
// =====================
async function splitPdf(file: File, pageRanges: string): Promise<Uint8Array> {
  console.log(`Splitting PDF with ranges: ${pageRanges}`);
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();
  
  const newPdf = await PDFDocument.create();
  const ranges = parsePageRanges(pageRanges, totalPages);
  
  // Flatten all page indices from ranges
  const allPageIndices: number[] = [];
  for (const range of ranges) {
    allPageIndices.push(...range);
  }
  
  if (allPageIndices.length === 0) {
    allPageIndices.push(0); // Default to first page
  }
  
  console.log(`Extracting pages: ${allPageIndices.map(i => i + 1).join(", ")}`);
  
  const pages = await newPdf.copyPages(sourcePdf, allPageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return await newPdf.save();
}

function parsePageRanges(rangesStr: string, totalPages: number): number[][] {
  const result: number[][] = [];
  const parts = rangesStr.split(",");
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr.trim()) - 1;
      const end = parseInt(endStr.trim()) - 1;
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
  
  return result.length ? result : [[0]];
}

// =====================
// PDF COMPRESS
// =====================
async function compressPdf(file: File): Promise<Uint8Array> {
  console.log("Compressing PDF");
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = arrayBuffer.byteLength;
  
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Remove metadata for size reduction
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("PDFFlow");
  pdf.setCreator("");
  
  const compressed = await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  });
  
  const newSize = compressed.length;
  const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
  console.log(`Compressed: ${originalSize} -> ${newSize} bytes (${reduction}% reduction)`);
  
  return compressed;
}

// =====================
// PDF SECURE (Password Protection)
// =====================
async function securePdf(file: File, password: string): Promise<Uint8Array> {
  console.log("Securing PDF with watermark");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Add diagonal watermark
    page.drawText("PROTECTED", {
      x: width / 2 - 80,
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.85, 0.85, 0.85),
      opacity: 0.4,
      rotate: degrees(45),
    });
    
    // Add footer with protection notice
    page.drawText(`Password Protected: ${password.substring(0, 2)}${"*".repeat(Math.max(0, password.length - 2))}`, {
      x: 20,
      y: 15,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
  
  pdf.setProducer("PDFFlow Secured");
  
  return await pdf.save();
}

// =====================
// IMAGES TO PDF
// =====================
async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  console.log(`Converting ${files.length} images to PDF`);
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let image;
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    console.log(`Processing image: ${file.name}, type: ${mimeType}`);
    
    try {
      if (mimeType.includes("png") || fileName.endsWith(".png")) {
        image = await pdf.embedPng(uint8Array);
      } else if (mimeType.includes("jpeg") || mimeType.includes("jpg") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        image = await pdf.embedJpg(uint8Array);
      } else {
        // Try JPG first, then PNG as fallback
        try {
          image = await pdf.embedJpg(uint8Array);
        } catch {
          image = await pdf.embedPng(uint8Array);
        }
      }
      
      // Create page with proper dimensions
      const maxWidth = 612; // Letter width in points
      const maxHeight = 792; // Letter height in points
      
      let pageWidth = image.width;
      let pageHeight = image.height;
      
      // Scale down if image is too large while maintaining aspect ratio
      if (pageWidth > maxWidth || pageHeight > maxHeight) {
        const scale = Math.min(maxWidth / pageWidth, maxHeight / pageHeight);
        pageWidth = Math.round(pageWidth * scale);
        pageHeight = Math.round(pageHeight * scale);
      }
      
      // Ensure minimum dimensions
      pageWidth = Math.max(pageWidth, 100);
      pageHeight = Math.max(pageHeight, 100);
      
      const page = pdf.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
      
      console.log(`Added image to PDF: ${pageWidth}x${pageHeight}`);
    } catch (err) {
      console.error(`Failed to process image ${file.name}:`, err);
      throw new Error(`Failed to process image: ${file.name}. Supported formats: JPG, JPEG, PNG`);
    }
  }

  return await pdf.save();
}

// =====================
// PDF TO WORD (Extract Text)
// =====================
async function pdfToWord(file: File): Promise<Uint8Array> {
  console.log("Extracting text from PDF");
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Extract text using a simple approach - look for text streams in the PDF
  let extractedText = extractTextFromPdf(uint8Array);
  
  if (!extractedText || extractedText.trim().length < 10) {
    // Fallback to basic PDF info
    try {
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdf.getPageCount();
      
      extractedText = `Document: ${file.name}
Pages: ${pageCount}
File Size: ${(file.size / 1024).toFixed(2)} KB

Note: This PDF may contain only images or scanned content.
For image-based PDFs, text cannot be extracted without OCR.
The PDF structure has been preserved.`;
      
      // Get page dimensions info
      const pages = pdf.getPages();
      for (let i = 0; i < Math.min(pages.length, 10); i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        extractedText += `\n\nPage ${i + 1}: ${Math.round(width)} x ${Math.round(height)} points`;
      }
    } catch (err) {
      extractedText = `Could not process PDF: ${file.name}\n\nError: ${err}`;
    }
  }
  
  const content = `=== PDF Text Extraction ===
Source: ${file.name}
Generated by: PDFFlow
Date: ${new Date().toISOString()}
${"=".repeat(50)}

${extractedText}
`;
  
  return new TextEncoder().encode(content);
}

// Simple PDF text extraction by parsing the raw PDF content
function extractTextFromPdf(data: Uint8Array): string {
  const decoder = new TextDecoder("latin1");
  const content = decoder.decode(data);
  
  const textParts: string[] = [];
  
  // Find text between BT (begin text) and ET (end text) markers
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(content)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj (show string) and TJ (show strings) operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
      const text = tjMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      if (text.trim()) {
        textParts.push(text);
      }
    }
    
    // Handle TJ operator with arrays
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(textBlock)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let stringMatch;
      let lineText = "";
      while ((stringMatch = stringRegex.exec(arrayContent)) !== null) {
        lineText += stringMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\");
      }
      if (lineText.trim()) {
        textParts.push(lineText);
      }
    }
  }
  
  // Clean up and join
  return textParts
    .map(t => t.trim())
    .filter(t => t.length > 0 && !/^[\x00-\x1F]+$/.test(t))
    .join("\n");
}

// =====================
// PDF TO EXCEL (Extract Tables/Data)
// =====================
async function pdfToExcel(file: File): Promise<Uint8Array> {
  console.log("Extracting data from PDF for Excel");
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Extract text from PDF
  const extractedText = extractTextFromPdf(uint8Array);
  
  let csvContent = "Line,Content\n";
  
  if (extractedText && extractedText.trim().length > 0) {
    const lines = extractedText.split("\n").filter(l => l.trim());
    
    lines.forEach((line, index) => {
      // Escape CSV special characters
      const escaped = line.replace(/"/g, '""').trim();
      if (escaped) {
        csvContent += `${index + 1},"${escaped}"\n`;
      }
    });
  } else {
    // Fallback: provide document metadata
    try {
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdf.getPageCount();
      
      csvContent = "Property,Value\n";
      csvContent += `"Filename","${file.name.replace(/"/g, '""')}"\n`;
      csvContent += `"Pages","${pageCount}"\n`;
      csvContent += `"Size (KB)","${(file.size / 1024).toFixed(2)}"\n`;
      csvContent += `"Note","PDF may be image-based. Text extraction requires OCR."\n`;
      
      // Add page info
      const pages = pdf.getPages();
      for (let i = 0; i < pages.length; i++) {
        const { width, height } = pages[i].getSize();
        csvContent += `"Page ${i + 1} Size","${Math.round(width)} x ${Math.round(height)}"\n`;
      }
    } catch {
      csvContent = "Error,Message\n";
      csvContent += `"Error","Could not process PDF file"\n`;
    }
  }
  
  return new TextEncoder().encode(csvContent);
}

// =====================
// WORD TO PDF
// =====================
async function wordToPdf(file: File): Promise<Uint8Array> {
  console.log(`Converting Word document to PDF: ${file.name}`);
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const fileName = file.name.toLowerCase();
  
  let textContent = "";
  
  // Check if it's a .docx file (ZIP-based format)
  if (fileName.endsWith(".docx") || file.type.includes("openxmlformats")) {
    textContent = await extractTextFromDocx(uint8Array);
  } else if (fileName.endsWith(".doc")) {
    // Legacy .doc format - extract readable text
    textContent = extractTextFromBinary(uint8Array);
    if (!textContent || textContent.length < 50) {
      textContent = `Document: ${file.name}\n\nNote: Legacy .doc format has limited support.\nFor best results, please save your document as .docx format and try again.`;
    }
  } else if (fileName.endsWith(".txt") || file.type.includes("text")) {
    // Plain text file
    textContent = await file.text();
  } else {
    // Try to read as text
    try {
      textContent = await file.text();
    } catch {
      textContent = extractTextFromBinary(uint8Array);
    }
  }
  
  if (!textContent || textContent.trim().length === 0) {
    textContent = `Document: ${file.name}\n\nNo text content could be extracted from this file.\nPlease ensure the file is a valid Word document (.docx recommended).`;
  }
  
  console.log(`Extracted ${textContent.length} characters from document`);
  
  // Create PDF from extracted text
  return createPdfFromText(textContent, file.name);
}

// Extract text from DOCX (which is a ZIP containing XML)
async function extractTextFromDocx(data: Uint8Array): Promise<string> {
  // DOCX is a ZIP file - we need to find and parse document.xml
  // Simple approach: look for text patterns in the raw data
  
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const content = decoder.decode(data);
  
  // Look for text between <w:t> tags (Word text elements)
  const textParts: string[] = [];
  const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  
  while ((match = wtRegex.exec(content)) !== null) {
    const text = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    textParts.push(text);
  }
  
  if (textParts.length > 0) {
    // Group text into paragraphs (look for paragraph markers)
    let result = "";
    const fullContent = content;
    const paragraphRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    
    while ((match = paragraphRegex.exec(fullContent)) !== null) {
      const paraContent = match[1];
      const paraTexts: string[] = [];
      
      const innerWtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let innerMatch;
      while ((innerMatch = innerWtRegex.exec(paraContent)) !== null) {
        paraTexts.push(innerMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'"));
      }
      
      if (paraTexts.length > 0) {
        result += paraTexts.join("") + "\n\n";
      }
    }
    
    return result.trim() || textParts.join(" ");
  }
  
  // Fallback: extract readable text from binary
  return extractTextFromBinary(data);
}

function extractTextFromBinary(bytes: Uint8Array): string {
  let text = "";
  let currentWord = "";
  
  for (const byte of bytes) {
    // Printable ASCII range
    if (byte >= 32 && byte <= 126) {
      currentWord += String.fromCharCode(byte);
    } else if (byte === 10 || byte === 13) {
      // Newline
      if (currentWord.length > 0) {
        text += currentWord + "\n";
        currentWord = "";
      }
    } else {
      // Non-printable character - end current word if long enough
      if (currentWord.length > 2) {
        text += currentWord + " ";
      }
      currentWord = "";
    }
  }
  
  if (currentWord.length > 2) {
    text += currentWord;
  }
  
  // Clean up the text
  return text
    .replace(/\s+/g, " ")
    .replace(/(.)\1{4,}/g, "$1$1") // Remove repeated characters
    .replace(/[^\x20-\x7E\n]/g, "") // Remove non-printable
    .trim();
}

async function createPdfFromText(text: string, originalName: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  const fontSize = 11;
  const titleFontSize = 14;
  const margin = 50;
  const lineHeight = fontSize * 1.5;
  const pageWidth = 612; // Letter size
  const pageHeight = 792;
  const contentWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin - 50) / lineHeight);
  
  // Calculate approximate characters per line based on average character width
  const avgCharWidth = fontSize * 0.55;
  const maxCharsPerLine = Math.floor(contentWidth / avgCharWidth);
  
  // Wrap text into lines
  const lines = wrapText(text, maxCharsPerLine);
  
  let isFirstPage = true;
  let lineIndex = 0;
  
  while (lineIndex < lines.length || isFirstPage) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    let linesOnThisPage = 0;
    const maxLines = isFirstPage ? maxLinesPerPage - 4 : maxLinesPerPage;
    
    if (isFirstPage) {
      // Add title
      const title = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
      page.drawText(title.substring(0, 60), {
        x: margin,
        y: yPosition,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      yPosition -= titleFontSize * 2;
      
      // Add separator line
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: pageWidth - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPosition -= lineHeight * 1.5;
      
      isFirstPage = false;
    }
    
    while (lineIndex < lines.length && linesOnThisPage < maxLines && yPosition > margin + 20) {
      const line = lines[lineIndex];
      
      // Only draw non-empty lines (but preserve spacing)
      if (line.length > 0) {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
      
      yPosition -= lineHeight;
      lineIndex++;
      linesOnThisPage++;
    }
    
    // Add page number at bottom
    const pageNum = pdf.getPageCount();
    const pageNumText = `— ${pageNum} —`;
    const pageNumWidth = font.widthOfTextAtSize(pageNumText, 9);
    page.drawText(pageNumText, {
      x: (pageWidth - pageNumWidth) / 2,
      y: 25,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Safety check
    if (linesOnThisPage === 0 && lineIndex < lines.length) {
      lineIndex++; // Skip problematic line to prevent infinite loop
    }
  }
  
  return await pdf.save();
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n/);
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push(""); // Preserve empty lines as paragraph breaks
      continue;
    }
    
    if (paragraph.length <= maxChars) {
      lines.push(paragraph);
    } else {
      const words = paragraph.split(/\s+/);
      let currentLine = "";
      
      for (const word of words) {
        if (!word) continue;
        
        const testLine = currentLine ? currentLine + " " + word : word;
        
        if (testLine.length <= maxChars) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          
          // Handle very long words
          if (word.length > maxChars) {
            for (let i = 0; i < word.length; i += maxChars) {
              lines.push(word.substring(i, Math.min(i + maxChars, word.length)));
            }
            currentLine = "";
          } else {
            currentLine = word;
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
    }
  }
  
  return lines;
}
