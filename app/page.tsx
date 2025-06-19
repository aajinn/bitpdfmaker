"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import type { PDFLib, TesseractLib, JSPDF, WindowWithLibs } from "@/app/types/window";
import ToolList from "./components/ToolList";
import Head from "next/head";

declare const window: WindowWithLibs;

export default function Home() {
     const [text] = useState<string>("");
     const [fontSize] = useState<number>(8);
     const pdfjsRef = useRef<PDFLib | null>(null);
     const TesseractRef = useRef<TesseractLib | null>(null);
     const jsPDFRef = useRef<JSPDF | null>(null);

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

               console.log("Text extraction completed!");
          },
          [text, fontSize, rows, cols]
     );

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
