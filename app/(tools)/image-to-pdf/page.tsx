"use client";

import { useState, useRef } from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Image from "next/image";
import Head from "next/head";
import Tool from "./Tool";

interface ImageFile {
        file: File;
        preview: string;
}

export default function ImageToPDFPage() {
        return (
                <>
                        <Head>
                                <title>Convert Images to PDF - Free Online Tool</title>
                                <meta name="description" content="Convert multiple images to PDF online for free. Support for JPG, PNG, and GIF formats. Easy to use, no registration required." />
                                <meta name="keywords" content="image to pdf, convert images to pdf, jpg to pdf, png to pdf, gif to pdf, free pdf converter" />
                                <meta name="robots" content="index, follow" />
                                <meta property="og:title" content="Convert Images to PDF - Free Online Tool" />
                                <meta property="og:description" content="Convert multiple images to PDF online for free. Support for JPG, PNG, and GIF formats. Easy to use, no registration required." />
                                <meta property="og:type" content="website" />
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Convert Images to PDF - Free Online Tool" />
                                <meta name="twitter:description" content="Convert multiple images to PDF online for free. Support for JPG, PNG, and GIF formats. Easy to use, no registration required." />
                                <link rel="canonical" href="https://bitpdfmaker.pro/image-to-pdf" />
                        </Head>
                        <Header />
                        <ExternalScripts />
                        <Tool />
                </>
        );
} 