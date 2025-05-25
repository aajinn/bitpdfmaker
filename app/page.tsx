"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./component/Header";

// Define proper types for the libraries
interface PDFLib {
     getDocument: (params: { data: Uint8Array }) => { promise: PDFDocument };
     GlobalWorkerOptions: {
          workerSrc: string;
     };
}

interface PDFDocument {
     numPages: number;
     getPage: (pageNum: number) => Promise<PDFPage>;
}

interface PDFPage {
     getViewport: (params: { scale: number }) => PDFViewport;
     render: (params: {
          canvasContext: CanvasRenderingContext2D;
          viewport: PDFViewport;
     }) => { promise: Promise<void> };
}

interface PDFViewport {
     width: number;
     height: number;
}

interface TesseractLib {
     recognize: (
          image: string,
          lang: string,
          options: {
               logger: (m: TesseractProgress) => void;
          }
     ) => Promise<TesseractResult>;
}

interface TesseractProgress {
     status: string;
     progress: number;
}

interface TesseractResult {
     data: {
          text: string;
     };
}

interface JSPDF {
     jsPDF: new (options: { unit: string; format: string }) => JSPDFInstance;
}

interface JSPDFInstance {
     setFontSize: (size: number) => void;
     setFont: (font: string, style: string) => void;
     text: (
          text: string,
          x: number,
          y: number,
          options: { maxWidth: number }
     ) => void;
     addPage: () => void;
     save: (filename: string) => void;
}

// Add this type to handle the global window object
interface WindowWithLibs extends Window {
     pdfjsLib?: PDFLib;
     Tesseract?: TesseractLib;
     jspdf?: JSPDF;
}

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

     // Load external scripts
     useEffect(() => {
          const loadScript = (url: string, onLoad: () => void) => {
               const script = document.createElement("script");
               script.src = url;
               script.async = true;
               script.onload = onLoad;
               document.body.appendChild(script);
               return script;
          };

          const scripts: HTMLScriptElement[] = [];

          // Load PDF.js
          scripts.push(
               loadScript(
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",
                    () => {
                         if (window.pdfjsLib) {
                              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                                   "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
                              pdfjsRef.current = window.pdfjsLib;
                         }
                    }
               )
          );

          // Load Tesseract.js
          scripts.push(
               loadScript(
                    "https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js",
                    () => {
                         if (window.Tesseract) {
                              TesseractRef.current = window.Tesseract;
                         }
                    }
               )
          );

          // Load jsPDF
          scripts.push(
               loadScript(
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
                    () => {
                         if (window.jspdf) {
                              jsPDFRef.current = window.jspdf;
                         }
                    }
               )
          );

          // Cleanup function to remove scripts when component unmounts
          return () => {
               scripts.forEach((script) => {
                    if (document.body.contains(script)) {
                         document.body.removeChild(script);
                    }
               });
          };
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

               <section className="flex-grow flex flex-col items-center p-4 sm:p-6">
                    <main className="max-w-4xl w-full mb-8 text-center px-4 sm:px-0">
                         <p className="max-w-xl mx-auto text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900 dark:text-white">
                              <span className="bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                                   🚀 Unlock the full potential of your PDFs
                              </span>{" "}
                              with{" "}
                              <span className="text-indigo-700">
                                   🤖 seamless AI-powered OCR
                              </span>{" "}
                              and
                              <span className="text-pink-600">
                                   {" "}
                                   🎨 advanced layout automation
                              </span>
                              . Effortlessly extract, edit, and reformat text —
                              no technical skills required.
                              <br />
                              <strong className="text-indigo-800">
                                   📤 Upload
                              </strong>
                              , customize font size,
                              <strong className="text-indigo-800">
                                   {" "}
                                   🔍 preview
                              </strong>
                              , and
                              <strong className="text-indigo-800">
                                   {" "}
                                   💾 download
                              </strong>{" "}
                              beautifully formatted PDFs in seconds.
                         </p>
                    </main>

                    <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 border border-indigo-200">
                         <label
                              htmlFor="file-upload"
                              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-3 text-center font-semibold text-base sm:text-lg transition shadow-md select-none"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                   e.key === "Enter" &&
                                   document
                                        .getElementById("file-upload")
                                        ?.click()
                              }
                         >
                              {loading
                                   ? "Processing PDF..."
                                   : "Upload PDF to Extract Text"}
                         </label>
                         <input
                              type="file"
                              id="file-upload"
                              accept="application/pdf"
                              onChange={handleUpload}
                              disabled={loading}
                              className="hidden"
                         />

                         {error && (
                              <p className="text-center text-red-600 font-semibold select-none">
                                   {error}
                              </p>
                         )}

                         {loading && (
                              <div className="flex flex-col justify-center items-center space-y-2 select-none">
                                   <svg
                                        className="animate-spin h-10 w-10 text-indigo-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                   >
                                        <circle
                                             className="opacity-25"
                                             cx="12"
                                             cy="12"
                                             r="10"
                                             stroke="currentColor"
                                             strokeWidth="4"
                                        />
                                        <path
                                             className="opacity-75"
                                             fill="currentColor"
                                             d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                   </svg>
                                   <p className="text-indigo-600 font-semibold text-center px-4">
                                        {progress}
                                   </p>
                              </div>
                         )}

                         {!loading && cells.length > 0 && (
                              <>
                                   <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                                        <div className="w-full flex flex-col items-center gap-2">
                                             <input
                                                  id="font-size"
                                                  type="range"
                                                  min={5}
                                                  max={20}
                                                  value={fontSize}
                                                  onChange={(e) =>
                                                       setFontSize(
                                                            Number(
                                                                 e.target.value
                                                            )
                                                       )
                                                  }
                                                  className="w-full sm:w-64 h-6 bg-indigo-200 rounded-lg appearance-none cursor-pointer
                                        accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                             />
                                             <span className="text-sm font-semibold text-indigo-700">
                                                  Font Size: {fontSize}pt
                                             </span>
                                        </div>
                                   </div>

                                   <button
                                        onClick={downloadPDF}
                                        className="w-full bg-indigo-700 text-white py-3 rounded-xl font-bold
                                hover:bg-indigo-800 active:bg-indigo-900 transition shadow-lg select-none"
                                   >
                                        Download Formatted PDF
                                   </button>

                                   <div
                                        className="grid gap-4 mt-6"
                                        style={{
                                             gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
                                        }}
                                   >
                                        {cells.map((cell, i) => (
                                             <textarea
                                                  key={i}
                                                  value={cell}
                                                  onChange={(e) => {
                                                       const newCells = [
                                                            ...cells,
                                                       ];
                                                       newCells[i] =
                                                            e.target.value;
                                                       setCells(newCells);
                                                  }}
                                                  style={{
                                                       fontSize:
                                                            fontSize + "pt",
                                                  }}
                                                  className="resize-none rounded-lg border border-indigo-300 p-4
                                        shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
                                        placeholder-indigo-300 min-h-[120px] max-h-[160px] overflow-auto
                                        w-full bg-indigo-50 text-indigo-900"
                                                  spellCheck={false}
                                                  aria-label={`Text cell ${i + 1
                                                       }`}
                                             />
                                        ))}
                                   </div>
                              </>
                         )}
                    </div>
               </section>

               <footer className="text-bg-indigo-400 py-6 text-center select-none">
                    &copy; {new Date().getFullYear()} BitMakerPdf. All rights
                    reserved.
               </footer>
          </main>
     );
}

// Note: For layout.tsx, remove the unused Link import
