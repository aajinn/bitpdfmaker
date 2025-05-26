declare namespace PDFJS {
    interface GlobalWorkerOptions {
        workerSrc: string;
    }
}

interface Window {
    pdfjsLib: {
        GlobalWorkerOptions: PDFJS.GlobalWorkerOptions;
    };
} 