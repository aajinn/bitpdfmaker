interface WindowWithLibs extends Window {
    pdfjsLib?: {
        getDocument: (options: { data: Uint8Array }) => {
            promise: Promise<PDFDocument>;
        };
    };
    Tesseract?: {
        recognize: (
            image: string,
            lang: string,
            options?: {
                logger: (m: { status: string; progress: number }) => void;
            }
        ) => Promise<{
            data: {
                text: string;
            };
        }>;
    };
}

interface PDFDocument {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPage>;
}

interface PDFPage {
    getViewport: (options: { scale: number }) => PDFPageViewport;
    render: (options: {
        canvasContext: CanvasRenderingContext2D;
        viewport: PDFPageViewport;
    }) => {
        promise: Promise<void>;
    };
}

interface PDFPageViewport {
    width: number;
    height: number;
} 