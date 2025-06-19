"use client";

import Head from "next/head";

export default function About() {
        return (
                <>
                        <Head>
                                <title>About Us - BitMakerPDF</title>
                                <meta
                                        name="description"
                                        content="Learn about BitMakerPDF - Your trusted partner for PDF tools and solutions. Our mission, values, and commitment to quality."
                                />
                        </Head>
                        <div className="max-w-4xl mx-auto px-4 py-12">
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-8">About BitMakerPDF</h1>

                                        <div className="prose prose-blue max-w-none">
                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                At BitMakerPDF, we&apos;re dedicated to making PDF manipulation simple, efficient, and accessible to everyone. Our mission is to provide high-quality, user-friendly PDF tools that help people work smarter, not harder.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                We offer a comprehensive suite of PDF tools designed to meet your everyday needs:
                                                        </p>
                                                        <ul className="list-disc pl-6 text-gray-600 mb-4">
                                                                <li>Convert images to PDF</li>
                                                                <li>Merge multiple PDF files</li>
                                                                <li>Add watermarks to PDFs</li>
                                                                <li>Convert PDFs to images</li>
                                                                <li>Extract text from PDFs</li>
                                                                <li>View PDFs online</li>
                                                        </ul>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="bg-gray-50 p-6 rounded-lg">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">User-First Approach</h3>
                                                                        <p className="text-gray-600">
                                                                                We prioritize user experience and make our tools intuitive and easy to use.
                                                                        </p>
                                                                </div>
                                                                <div className="bg-gray-50 p-6 rounded-lg">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
                                                                        <p className="text-gray-600">
                                                                                Your data security is our top priority. All processing is done locally in your browser.
                                                                        </p>
                                                                </div>
                                                                <div className="bg-gray-50 p-6 rounded-lg">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality & Reliability</h3>
                                                                        <p className="text-gray-600">
                                                                                We maintain high standards in our tools and services to ensure reliable performance.
                                                                        </p>
                                                                </div>
                                                                <div className="bg-gray-50 p-6 rounded-lg">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuous Improvement</h3>
                                                                        <p className="text-gray-600">
                                                                                We constantly update and improve our tools based on user feedback and needs.
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us</h2>
                                                        <ul className="list-disc pl-6 text-gray-600 mb-4">
                                                                <li>Free to use - no hidden costs</li>
                                                                <li>No installation required</li>
                                                                <li>Fast and efficient processing</li>
                                                                <li>Secure and private</li>
                                                                <li>Regular updates and improvements</li>
                                                                <li>User-friendly interface</li>
                                                        </ul>
                                                </section>

                                                <section>
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                Have questions or suggestions? We&apos;d love to hear from you. Contact us at:
                                                        </p>
                                                        <p className="text-gray-600">
                                                                Email: support@bitmakerpdf.com
                                                        </p>
                                                </section>
                                        </div>
                                </div>
                        </div>
                </>
        );
}