"use client";

import Script from "next/script";
import { useEffect } from "react";

// Script loading utilities
const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                        resolve();
                        return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
        });
};

// Initialize PDF.js worker
const initPdfWorker = () => {
        if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${window.pdfjsLib.version}/pdf.worker.min.js`;
        }
};

export default function ExternalScripts() {
        useEffect(() => {
                // Initialize PDF.js worker when the library is loaded
                const checkPdfJs = () => {
                        if (window.pdfjsLib) {
                                initPdfWorker();
                        } else {
                                setTimeout(checkPdfJs, 100);
                        }
                };
                checkPdfJs();
        }, []);

        return (
                <>
                        {/* Load PDF.js early as it's used by most tools */}
                        <Script
                                defer={true}
                                src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
                                strategy="beforeInteractive"
                                onLoad={() => {
                                        initPdfWorker();
                                }}
                        />
                </>
        );
}

// Export utility functions for dynamic loading
export const loadJsPDF = async (): Promise<void> => {
        if (window.jspdf) return;
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
};

export const loadJSZip = async (): Promise<void> => {
        if (window.JSZip) return;
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
};

export const loadFileSaver = async (): Promise<void> => {
        if ('saveAs' in window) return;
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js");
};

export const loadPdfLib = async (): Promise<void> => {
        if (window.PDFLib) return;
        await loadScript("https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js");
}; 