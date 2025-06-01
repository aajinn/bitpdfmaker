import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

declare global {
    interface Window {
        pdfjsLib: {
            getDocument: (options: { data: Uint8Array }) => PDFDocumentLoadingTask;
            GlobalWorkerOptions: {
                workerSrc: string;
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