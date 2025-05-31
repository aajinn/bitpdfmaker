export interface GlobalWorkerOptions {
    workerSrc: string;
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

export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
}

export interface TesseractProgress {
    status: string;
    progress: number;
}

export interface TesseractResult {
    data: {
        text: string;
    };
}

declare global {
    interface Window {
        pdfjsLib: {
            getDocument: (params: { data: Uint8Array }) => PDFDocumentLoadingTask;
            GlobalWorkerOptions: GlobalWorkerOptions;
        };
        Tesseract: {
            recognize: (
                image: string,
                lang: string,
                options: {
                    logger: (m: TesseractProgress) => void;
                }
            ) => Promise<TesseractResult>;
        };
    }
} 