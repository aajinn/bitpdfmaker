"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import ExternalScripts from "./components/ExternalScripts";
import type { PDFLib, TesseractLib, JSPDF, TesseractProgress, WindowWithLibs } from "@/app/types/window";

declare const window: WindowWithLibs;

export default function Page() {
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
          <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
               <Header />

               <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200">
                         {/* File Upload */}
                         <div className="flex flex-col gap-3">
                              <label
                                   htmlFor="pdf-upload"
                                   className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2 sm:py-3 text-center font-semibold text-sm sm:text-base transition shadow-md select-none"
                                   tabIndex={0}
                                   onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        document.getElementById("pdf-upload")?.click()
                                   }
                              >
                                   {loading ? "Processing PDF..." : "Upload PDF"}
                              </label>
                              <input
                                   type="file"
                                   id="pdf-upload"
                                   accept="application/pdf"
                                   onChange={handleUpload}
                                   disabled={loading}
                                   className="hidden"
                              />
                         </div>

                         {/* Progress and Error Messages */}
                         {progress && (
                              <p className="text-center text-indigo-700 font-medium text-sm sm:text-base">
                                   {progress}
                              </p>
                         )}
                         {error && (
                              <p className="text-center text-red-600 font-semibold text-sm sm:text-base">
                                   {error}
                              </p>
                         )}

                         {/* Text Preview */}
                         {text && (
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Extracted Text Preview
                                   </h2>
                                   <textarea
                                        value={text}
                                        onChange={(e) => {
                                             setText(e.target.value);
                                             generateCells(e.target.value);
                                        }}
                                        className="w-full h-32 sm:h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                        placeholder="Extracted text will appear here..."
                                   />
                              </div>
                         )}

                         {/* Font Size Control */}
                         {text && (
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                                   <label className="text-sm sm:text-base text-gray-700">
                                        Font Size:
                                   </label>
                                   <div className="flex items-center gap-2">
                                        <button
                                             onClick={() => setFontSize((f) => Math.max(6, f - 1))}
                                             className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                                        >
                                             -
                                        </button>
                                        <span className="text-indigo-700 font-semibold text-sm sm:text-base">
                                             {fontSize}pt
                                        </span>
                                        <button
                                             onClick={() => setFontSize((f) => Math.min(12, f + 1))}
                                             className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                                        >
                                             +
                                        </button>
                                   </div>
                              </div>
                         )}

                         {/* Preview Grid */}
                         {cells.length > 0 && (
                              <div className="flex flex-col gap-3">
                                   <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Preview
                                   </h2>
                                   <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        {cells.map((cell, index) => (
                                             <div
                                                  key={index}
                                                  className="aspect-[210/297] p-2 sm:p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
                                             >
                                                  <p
                                                       className="text-[8pt] leading-tight"
                                                       style={{ fontSize: `${fontSize}pt` }}
                                                  >
                                                       {cell}
                                                  </p>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         )}

                         {/* Download Button */}
                         {cells.length > 0 && (
                              <button
                                   onClick={downloadPDF}
                                   className="w-full sm:w-auto mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl transition shadow-md text-sm sm:text-base"
                              >
                                   Download PDF
                              </button>
                         )}
                    </div>
               </section>

               <footer className="text-bg-indigo-400 py-4 sm:py-6 text-center select-none text-sm sm:text-base">
                    &copy; {new Date().getFullYear()} BitMakerPdf. All rights
                    reserved.
               </footer>
          </main>
     );
}

// Note: For layout.tsx, remove the unused Link import
