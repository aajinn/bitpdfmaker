// PDF.js related types
export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
}

export interface TextItem {
    str: string;
}

export interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNum: number) => Promise<PDFPageProxy>;
}

export interface PDFPageProxy {
    getTextContent: () => Promise<{ items: TextItem[] }>;
    getViewport: (params: { scale: number }) => PDFViewport;
    render: (params: {
        canvasContext: CanvasRenderingContext2D;
        viewport: PDFViewport;
    }) => { promise: Promise<void> };
}

export interface PDFViewport {
    width: number;
    height: number;
}

// Tesseract.js related types
export interface TesseractProgress {
    status: string;
    progress: number;
}

export interface TesseractResult {
    data: {
        text: string;
    };
}

export interface TesseractLib {
    recognize: (
        image: string,
        lang: string,
        options?: {
            logger: (m: TesseractProgress) => void;
        }
    ) => Promise<TesseractResult>;
}

// jsPDF related types
export interface JSPDF {
    jsPDF: new (options: { unit: string; format: string }) => JSPDFInstance;
}

export interface JSPDFInstance {
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

// PDFLib related types
export interface PDFLib {
    getDocument: (params: { data: Uint8Array }) => PDFDocumentLoadingTask;
    GlobalWorkerOptions: {
        workerSrc: string;
    };
}

export interface PDFLibDocument {
    getPage: (pageNumber: number) => PDFLibPage;
    getPages: () => PDFLibPage[];
    getPageCount: () => number;
    save: () => Promise<Uint8Array>;
}

export interface PDFLibPage {
    getWidth: () => number;
    getHeight: () => number;
    drawText: (text: string, options: {
        x: number;
        y: number;
        size: number;
        color?: PDFLibRGB;
        font?: PDFLibFont;
    }) => void;
    drawRectangle: (options: {
        x: number;
        y: number;
        width: number;
        height: number;
        color?: PDFLibRGB;
        borderColor?: PDFLibRGB;
        borderWidth?: number;
    }) => void;
}

export interface PDFLibRGB {
    r: number;
    g: number;
    b: number;
}

export interface PDFLibFont {
    encodeText: (text: string) => Uint8Array;
    widthOfTextAtSize: (text: string, size: number) => number;
}

// Window extension type
export interface WindowWithLibs {
    pdfjsLib?: PDFLib;
    Tesseract?: TesseractLib;
    jspdf?: JSPDF;
    PDFLib?: {
        PDFDocument: {
            load: (data: Uint8Array) => Promise<PDFLibDocument>;
        };
    };
}

// Declare the window augmentation
declare global {
    interface Window {
        pdfjsLib?: PDFLib;
        Tesseract?: TesseractLib;
        jspdf?: JSPDF;
        PDFLib?: {
            PDFDocument: {
                load: (data: Uint8Array) => Promise<PDFLibDocument>;
            };
        };
        JSZip?: new () => {
            file: (name: string, blob: Blob) => void;
            generateAsync: (opts: { type: string }) => Promise<Blob>;
        };
        saveAs?: (blob: Blob, name: string) => void;
    }
}

export {}; 