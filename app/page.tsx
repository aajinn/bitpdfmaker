// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function Home() {
     const [text, setText] = useState("");
     const [preview, setPreview] = useState<string[]>([]);
     const [rows, setRows] = useState(4);
     const [cols, setCols] = useState(4);

     useEffect(() => {
          if (typeof window !== "undefined") {
               // @ts-ignore
               window.Tesseract = window.Tesseract || {};
          }
     }, []);

     const handleUpload = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
               const typedArray = new Uint8Array(reader.result as ArrayBuffer);
               // @ts-ignore
               const pdfjsLib = window["pdfjsLib"];
               const loadingTask = pdfjsLib.getDocument({ data: typedArray });
               const pdf = await loadingTask.promise;
               let fullText = "";
               for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1 });
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d")!;
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport })
                         .promise;
                    const dataUrl = canvas.toDataURL();
                    // @ts-ignore
                    const result = await window.Tesseract.recognize(
                         dataUrl,
                         "eng"
                    );
                    fullText += result.data.text + "\n";
               }
               setText(fullText);
          };
          reader.readAsArrayBuffer(file);
     };

     const splitToCells = () => {
          const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
          const cellCount = rows * cols;
          const avgLength = Math.ceil(sentences.length / cellCount);
          const cells = [];
          for (let i = 0; i < cellCount; i++) {
               const chunk = sentences
                    .slice(i * avgLength, (i + 1) * avgLength)
                    .join(" ");
               if (chunk.trim() !== "") cells.push(chunk);
          }
          setPreview(cells);
     };

     const downloadPDF = async () => {
          // @ts-ignore
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF({ unit: "mm", format: "a4" });
          const pageWidth = 210;
          const pageHeight = 297;
          const margin = 10;
          const cellWidth = (pageWidth - margin * 2) / cols;
          const cellHeight = (pageHeight - margin * 2) / rows;
          let i = 0;
          for (let r = 0; r < rows; r++) {
               for (let c = 0; c < cols; c++) {
                    const x = margin + c * cellWidth;
                    const y = margin + r * cellHeight + 3;
                    doc.setFontSize(8);
                    doc.text(preview[i] || "", x + 1, y, {
                         maxWidth: cellWidth - 2,
                    });
                    i++;
               }
          }
          doc.save("output.pdf");
     };

     return (
          <>
               <Script
                    src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
                    strategy="beforeInteractive"
               />
               <Script
                    src="https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js"
                    strategy="beforeInteractive"
               />
               <Script
                    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
                    strategy="beforeInteractive"
               />

               <main className="p-6 bg-gray-100 min-h-screen">
                    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
                         <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleUpload}
                              className="mb-4 w-full border rounded p-2"
                         />
                         <div className="mb-4">
                              <label className="block mb-1">Rows</label>
                              <input
                                   type="range"
                                   min="1"
                                   max="10"
                                   value={rows}
                                   onChange={(e) =>
                                        setRows(Number(e.target.value))
                                   }
                                   className="w-full"
                              />
                         </div>
                         <div className="mb-4">
                              <label className="block mb-1">Columns</label>
                              <input
                                   type="range"
                                   min="1"
                                   max="10"
                                   value={cols}
                                   onChange={(e) =>
                                        setCols(Number(e.target.value))
                                   }
                                   className="w-full"
                              />
                         </div>
                         <button
                              onClick={splitToCells}
                              className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                         >
                              Generate Preview
                         </button>
                         <button
                              onClick={downloadPDF}
                              className="bg-green-600 text-white px-4 py-2 rounded"
                         >
                              Download PDF
                         </button>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                              {preview.map((cell, i) => (
                                   <textarea
                                        key={i}
                                        className="border rounded p-2 text-sm w-full"
                                        rows={5}
                                        value={cell}
                                        onChange={(e) => {
                                             const copy = [...preview];
                                             copy[i] = e.target.value;
                                             setPreview(copy);
                                        }}
                                   />
                              ))}
                         </div>
                    </div>
               </main>
          </>
     );
}
