"use client";

import Link from "next/link";

interface Tool {
        name: string;
        description: string;
        path: string;
        icon: React.ReactNode;
}

const tools: Tool[] = [
        {
                name: "Image to PDF",
                description: "Convert images to PDF format",
                path: "/image-to-pdf",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                ),
        },
        {
                name: "Merge PDF",
                description: "Combine multiple PDF files",
                path: "/merge-pdf",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                ),
        },
        {
                name: "PDF Watermark",
                description: "Add watermarks to PDF files",
                path: "/pdf-watermark",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                ),
        },
        {
                name: "PDF to Image",
                description: "Convert PDF pages to images",
                path: "/pdf-to-image",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                ),
        },
        {
                name: "Extract Text from PDF",
                description: "Extract text content from PDF files",
                path: "/extract-text-from-pdf",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                ),
        },
        {
                name: "PDF Viewer",
                description: "View and navigate PDF files online",
                path: "/pdf-viewer",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                ),
        },
        {
                name: "PDF Metadata Editor",
                description: "Edit PDF properties: title, author, keywords, and more",
                path: "/pdf-metadata-editor",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h5M8 8h8" />
                        </svg>
                ),
        },
        {
                name: "PDF Comparison",
                description: "Compare two PDF files and highlight differences",
                path: "/pdf-comparison",
                icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3" y="5" width="7" height="14" rx="2" strokeWidth="2" />
                                <rect x="14" y="5" width="7" height="14" rx="2" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 12h4" />
                        </svg>
                ),
        },
];

interface ToolListProps {
        className?: string;
        showDescription?: boolean;
        gridCols?: 1 | 2 | 3 | 4;
}

export default function ToolList({ className = "", showDescription = true, gridCols = 2 }: ToolListProps) {
        return (
                <div className={`grid grid-cols-1 ${gridCols === 2 ? 'md:grid-cols-2' : gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 ${className}`}>
                        {tools.map((tool) => (
                                <Link
                                        key={tool.path}
                                        href={tool.path}
                                        className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-100"
                                >
                                        <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                        {tool.icon}
                                                </div>
                                                <div>
                                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {tool.name}
                                                        </h3>
                                                        {showDescription && (
                                                                <p className="mt-1 text-sm text-gray-600">
                                                                        {tool.description}
                                                                </p>
                                                        )}
                                                </div>
                                        </div>
                                </Link>
                        ))}
                </div>
        );
} 