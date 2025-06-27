import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ExternalScripts from "./components/ExternalScripts";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
     title: "BitPDFMaker - PDF Tools",
     description: "A collection of useful PDF tools for your daily needs",
     keywords: ["PDF", "tools", "converter", "viewer", "editor"],
     authors: [{ name: "BitPDFMaker Team" }],
     creator: "BitPDFMaker",
     publisher: "BitPDFMaker",
     robots: "index, follow",
     openGraph: {
          type: "website",
          locale: "en_US",
          url: "https://bitpdfmaker.pro",
          title: "BitPDFMaker - PDF Tools",
          description: "A collection of useful PDF tools for your daily needs",
          siteName: "BitPDFMaker",
     },
     twitter: {
          card: "summary_large_image",
          title: "BitPDFMaker - PDF Tools",
          description: "A collection of useful PDF tools for your daily needs",
          creator: "@bitpdfmaker",
     },
     icons: {
          icon: "/favicon.ico",
          apple: "/apple-touch-icon.png",
     },
};

export const viewport: Viewport = {
     width: "device-width",
     initialScale: 1,
     maximumScale: 5,
     userScalable: true,
     viewportFit: "cover",
};

export default function RootLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <html lang="en" className="h-full">
               <body className={`${inter.className} h-full min-h-screen flex flex-col`}>
                    <ExternalScripts />
                    {children}

               </body>
          </html>
     );
}
