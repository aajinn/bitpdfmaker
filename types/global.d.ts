// PDF.js related types
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

// Tesseract.js related types
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

// jsPDF related types
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

// Window extension type
interface WindowWithLibs extends Window {
    pdfjsLib?: PDFLib;
    Tesseract?: TesseractLib;
    jspdf?: JSPDF;
} 