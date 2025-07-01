"use client";

import { tools } from './ToolList';
import MergePdfTool from '../(tools)/merge-pdf/Tool';
import PdfWatermarkTool from '../(tools)/pdf-watermark/Tool';
import PdfToImageTool from '../(tools)/pdf-to-image/Tool';
import ExtractTextFromPdfTool from '../(tools)/extract-text-from-pdf/Tool';
import PdfViewerTool from '../(tools)/pdf-viewer/Tool';
import PdfMetadataEditorTool from '../(tools)/pdf-metadata-editor/Tool';
import PdfComparisonTool from '../(tools)/pdf-comparison/Tool';
import SplitPdfTool from '../(tools)/split-pdf/Tool';
import ImageToPdfTool from '../(tools)/image-to-pdf/Tool';
import PdfEditor from './PdfEditor';

const toolComponents: { [key: string]: React.ComponentType } = {
        '/image-to-pdf': ImageToPdfTool,
        '/merge-pdf': MergePdfTool,
        '/pdf-watermark': PdfWatermarkTool,
        '/pdf-to-image': PdfToImageTool,
        '/extract-text-from-pdf': ExtractTextFromPdfTool,
        '/pdf-viewer': PdfViewerTool,
        '/pdf-metadata-editor': PdfMetadataEditorTool,
        '/pdf-comparison': PdfComparisonTool,
        '/split-pdf': SplitPdfTool,
        '/pdf-editor': PdfEditor,
};

export default function AllTools() {
        return (
                <div className="space-y-16">
                        {tools.map(tool => {
                                const ToolComponent = toolComponents[tool.path];
                                return (
                                        <section key={tool.path} id={tool.path.replace('/', '')} className="py-16 bg-white">
                                                <div className="container mx-auto px-4">
                                                        <div className="max-w-4xl mx-auto">
                                                                {ToolComponent ? (
                                                                        <>
                                                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{tool.name}</h2>
                                                                                <ToolComponent />
                                                                        </>
                                                                ) : (
                                                                        <div className="bg-white rounded-lg shadow-md p-6">
                                                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h2>
                                                                                <p className="text-gray-600">This tool will be available soon.</p>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </section>
                                );
                        })}
                </div>
        );
} 