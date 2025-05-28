"use client";

import { useEffect } from "react";

export default function ExternalScripts() {
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
                                        }
                                }
                        )
                );

                // Load Tesseract.js
                scripts.push(
                        loadScript(
                                "https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js",
                                () => {
                                        // Script loaded, no additional setup needed
                                }
                        )
                );

                // Load jsPDF
                scripts.push(
                        loadScript(
                                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
                                () => {
                                        // Script loaded, no additional setup needed
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

        return null;
} 