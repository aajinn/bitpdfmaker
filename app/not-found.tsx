"use client";

import Link from "next/link";
import Header from "./components/Header";
import ToolList from "./components/ToolList";

export default function NotFound() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Header />
                        <main className="container mx-auto px-4 py-16">
                                <div className="max-w-2xl mx-auto text-center">
                                        <div className="bg-white rounded-lg shadow-md p-8">
                                                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                                                <p className="text-gray-600 mb-8">
                                                        The page you are looking for might have been removed, had its name changed,
                                                        or is temporarily unavailable.
                                                </p>
                                                <div className="space-y-8">
                                                        <Link
                                                                href="/"
                                                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                                Go to Homepage
                                                        </Link>
                                                        <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tools</h3>
                                                                <ToolList gridCols={2} />
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </main>
                </div>
        );
} 