"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { loadJsPDF, loadPdfLib } from "./ExternalScripts";
import ReactDOM from "react-dom";

interface PdfEditorProps {
        onSave?: (pdfBlob: Blob) => void;
        className?: string;
}

interface TextElement {
        id: string;
        text: string;
        x: number;
        y: number;
        fontSize: number;
        fontFamily: string;
        color: string;
        alignment: 'left' | 'center' | 'right';
        isSelected: boolean;
        width: number;
        height: number;
        boxY?: number;
        boxHeight?: number;
        fontWeight: string;
        fontStyle: string;
        textDecoration: string;
}

interface PageData {
        id: string;
        pageNumber: number;
        textElements: TextElement[];
        background?: string;
}

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY = "Arial";
const DEFAULT_COLOR = "#000000";
const PAGE_WIDTH = 595; // A4 width in points
const PAGE_HEIGHT = 842; // A4 height in points

export default function PdfEditor({ onSave, className = "" }: PdfEditorProps) {
        const [pages, setPages] = useState<PageData[]>([
                { id: "1", pageNumber: 1, textElements: [] }
        ]);
        const [currentPage, setCurrentPage] = useState(1);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

        // Text editing state
        const [textInput, setTextInput] = useState("");
        const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
        const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILY);
        const [textColor, setTextColor] = useState(DEFAULT_COLOR);
        const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

        const canvasRef = useRef<HTMLCanvasElement>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const textInputRef = useRef<HTMLInputElement>(null);

        const currentPageData = pages.find(page => page.pageNumber === currentPage);

        // Improved text positioning with coordinate conversion
        const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
                const canvas = canvasRef.current;
                if (!canvas) return { x: 0, y: 0 };

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                return {
                        x: (clientX - rect.left) * scaleX,
                        y: (clientY - rect.top) * scaleY
                };
        }, []);

        const drawPageContents = useCallback(async (ctx: CanvasRenderingContext2D, pageData: PageData, width: number, height: number, forExport = false) => {
                // Clear canvas
                ctx.clearRect(0, 0, width, height);

                // Draw page background
                if (pageData.background) {
                        await new Promise<void>((resolve) => {
                                const img = new Image();
                                img.onload = () => {
                                        ctx.drawImage(img, 0, 0, width, height);
                                        resolve();
                                };
                                img.onerror = (err) => {
                                        console.error("Failed to load page background image", err);
                                        // Draw white background on error
                                        ctx.fillStyle = '#ffffff';
                                        ctx.fillRect(0, 0, width, height);
                                        resolve();
                                };
                                img.src = pageData.background;
                        });
                } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, width, height);
                }

                // Draw page border
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, width, height);

                // Draw grid lines (optional visual aid)
                if (!forExport) {
                        ctx.strokeStyle = '#f0f0f0';
                        ctx.lineWidth = 0.5;
                        ctx.setLineDash([2, 2]);

                        // Vertical grid lines every 50 points
                        for (let x = 50; x < width; x += 50) {
                                ctx.beginPath();
                                ctx.moveTo(x, 0);
                                ctx.lineTo(x, height);
                                ctx.stroke();
                        }

                        // Horizontal grid lines every 50 points
                        for (let y = 50; y < height; y += 50) {
                                ctx.beginPath();
                                ctx.moveTo(0, y);
                                ctx.lineTo(width, y);
                                ctx.stroke();
                        }

                        ctx.setLineDash([]);
                }

                // Draw text elements
                pageData.textElements.forEach(element => {
                        // Draw a white rectangle to hide the original text on the background image
                        ctx.fillStyle = '#ffffff';

                        let rectX = element.x;
                        // Adjust x-position for the whiteout box based on text alignment
                        if (element.alignment === 'center') {
                                rectX -= element.width / 2;
                        } else if (element.alignment === 'right') {
                                rectX -= element.width;
                        }

                        // Use precise box coordinates if available, otherwise fallback to estimation.
                        const rectY = element.boxY ?? element.y - element.height;
                        const rectHeight = element.boxHeight ?? element.height;

                        // Add some padding to ensure the original text is fully covered.
                        ctx.fillRect(rectX - 2, rectY, element.width + 4, rectHeight + 2);

                        // --- FONT FORMATTING ---
                        const fontWeight = element.fontWeight || 'normal';
                        const fontStyle = element.fontStyle || 'normal';
                        ctx.font = `${fontStyle} ${fontWeight} ${element.fontSize}px ${element.fontFamily}`;
                        ctx.fillStyle = element.color;
                        ctx.textAlign = element.alignment;

                        // The x position is element.x. The `textAlign` property handles rendering based on alignment.
                        const x = element.x;

                        // Draw selection border
                        if (element.isSelected && !forExport) {
                                ctx.strokeStyle = '#007bff';
                                ctx.lineWidth = 2;
                                ctx.setLineDash([5, 5]);

                                // Draw selection rectangle, accounting for alignment
                                let rectX = element.x;
                                if (element.alignment === 'center') {
                                        rectX -= element.width / 2;
                                } else if (element.alignment === 'right') {
                                        rectX -= element.width;
                                }
                                rectX -= 5;
                                const rectY = element.y - element.fontSize - 5;
                                const rectWidth = element.width + 10;
                                const rectWidthHeight = element.height + 10;

                                ctx.strokeRect(rectX, rectY, rectWidth, rectWidthHeight);

                                // Draw selection handles
                                ctx.setLineDash([]);
                                ctx.lineWidth = 1;
                                ctx.fillStyle = '#007bff';

                                const handleSize = 6;
                                const handles = [
                                        { x: rectX, y: rectY }, // top-left
                                        { x: rectX + rectWidth, y: rectY }, // top-right
                                        { x: rectX, y: rectY + rectWidthHeight }, // bottom-left
                                        { x: rectX + rectWidth, y: rectY + rectWidthHeight } // bottom-right
                                ];

                                handles.forEach(handle => {
                                        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                                });
                        }

                        // Draw text
                        ctx.fillText(element.text, x, element.y);

                        // Draw underline if needed
                        if (element.textDecoration === 'underline') {
                                const metrics = ctx.measureText(element.text);
                                let underlineX = x;
                                if (element.alignment === 'center') {
                                        underlineX -= metrics.width / 2;
                                } else if (element.alignment === 'right') {
                                        underlineX -= metrics.width;
                                }
                                const underlineY = element.y + 2;
                                ctx.strokeStyle = element.color;
                                ctx.lineWidth = Math.max(1, element.fontSize / 16);
                                ctx.beginPath();
                                ctx.moveTo(underlineX, underlineY);
                                ctx.lineTo(underlineX + metrics.width, underlineY);
                                ctx.stroke();
                        }
                });
        }, []);

        // Canvas drawing functions
        const drawPage = useCallback(async (canvas: HTMLCanvasElement, pageData: PageData, forExport = false) => {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                await drawPageContents(ctx, pageData, canvas.width, canvas.height, forExport);
        }, [drawPageContents]);

        // Update canvas when page data changes
        useEffect(() => {
                if (canvasRef.current && currentPageData) {
                        const canvas = canvasRef.current;
                        canvas.width = PAGE_WIDTH;
                        canvas.height = PAGE_HEIGHT;
                        const render = async () => {
                                await drawPage(canvas, currentPageData, false);
                        };
                        render();
                }
        }, [currentPageData, drawPage]);

        // Mouse event handlers
        const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
                if (!currentPageData) return;

                const coords = getCanvasCoordinates(e.clientX, e.clientY);

                // Check if clicking on a text element, accounting for alignment
                const clickedElement = currentPageData.textElements.find(element => {
                        let elemX = element.x;
                        if (element.alignment === 'center') {
                                elemX -= element.width / 2;
                        } else if (element.alignment === 'right') {
                                elemX -= element.width;
                        }
                        return coords.x >= elemX - 5 && coords.x <= elemX + element.width + 5 &&
                                coords.y >= element.y - element.fontSize - 5 && coords.y <= element.y + 5;
                });

                // Deselect all elements
                setPages(prev => prev.map(page => ({
                        ...page,
                        textElements: page.textElements.map(element => ({
                                ...element,
                                isSelected: false
                        }))
                })));

                if (clickedElement) {
                        // Select clicked element
                        setSelectedElement(clickedElement);
                        setTextInput(clickedElement.text);
                        setFontSize(clickedElement.fontSize);
                        setFontFamily(clickedElement.fontFamily);
                        setTextColor(clickedElement.color);
                        setAlignment(clickedElement.alignment);

                        setPages(prev => prev.map(page => ({
                                ...page,
                                textElements: page.textElements.map(element => ({
                                        ...element,
                                        isSelected: element.id === clickedElement.id
                                }))
                        })));
                } else {
                        setSelectedElement(null);
                        setTextInput("");
                }
        }, [currentPageData, getCanvasCoordinates]);

        const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
                if (!selectedElement) return;

                const coords = getCanvasCoordinates(e.clientX, e.clientY);

                setDragOffset({
                        x: coords.x - selectedElement.x,
                        y: coords.y - selectedElement.y
                });
                setIsDragging(true);
        }, [selectedElement, getCanvasCoordinates]);

        const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
                if (!isDragging || !selectedElement) return;

                const coords = getCanvasCoordinates(e.clientX, e.clientY);
                const x = coords.x - dragOffset.x;
                const y = coords.y - dragOffset.y;

                // Update element position
                setPages(prev => prev.map(page => ({
                        ...page,
                        textElements: page.textElements.map(element =>
                                element.id === selectedElement.id
                                        ? { ...element, x, y }
                                        : element
                        )
                })));
        }, [isDragging, selectedElement, dragOffset, getCanvasCoordinates]);

        const handleCanvasMouseUp = useCallback(() => {
                setIsDragging(false);
        }, []);

        // Text editing functions
        const addTextElement = useCallback(() => {
                if (!textInput.trim() || !currentPageData) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.font = `${fontSize}px ${fontFamily}`;
                const metrics = ctx.measureText(textInput);
                const width = metrics.width;
                const height = fontSize;

                const newElement: TextElement = {
                        id: Date.now().toString(),
                        text: textInput,
                        x: 50,
                        y: 100,
                        fontSize,
                        fontFamily: fontFamily || DEFAULT_FONT_FAMILY,
                        color: textColor,
                        alignment,
                        isSelected: true,
                        width,
                        height,
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                        textDecoration: 'none'
                };

                // Deselect all other elements
                setPages(prev => prev.map(page => ({
                        ...page,
                        textElements: page.textElements.map(element => ({
                                ...element,
                                isSelected: false
                        }))
                })));

                // Add new element
                setPages(prev => prev.map(page =>
                        page.pageNumber === currentPage
                                ? { ...page, textElements: [...page.textElements, newElement] }
                                : page
                ));

                setSelectedElement(newElement);
                setTextInput("");
        }, [textInput, fontSize, fontFamily, textColor, alignment, currentPageData, currentPage]);

        const updateSelectedElement = useCallback(() => {
                if (!selectedElement || !textInput.trim()) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.font = `${fontSize}px ${fontFamily}`;
                const metrics = ctx.measureText(textInput);
                const width = metrics.width;
                const height = fontSize;

                setPages(prev => prev.map(page => ({
                        ...page,
                        textElements: page.textElements.map(element =>
                                element.id === selectedElement.id
                                        ? {
                                                ...element,
                                                text: textInput,
                                                fontSize,
                                                fontFamily: fontFamily || DEFAULT_FONT_FAMILY,
                                                color: textColor,
                                                alignment,
                                                width,
                                                height
                                        }
                                        : element
                        )
                })));
        }, [selectedElement, textInput, fontSize, fontFamily, textColor, alignment]);

        const deleteSelectedElement = useCallback(() => {
                if (!selectedElement) return;

                setPages(prev => prev.map(page => ({
                        ...page,
                        textElements: page.textElements.filter(element => element.id !== selectedElement.id)
                })));

                setSelectedElement(null);
                setTextInput("");
        }, [selectedElement]);

        // Page management
        const addPage = useCallback(() => {
                const newPageNumber = pages.length + 1;
                const newPage: PageData = {
                        id: Date.now().toString(),
                        pageNumber: newPageNumber,
                        textElements: []
                };
                setPages(prev => [...prev, newPage]);
                setCurrentPage(newPageNumber);
        }, [pages.length]);

        const removePage = useCallback((pageId: string) => {
                if (pages.length <= 1) {
                        setError("Cannot remove the last page");
                        return;
                }
                setPages(prev => prev.filter(page => page.id !== pageId));
                setCurrentPage(1);
                setError(null);
        }, [pages.length]);

        // PDF operations
        const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file || file.type !== 'application/pdf') {
                        setError('Please select a valid PDF file');
                        return;
                }

                setIsLoading(true);
                setError(null);

                try {
                        // Extract text from PDF using pdfjsLib
                        if (!window.pdfjsLib) {
                                throw new Error('PDF.js library not loaded');
                        }

                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                        const numPages = pdf.numPages;
                        const newPages: PageData[] = [];

                        for (let i = 1; i <= numPages; i++) {
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({ scale: 2.0 }); // For high-res background

                                const tempCanvas = document.createElement('canvas');
                                tempCanvas.width = viewport.width;
                                tempCanvas.height = viewport.height;
                                const tempCtx = tempCanvas.getContext('2d');

                                if (!tempCtx) {
                                        console.error(`Could not get canvas context for page ${i}`);
                                        continue;
                                }

                                await page.render({ canvasContext: tempCtx, viewport }).promise;

                                // Extract text elements to overlay
                                const textContent = await page.getTextContent();
                                const textElements: TextElement[] = [];
                                const rendererViewport = page.getViewport({ scale: 1.0 });

                                textContent.items.forEach((item: any, index: number) => {
                                        if (item.str && item.str.trim()) {
                                                let tx = item.transform;

                                                const style = textContent.styles[item.fontName];
                                                // Ascent and descent are fractions of font size.
                                                // Default values are heuristics if not available in style.
                                                const ascent = style.ascent || 0.75;
                                                const descent = style.descent || -0.25;

                                                const itemHeight = item.height; // Font size
                                                const boxHeight = (ascent - descent) * itemHeight;
                                                const boxY = tx[5] - ascent * itemHeight;

                                                const textElement: TextElement = {
                                                        id: `${i}-${index}`,
                                                        text: item.str,
                                                        x: tx[4],
                                                        y: tx[5],
                                                        fontSize: Math.round(itemHeight),
                                                        fontFamily: (style && style.fontFamily) ? style.fontFamily : DEFAULT_FONT_FAMILY,
                                                        color: DEFAULT_COLOR,
                                                        alignment: 'left',
                                                        isSelected: false,
                                                        width: item.width,
                                                        height: itemHeight,
                                                        boxY: boxY,
                                                        boxHeight: boxHeight,
                                                        fontWeight: 'normal',
                                                        fontStyle: 'normal',
                                                        textDecoration: 'none'
                                                };
                                                textElements.push(textElement);
                                        }
                                });

                                // Remove duplicate text elements (same text, x, y, fontSize)
                                const uniqueTextElements: TextElement[] = [];
                                textElements.forEach(el => {
                                        const isDuplicate = uniqueTextElements.some(existing =>
                                                existing.text === el.text &&
                                                Math.abs(existing.x - el.x) < 1 &&
                                                Math.abs(existing.y - el.y) < 1 &&
                                                existing.fontSize === el.fontSize
                                        );
                                        if (!isDuplicate) uniqueTextElements.push(el);
                                });

                                newPages.push({
                                        id: `${i}`,
                                        pageNumber: i,
                                        textElements: uniqueTextElements,
                                        background: tempCanvas.toDataURL('image/png')
                                });
                        }

                        setPages(newPages);
                        setCurrentPage(1);

                        if (newPages.length === 0) {
                                setError('Could not render any pages from the PDF.');
                        }
                } catch (err) {
                        console.error('PDF loading error:', err);
                        const message = err instanceof Error ? err.message : 'Unknown error';
                        setError(`Failed to load PDF file: ${message}. Please try again or start with a blank page.`);

                        // Create a blank page as fallback
                        const newPage: PageData = {
                                id: Date.now().toString(),
                                pageNumber: 1,
                                textElements: [{
                                        id: 'fallback',
                                        text: '',
                                        x: 50,
                                        y: 100,
                                        fontSize: 16,
                                        fontFamily: 'Arial',
                                        color: '#000000',
                                        alignment: 'left',
                                        isSelected: false,
                                        width: 120,
                                        height: 16,
                                        fontWeight: 'normal',
                                        fontStyle: 'normal',
                                        textDecoration: 'none'
                                }]
                        };
                        setPages([newPage]);
                        setCurrentPage(1);
                } finally {
                        setIsLoading(false);
                }
        }, []);

        const handleSave = useCallback(async () => {
                // If no content exists, create a default text element for testing
                let pagesToSave = pages;
                if (pages.every(page => page.textElements.length === 0 && !page.background)) {
                        setError('No content to save. Adding a test text element.');
                        const testPage: PageData = {
                                id: 'test',
                                pageNumber: 1,
                                textElements: [{
                                        id: 'test-element',
                                        text: 'Test PDF Export',
                                        x: 50,
                                        y: 100,
                                        fontSize: 16,
                                        fontFamily: 'Arial',
                                        color: '#000000',
                                        alignment: 'left',
                                        isSelected: false,
                                        width: 120,
                                        height: 16,
                                        fontWeight: 'normal',
                                        fontStyle: 'normal',
                                        textDecoration: 'none'
                                }]
                        };
                        pagesToSave = [testPage];
                }

                setIsLoading(true);
                setError(null);

                try {
                        await loadJsPDF();
                        const { jsPDF } = window.jspdf;

                        if (!jsPDF) {
                                throw new Error('jsPDF library not loaded');
                        }

                        const pdf = new jsPDF({
                                orientation: 'portrait',
                                unit: 'pt',
                                format: 'a4'
                        });

                        const SCALE_FACTOR = 3; // Increase for higher quality output

                        console.log('Creating PDF with', pagesToSave.length, 'pages');

                        for (const [pageIndex, page] of pagesToSave.entries()) {
                                if (pageIndex > 0) pdf.addPage();

                                const tempCanvas = document.createElement('canvas');
                                tempCanvas.width = PAGE_WIDTH * SCALE_FACTOR;
                                tempCanvas.height = PAGE_HEIGHT * SCALE_FACTOR;
                                const tempCtx = tempCanvas.getContext('2d');

                                if (!tempCtx) {
                                        console.error('Could not create temporary canvas context for PDF export');
                                        continue;
                                }

                                tempCtx.scale(SCALE_FACTOR, SCALE_FACTOR);
                                await drawPageContents(tempCtx, page, PAGE_WIDTH, PAGE_HEIGHT, true);

                                const imageData = tempCanvas.toDataURL('image/png');

                                pdf.addImage(imageData, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
                                console.log(`Added page ${pageIndex + 1} as image to PDF.`);
                        }

                        // Generate and save PDF
                        console.log('Generating PDF blob...');
                        const pdfBlob = pdf.output('blob');
                        console.log('PDF blob generated, size:', pdfBlob.size);

                        onSave?.(pdfBlob);
                        if (!onSave) {
                                pdf.save('edited-document.pdf');
                        }

                        console.log('PDF saved successfully');
                        setError(null); // Clear any previous errors
                } catch (err) {
                        console.error('PDF save error:', err);
                        const message = err instanceof Error ? err.message : 'Unknown error';
                        setError(`Failed to save PDF: ${message}`);
                } finally {
                        setIsLoading(false);
                }
        }, [pages, onSave, drawPageContents]);

        // Keyboard shortcuts
        useEffect(() => {
                const handleKeyDown = (e: KeyboardEvent) => {
                        if (e.ctrlKey || e.metaKey) {
                                switch (e.key) {
                                        case 's':
                                                e.preventDefault();
                                                handleSave();
                                                break;
                                        case 'z':
                                                e.preventDefault();
                                                // TODO: Implement undo functionality
                                                break;
                                        case 'y':
                                                e.preventDefault();
                                                // TODO: Implement redo functionality
                                                break;
                                }
                        } else {
                                switch (e.key) {
                                        case 'Delete':
                                        case 'Backspace':
                                                if (selectedElement) {
                                                        e.preventDefault();
                                                        deleteSelectedElement();
                                                }
                                                break;
                                        case 'Escape':
                                                if (selectedElement) {
                                                        e.preventDefault();
                                                        setSelectedElement(null);
                                                        setTextInput("");
                                                        setPages(prev => prev.map(page => ({
                                                                ...page,
                                                                textElements: page.textElements.map(element => ({
                                                                        ...element,
                                                                        isSelected: false
                                                                }))
                                                        })));
                                                }
                                                break;
                                }
                        }
                };

                document.addEventListener('keydown', handleKeyDown);
                return () => document.removeEventListener('keydown', handleKeyDown);
        }, [selectedElement, handleSave, deleteSelectedElement]);

        // In handleFileUpload, before any PDF operations, ensure pdf-lib is loaded
        useEffect(() => {
                loadPdfLib();
        }, []);

        return (
                <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                        {/* Modern Action Bar */}
                        <div className="w-full flex justify-center mb-8">
                                <div className="flex gap-4 px-6 py-4 bg-white/80 rounded-2xl shadow border border-gray-200 items-center">
                                        <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isLoading}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-50"
                                        >
                                                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                                                {isLoading ? "Loading..." : "Load PDF"}
                                        </button>
                                        <button
                                                onClick={addPage}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                        >
                                                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                                                Add Page
                                        </button>
                                        <button
                                                onClick={handleSave}
                                                disabled={isLoading || pages.every(page => page.textElements.length === 0)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50"
                                        >
                                                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                                                {isLoading ? "Saving..." : "Save PDF"}
                                        </button>
                                </div>
                        </div>

                        {/* Popup for selected text element */}
                        {selectedElement && (
                                <PopupEditor
                                        element={selectedElement}
                                        onChange={({ text, fontSize, fontFamily, color, alignment, fontWeight, fontStyle, textDecoration }) => {
                                                setTextInput(text);
                                                setFontSize(fontSize);
                                                setFontFamily(fontFamily);
                                                setTextColor(color);
                                                setAlignment(alignment);
                                                setPages(prev => prev.map(page => ({
                                                        ...page,
                                                        textElements: page.textElements.map(el =>
                                                                el.id === selectedElement.id
                                                                        ? { ...el, text, fontSize, fontFamily, color, alignment, fontWeight, fontStyle, textDecoration }
                                                                        : el
                                                        )
                                                })));
                                        }}
                                        onUpdate={updateSelectedElement}
                                        onDelete={deleteSelectedElement}
                                        onCancel={() => {
                                                setSelectedElement(null);
                                                setTextInput("");
                                                setPages(prev => prev.map(page => ({
                                                        ...page,
                                                        textElements: page.textElements.map(element => ({
                                                                ...element,
                                                                isSelected: false
                                                        }))
                                                })));
                                        }}
                                />
                        )}

                        {/* Hidden file input */}
                        <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                        />

                        {/* Error display */}
                        {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
                                </div>
                        )}

                        {/* Page navigation */}
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                                {pages.map((page) => (
                                        <button
                                                key={page.id}
                                                onClick={() => setCurrentPage(page.pageNumber)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page.pageNumber
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                        >
                                                Page {page.pageNumber}
                                        </button>
                                ))}
                        </div>

                        {/* Canvas Editor */}
                        {currentPageData && (
                                <div className="flex justify-center">
                                        <div className="relative">
                                                <canvas
                                                        ref={canvasRef}
                                                        width={PAGE_WIDTH}
                                                        height={PAGE_HEIGHT}
                                                        className="border border-gray-300 shadow-lg cursor-crosshair"
                                                        onClick={handleCanvasClick}
                                                        onMouseDown={handleCanvasMouseDown}
                                                        onMouseMove={handleCanvasMouseMove}
                                                        onMouseUp={handleCanvasMouseUp}
                                                        style={{
                                                                width: `${PAGE_WIDTH * 0.8}px`,
                                                                height: `${PAGE_HEIGHT * 0.8}px`
                                                        }}
                                                />
                                                <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
                                                        A4 Page ({PAGE_WIDTH} × {PAGE_HEIGHT} points)
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* Status Bar */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
                                        <div className="flex gap-4">
                                                <span>Total Pages: {pages.length}</span>
                                                <span>Current Page: {currentPage}</span>
                                                <span>Text Elements: {currentPageData?.textElements.length || 0}</span>
                                        </div>
                                        <div className="flex gap-4">
                                                {selectedElement && (
                                                        <>
                                                                <span>Selected: "{selectedElement.text}"</span>
                                                                <span>Position: ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})</span>
                                                                <span>Size: {selectedElement.fontSize}px</span>
                                                        </>
                                                )}
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                                <span className="bg-blue-100 px-2 py-1 rounded">Ctrl+S: Save</span>
                                                <span className="bg-blue-100 px-2 py-1 rounded">Delete: Remove</span>
                                                <span className="bg-blue-100 px-2 py-1 rounded">Esc: Deselect</span>
                                        </div>
                                </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Enter text in the input field and click "Add Text" to place it on the page</li>
                                        <li>• Click on any text element to select and edit it</li>
                                        <li>• Drag selected text elements to reposition them</li>
                                        <li>• Use the formatting controls to change font size, family, color, and alignment</li>
                                        <li>• Click "Update Text" to apply changes to selected text</li>
                                        <li>• Click "Delete Text" to remove selected text elements</li>
                                </ul>
                        </div>
                </div>
        );
}

// PopupEditor component for editing selected text element
function PopupEditor({
        element,
        onChange,
        onUpdate,
        onDelete,
        onCancel
}: {
        element: any,
        onChange: (fields: any) => void,
        onUpdate: () => void,
        onDelete: () => void,
        onCancel: () => void
}) {
        const [localText, setLocalText] = useState(element.text);
        const [localFontSize, setLocalFontSize] = useState(element.fontSize);
        const [localFontFamily, setLocalFontFamily] = useState(element.fontFamily);
        const [localColor, setLocalColor] = useState(element.color);
        const [localAlignment, setLocalAlignment] = useState(element.alignment);
        const [bold, setBold] = useState(element.fontWeight === "bold");
        const [italic, setItalic] = useState(element.fontStyle === "italic");
        const [underline, setUnderline] = useState(element.textDecoration === "underline");

        // Update parent on any change
        useEffect(() => {
                onChange({
                        text: localText,
                        fontSize: localFontSize,
                        fontFamily: localFontFamily,
                        color: localColor,
                        alignment: localAlignment,
                        fontWeight: bold ? "bold" : "normal",
                        fontStyle: italic ? "italic" : "normal",
                        textDecoration: underline ? "underline" : "none"
                });
                // eslint-disable-next-line
        }, [localText, localFontSize, localFontFamily, localColor, localAlignment, bold, italic, underline]);

        // Render popup in portal as a full-screen overlay
        return ReactDOM.createPortal(
                <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.3)" }}
                        onClick={onCancel}
                >
                        <div
                                className="popup-editor bg-white rounded-lg shadow-lg p-6"
                                style={{ minWidth: 320, maxWidth: 400 }}
                                onClick={e => e.stopPropagation()}
                        >
                                <div className="mb-2">
                                        <input
                                                type="text"
                                                value={localText}
                                                onChange={e => setLocalText(e.target.value)}
                                                className="w-full px-2 py-1 border rounded mb-2"
                                                placeholder="Edit text..."
                                        />
                                </div>
                                <div className="flex gap-2 mb-2">
                                        <select
                                                value={localFontSize}
                                                onChange={e => setLocalFontSize(Number(e.target.value))}
                                                className="px-2 py-1 border rounded"
                                        >
                                                {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                                                        <option key={size} value={size}>{size}px</option>
                                                ))}
                                        </select>
                                        <select
                                                value={localFontFamily}
                                                onChange={e => setLocalFontFamily(e.target.value)}
                                                className="px-2 py-1 border rounded"
                                        >
                                                <option value="Arial">Arial</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                                <option value="Georgia">Georgia</option>
                                                <option value="Verdana">Verdana</option>
                                                <option value="Helvetica">Helvetica</option>
                                        </select>
                                        <input
                                                type="color"
                                                value={localColor}
                                                onChange={e => setLocalColor(e.target.value)}
                                                className="w-8 h-8 border rounded"
                                        />
                                </div>
                                <div className="flex gap-2 mb-2">
                                        <button
                                                onClick={() => setLocalAlignment('left')}
                                                className={`px-2 py-1 rounded ${localAlignment === 'left' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >L</button>
                                        <button
                                                onClick={() => setLocalAlignment('center')}
                                                className={`px-2 py-1 rounded ${localAlignment === 'center' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >C</button>
                                        <button
                                                onClick={() => setLocalAlignment('right')}
                                                className={`px-2 py-1 rounded ${localAlignment === 'right' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >R</button>
                                        <button
                                                onClick={() => setBold(b => !b)}
                                                className={`px-2 py-1 rounded font-bold ${bold ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >B</button>
                                        <button
                                                onClick={() => setItalic(i => !i)}
                                                className={`px-2 py-1 rounded italic ${italic ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >I</button>
                                        <button
                                                onClick={() => setUnderline(u => !u)}
                                                className={`px-2 py-1 rounded underline ${underline ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >U</button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                        <button
                                                onClick={onUpdate}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >Update</button>
                                        <button
                                                onClick={onDelete}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        >Delete</button>
                                        <button
                                                onClick={onCancel}
                                                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                        >Cancel</button>
                                </div>
                        </div>
                </div>,
                document.body
        );
} 