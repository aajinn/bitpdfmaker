"use client";

import { useState } from "react";
import Head from "next/head";

export default function Contact() {
        const [formData, setFormData] = useState({
                name: "",
                email: "",
                subject: "",
                message: "",
        });

        const handleSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                // Handle form submission
                console.log(formData);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({
                        ...prev,
                        [name]: value,
                }));
        };

        return (
                <>
                        <Head>
                                <title>Contact Us - BitMakerPDF</title>
                                <meta
                                        name="description"
                                        content="Get in touch with BitMakerPDF. We're here to help with your PDF tool needs and answer any questions you may have."
                                />
                        </Head>
                        <div className="max-w-4xl mx-auto px-4 py-12">
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                                                        <p className="text-gray-600 mb-6">
                                                                Have questions or need help? We're here to assist you. Fill out the form and we'll get back to you as soon as possible.
                                                        </p>

                                                        <div className="space-y-4">
                                                                <div className="flex items-start space-x-3">
                                                                        <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                                                />
                                                                        </svg>
                                                                        <div>
                                                                                <h3 className="font-medium text-gray-900">Email</h3>
                                                                                <p className="text-gray-600">support@bitmakerpdf.com</p>
                                                                        </div>
                                                                </div>

                                                                <div className="flex items-start space-x-3">
                                                                        <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                                />
                                                                        </svg>
                                                                        <div>
                                                                                <h3 className="font-medium text-gray-900">Response Time</h3>
                                                                                <p className="text-gray-600">Within 24 hours</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                        <div>
                                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Name
                                                                </label>
                                                                <input
                                                                        type="text"
                                                                        id="name"
                                                                        name="name"
                                                                        value={formData.name}
                                                                        onChange={handleChange}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        required
                                                                />
                                                        </div>

                                                        <div>
                                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Email
                                                                </label>
                                                                <input
                                                                        type="email"
                                                                        id="email"
                                                                        name="email"
                                                                        value={formData.email}
                                                                        onChange={handleChange}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        required
                                                                />
                                                        </div>

                                                        <div>
                                                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Subject
                                                                </label>
                                                                <select
                                                                        id="subject"
                                                                        name="subject"
                                                                        value={formData.subject}
                                                                        onChange={handleChange}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        required
                                                                >
                                                                        <option value="">Select a subject</option>
                                                                        <option value="general">General Inquiry</option>
                                                                        <option value="support">Technical Support</option>
                                                                        <option value="feedback">Feedback</option>
                                                                        <option value="business">Business Inquiry</option>
                                                                </select>
                                                        </div>

                                                        <div>
                                                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Message
                                                                </label>
                                                                <textarea
                                                                        id="message"
                                                                        name="message"
                                                                        value={formData.message}
                                                                        onChange={handleChange}
                                                                        rows={4}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        required
                                                                />
                                                        </div>

                                                        <button
                                                                type="submit"
                                                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                                Send Message
                                                        </button>
                                                </form>
                                        </div>
                                </div>
                        </div>
                </>
        );
}