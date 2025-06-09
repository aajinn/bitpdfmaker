import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

declare global {
    interface Window {
        pdfjsLib: {
            version: string;
            getDocument: (options: { data: Uint8Array }) => {
                promise: Promise<{
                    numPages: number;
                    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
                }>;
            };
            GlobalWorkerOptions: {
                workerSrc: string;
            };
        };
        jspdf: {
            jsPDF: new () => {
                addPage: () => void;
                addImage: (image: HTMLImageElement, format: string, x: number, y: number, width: number, height: number) => void;
                save: (filename: string) => void;
                getImageProperties: (image: HTMLImageElement) => { width: number; height: number };
                internal: {
                    pageSize: {
                        getWidth: () => number;
                        getHeight: () => number;
                    };
                };
            };
        };
    }
}

interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
}

interface ImageConversionOptions {
    format: 'image/jpeg' | 'image/png';
    quality?: number;
    scale?: number;
}

interface PageImage {
    pageNumber: number;
    dataUrl: string;
    blob: Blob;
} 