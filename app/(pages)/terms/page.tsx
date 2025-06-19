"use client";

import Head from "next/head";

export default function Terms() {
        return (
                <>
                        <Head>
                                <title>Terms of Service - BitMakerPDF</title>
                                <meta
                                        name="description"
                                        content="Terms of Service for BitMakerPDF - Learn about our terms, conditions, and user agreements."
                                />
                        </Head>
                        <div className="max-w-4xl mx-auto px-4 py-12">
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                                        <div className="prose prose-blue max-w-none">
                                                <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                By accessing and using BitMakerPDF, you accept and agree to be bound by the terms and provision of this agreement.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                Permission is granted to temporarily use BitMakerPDF for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                                                        </p>
                                                        <ul className="list-disc pl-6 text-gray-600 mb-4">
                                                                <li>Modify or copy the materials</li>
                                                                <li>Use the materials for any commercial purpose</li>
                                                                <li>Attempt to decompile or reverse engineer any software contained on BitMakerPDF</li>
                                                                <li>Remove any copyright or other proprietary notations from the materials</li>
                                                                <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                                                        </ul>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                                                        <p className="text-gray-600 mb-4">As a user of BitMakerPDF, you agree to:</p>
                                                        <ul className="list-disc pl-6 text-gray-600 mb-4">
                                                                <li>Provide accurate information when using our services</li>
                                                                <li>Use the service in compliance with all applicable laws</li>
                                                                <li>Not upload any malicious content or files</li>
                                                                <li>Not attempt to disrupt the service</li>
                                                                <li>Not use the service for any illegal purposes</li>
                                                        </ul>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Disclaimer</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                The materials on BitMakerPDF are provided on an &apos;as is&apos; basis. BitMakerPDF makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitations</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                In no event shall BitMakerPDF or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BitMakerPDF.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Accuracy of Materials</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                The materials appearing on BitMakerPDF could include technical, typographical, or photographic errors. BitMakerPDF does not warrant that any of the materials on its website are accurate, complete, or current.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Links</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                BitMakerPDF has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BitMakerPDF of the site.
                                                        </p>
                                                </section>

                                                <section className="mb-8">
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modifications</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                BitMakerPDF may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                                                        </p>
                                                </section>

                                                <section>
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
                                                        <p className="text-gray-600 mb-4">
                                                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                                                        </p>
                                                </section>
                                        </div>
                                </div>
                        </div>
                </>
        );
}