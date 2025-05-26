import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ExternalScripts from "./components/ExternalScripts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
     title: "BitMakerPdf - PDF Tools",
     description: "A collection of useful PDF tools for your daily needs",
     keywords: ["PDF", "tools", "converter", "viewer", "editor"],
     authors: [{ name: "BitMakerPdf Team" }],
     creator: "BitMakerPdf",
     publisher: "BitMakerPdf",
     robots: "index, follow",
     openGraph: {
          type: "website",
          locale: "en_US",
          url: "https://bitmakerpdf.com",
          title: "BitMakerPdf - PDF Tools",
          description: "A collection of useful PDF tools for your daily needs",
          siteName: "BitMakerPdf",
     },
     twitter: {
          card: "summary_large_image",
          title: "BitMakerPdf - PDF Tools",
          description: "A collection of useful PDF tools for your daily needs",
          creator: "@bitmakerpdf",
     },
     icons: {
          icon: "/favicon.ico",
          apple: "/apple-touch-icon.png",
     },
};

export const viewport: Viewport = {
     width: "device-width",
     initialScale: 1,
     maximumScale: 1,
     userScalable: false,
     viewportFit: "cover",
};

export default function RootLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <html lang="en" className="h-full">
               <head>
                    <script
                         src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
                         defer
                    ></script>
               </head>
               <body className={`${inter.className} h-full min-h-screen flex flex-col`}>
                    <ExternalScripts />
                    {children}
               </body>
          </html>
     );
}
