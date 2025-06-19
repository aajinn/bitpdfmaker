"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import type { PDFLib, TesseractLib, JSPDF, TesseractProgress, WindowWithLibs } from "@/app/types/window";
import ToolList from "./components/ToolList";
import Head from "next/head";

declare const window: WindowWithLibs;

export default function Home() {
     const [text, setText] = useState<string>("");
     const [cells, setCells] = useState<string[]>([]);
     const [fontSize, setFontSize] = useState<number>(8);
     const pdfjsRef = useRef<PDFLib | null>(null);
     const TesseractRef = useRef<TesseractLib | null>(null);
     const jsPDFRef = useRef<JSPDF | null>(null);
     const [loading, setLoading] = useState<boolean>(false);
     const [error, setError] = useState<string>("");
     const [progress, setProgress] = useState<string>("");

     const rows = 5;
     const cols = 3;

     // Initialize refs with global libraries
     useEffect(() => {
          if (window.pdfjsLib) pdfjsRef.current = window.pdfjsLib;
          if (window.Tesseract) TesseractRef.current = window.Tesseract;
          if (window.jspdf) jsPDFRef.current = window.jspdf;
     }, []);

     // Generate cells for PDF layout
     const generateCells = useCallback(
          (textParam?: string) => {
               const sourceText = textParam ?? text;
               if (!sourceText) return;

               const sentences =
                    sourceText.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];
               const totalCells = rows * cols;

               const margin = 10;
               const pageWidth = 210 - margin * 2;
               const pageHeight = 297 - margin * 2;
               const cellWidthMM = pageWidth / cols;
               const cellHeightMM = pageHeight / rows;

               const approxCharsPerLine = Math.floor(cellWidthMM / 0.5);
               const lineHeightMM = fontSize * 0.35;
               const approxLinesPerCell = Math.floor(
                    cellHeightMM / lineHeightMM
               );
               const maxCharsPerCell = approxCharsPerLine * approxLinesPerCell;

               const tempCells: string[] = [];
               let currentCell = "";

               for (const sentence of sentences) {
                    if (
                         (currentCell + sentence).length <= maxCharsPerCell ||
                         currentCell === ""
                    ) {
                         currentCell += sentence + " ";
                    } else {
                         tempCells.push(currentCell.trim());
                         currentCell = sentence + " ";
                    }
               }

               if (currentCell.trim() !== "") {
                    tempCells.push(currentCell.trim());
               }

               // Ensure we don't exceed the total number of cells
               while (tempCells.length > totalCells) {
                    const last = tempCells.pop()!;
                    tempCells[tempCells.length - 1] += " " + last;
               }

               // Fill any empty cells
               while (tempCells.length < totalCells) {
                    tempCells.push("");
               }

               setCells(tempCells);
          },
          [text, fontSize, rows, cols]
     );

     // Extract text from PDF
     const extractText = useCallback(
          async (file: File) => {
               if (!pdfjsRef.current || !TesseractRef.current) {
                    setError(
                         "Libraries not loaded yet, please try again shortly."
                    );
                    return;
               }

               setError("");
               setLoading(true);
               setText("");
               setCells([]);
               setProgress("Starting PDF processing...");

               try {
                    const reader = new FileReader();

                    reader.onload = async () => {
                         try {
                              const typedArray = new Uint8Array(
                                   reader.result as ArrayBuffer
                              );

                              // Store in local variables to satisfy TypeScript null checks
                              const pdfjsLib = pdfjsRef.current;
                              const tesseractLib = TesseractRef.current;

                              if (!pdfjsLib || !tesseractLib) {
                                   throw new Error("Libraries not available");
                              }

                              const pdf = await pdfjsLib.getDocument({
                                   data: typedArray,
                              }).promise;
                              let fullText = "";

                              for (let i = 1; i <= pdf.numPages; i++) {
                                   setProgress(
                                        `Rendering page ${i} of ${pdf.numPages}...`
                                   );

                                   const page = await pdf.getPage(i);
                                   const viewport = page.getViewport({
                                        scale: 2,
                                   });
                                   const canvas =
                                        document.createElement("canvas");
                                   const ctx = canvas.getContext("2d");

                                   if (!ctx) {
                                        throw new Error(
                                             "Could not create canvas context"
                                        );
                                   }

                                   canvas.width = viewport.width;
                                   canvas.height = viewport.height;

                                   await page.render({
                                        canvasContext: ctx,
                                        viewport,
                                   }).promise;
                                   const dataUrl = canvas.toDataURL();

                                   setProgress(
                                        `Performing OCR on page ${i}...`
                                   );

                                   const result = await tesseractLib.recognize(
                                        dataUrl,
                                        "eng",
                                        {
                                             logger: (m: TesseractProgress) => {
                                                  if (
                                                       m.status ===
                                                       "recognizing text"
                                                  ) {
                                                       setProgress(
                                                            `OCR progress on page ${i}: ${(
                                                                 m.progress *
                                                                 100
                                                            ).toFixed(1)}%`
                                                       );
                                                  }
                                             },
                                        }
                                   );

                                   fullText += result.data.text + " ";
                              }

                              setProgress("Finalizing text extraction...");
                              const cleanText = fullText
                                   .trim()
                                   .replace(/\s+/g, " ");
                              setText(cleanText);
                              generateCells(cleanText);
                              setProgress("Text extraction completed!");
                         } catch (err) {
                              console.error("PDF processing error:", err);
                              setError(
                                   "Failed to process PDF. " +
                                   (err instanceof Error
                                        ? err.message
                                        : "")
                              );
                         } finally {
                              setLoading(false);
                         }
                    };

                    reader.onerror = () => {
                         setError("Failed to read the file");
                         setLoading(false);
                    };

                    reader.readAsArrayBuffer(file);
               } catch (err) {
                    console.error("Extract text error:", err);
                    setError("Failed to extract text from PDF.");
                    setLoading(false);
                    setProgress("");
               }
          },
          [generateCells]
     );

     // Handle PDF upload
     const handleUpload = useCallback(
          (e: React.ChangeEvent<HTMLInputElement>) => {
               const file = e.target.files?.[0];
               if (!file) return;

               if (file.type !== "application/pdf") {
                    setError("Please upload a valid PDF file.");
                    return;
               }

               // Clear old progress and data when new PDF is uploaded
               setProgress("");
               setError("");
               setLoading(false);
               setText("");
               setCells([]);

               extractText(file);
          },
          [extractText]
     );

     // Download the formatted PDF
     const downloadPDF = useCallback(() => {
          if (!jsPDFRef.current || cells.length === 0) return;

          // Store in a local variable to satisfy TypeScript null checks
          const jspdfLib = jsPDFRef.current;
          const { jsPDF } = jspdfLib;

          const doc = new jsPDF({ unit: "mm", format: "a4" });
          doc.setFontSize(fontSize);
          doc.setFont("helvetica", "normal");

          const margin = 10;
          const pageWidth = 210 - 2 * margin;
          const pageHeight = 297 - 2 * margin;
          const cellWidth = pageWidth / cols;
          const cellHeight = pageHeight / rows;

          let x = margin;
          let y = margin;

          cells.forEach((cell, i) => {
               if (i > 0 && i % cols === 0) {
                    x = margin;
                    y += cellHeight;
                    if (y + cellHeight > pageHeight + margin) {
                         doc.addPage();
                         y = margin;
                    }
               }

               doc.text(cell, x + 2, y + fontSize + 2, {
                    maxWidth: cellWidth - 4,
               });
               x += cellWidth;
          });

          doc.save("BitMakerPdf-output.pdf");
     }, [cells, fontSize, rows, cols]);

     // Update cells when font size changes
     useEffect(() => {
          if (text) generateCells();
     }, [fontSize, text, generateCells]);

     return (
          <>
               <Head>
                    <title>PDF Tools - Free Online PDF Converter & Editor</title>
                    <meta
                         name="description"
                         content="Free online PDF tools to convert, merge, watermark, and edit PDF files. No installation required. Fast, secure, and easy to use."
                    />
                    <meta name="keywords" content="PDF converter, PDF editor, merge PDF, watermark PDF, PDF to image, image to PDF" />
                    <meta property="og:title" content="PDF Tools - Free Online PDF Converter & Editor" />
                    <meta
                         property="og:description"
                         content="Free online PDF tools to convert, merge, watermark, and edit PDF files. No installation required. Fast, secure, and easy to use."
                    />
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="PDF Tools - Free Online PDF Converter & Editor" />
                    <meta
                         name="twitter:description"
                         content="Free online PDF tools to convert, merge, watermark, and edit PDF files. No installation required. Fast, secure, and easy to use."
                    />
               </Head>
               <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                         {/* Hero Section */}
                         <section className="py-20 bg-white">
                              <div className="container mx-auto px-4">
                                   <div className="max-w-3xl mx-auto text-center">
                                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                             Free Online PDF Tools
                                        </h1>
                                        <p className="text-xl text-gray-600 mb-8">
                                             Convert, merge, watermark, and edit PDF files online. No installation required.
                                             Fast, secure, and easy to use.
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-4">
                                             <a
                                                  href="#tools"
                                                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                             >
                                                  Get Started
                                             </a>
                                             <a
                                                  href="#features"
                                                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                             >
                                                  Learn More
                                             </a>
                                        </div>
                                   </div>
                              </div>
                         </section>

                         {/* Features Section */}
                         <section id="features" className="py-16 bg-gray-50">
                              <div className="container mx-auto px-4">
                                   <div className="max-w-3xl mx-auto text-center mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our PDF Tools?</h2>
                                        <p className="text-gray-600">
                                             Our tools are designed to make PDF manipulation simple and efficient.
                                        </p>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                       <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                                       />
                                                  </svg>
                                             </div>
                                             <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
                                             <p className="text-gray-600">
                                                  Process your PDFs quickly with our optimized tools. No waiting in queues.
                                             </p>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                       <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                       />
                                                  </svg>
                                             </div>
                                             <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                                             <p className="text-gray-600">
                                                  Your files are processed locally in your browser. We never store your data.
                                             </p>
                                        </div>
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                       <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                                                       />
                                                  </svg>
                                             </div>
                                             <h3 className="text-lg font-semibold text-gray-900 mb-2">Free to Use</h3>
                                             <p className="text-gray-600">
                                                  All tools are completely free to use. No hidden costs or subscriptions.
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </section>

                         {/* Tools Section */}
                         <section id="tools" className="py-16 bg-white">
                              <div className="container mx-auto px-4">
                                   <div className="max-w-3xl mx-auto text-center mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our PDF Tools</h2>
                                        <p className="text-gray-600">
                                             Choose from our range of powerful PDF tools to get your work done.
                                        </p>
                                   </div>
                                   <ToolList gridCols={2} className="max-w-5xl mx-auto" />
                              </div>
                         </section>
                    </main>
               </div>
          </>
     );
}

// Note: For layout.tsx, remove the unused Link import
