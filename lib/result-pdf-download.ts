import { jsPDF } from "jspdf";
import {
  createResearchPdfDocument,
  createStudyPdfDocument,
} from "./result-pdf";
import type { StudyResponse } from "./study-response";

type ResearchResult = Parameters<typeof createResearchPdfDocument>[1];

type PdfSection = {
  heading: string;
  content: string;
};

function addUnicodeFont(pdf: jsPDF): void {
  const fontUrl = "/fonts/NotoSansBengali-Regular.ttf";

  // The browser fetches the font when the user downloads a PDF.
  // The actual font registration is completed in createPdfBlob().
  void fontUrl;
}

async function loadUnicodeFont(pdf: jsPDF): Promise<void> {
  const response = await fetch("/fonts/NotoSansBengali-Regular.ttf");

  if (!response.ok) {
    throw new Error("Unable to load the PDF Unicode font.");
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize),
    );
  }

  const base64 = btoa(binary);

  pdf.addFileToVFS("NotoSansBengali-Regular.ttf", base64);
  pdf.addFont(
    "NotoSansBengali-Regular.ttf",
    "NotoSansBengali",
    "normal",
  );
  pdf.setFont("NotoSansBengali", "normal");
}

async function createPdf(
  title: string,
  sections: PdfSection[],
): Promise<jsPDF> {
  const pdf = new jsPDF();
  const margin = 18;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  await loadUnicodeFont(pdf);

  pdf.setFont("NotoSansBengali", "normal");
  pdf.setFontSize(20);
  pdf.text("BILLBLI", margin, y);
  y += 10;

  pdf.setFontSize(15);
  pdf.text(title, margin, y);
  y += 12;

  for (const section of sections) {
    if (y > pageHeight - 30) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFont("NotoSansBengali", "normal");
    pdf.setFontSize(11);
    pdf.text(section.heading, margin, y);
    y += 6;

    pdf.setFontSize(10);

    const lines = pdf.splitTextToSize(section.content, contentWidth);

    for (const line of lines) {
      if (y > pageHeight - 18) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, margin, y);
      y += 5;
    }

    y += 6;
  }

  return pdf;
}

export async function createPdfBlob(
  title: string,
  sections: PdfSection[],
): Promise<Blob> {
  const pdf = await createPdf(title, sections);
  return pdf.output("blob");
}

export async function downloadResearchPdf(
  question: string,
  result: ResearchResult,
): Promise<void> {
  const pdfDocument = createResearchPdfDocument(question, result);
  const blob = await createPdfBlob(pdfDocument.title, pdfDocument.sections);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = pdfDocument.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadStudyPdf(
  question: string,
  result: StudyResponse,
): Promise<void> {
  const pdfDocument = createStudyPdfDocument(question, result);
  const blob = await createPdfBlob(pdfDocument.title, pdfDocument.sections);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = pdfDocument.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
