"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function ExternalScripts() {
        useEffect(() => {
                // Initialize PDF.js worker
                if (window.pdfjsLib) {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${window.pdfjsLib.version}/pdf.worker.min.js`;
                }
        }, []);

        return (
                <>
                        <Script
                                src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
                                strategy="beforeInteractive"
                        />
                        <Script
                                src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
                                strategy="beforeInteractive"
                        />
                        <Script
                                src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
                                strategy="beforeInteractive"
                        />
                </>
        );
} 