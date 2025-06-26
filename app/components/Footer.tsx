"use client";

export default function Footer() {
        return (
                <footer className="w-full py-6 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600 mt-8">
                        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                                <span>&copy; {new Date().getFullYear()} BitPDFMaker. All rights reserved.</span>
                                <span className="block sm:inline text-gray-400">All processing is done in your browser. Your files never leave your device.</span>
                        </div>
                </footer>
        );
} 