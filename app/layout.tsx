import "./globals.css";
import ExternalScripts from "./components/ExternalScripts";

export const metadata = {
     title: "BitPDFMaker - PDF Note Extractor & Cheat Sheet Generator",
     description:
          "Convert PDFs into compact cheat-ready sheets by extracting key notes and placing them into small boxes.",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="en">
               <body>
                    <ExternalScripts />
                    {children}
               </body>
          </html>
     );
}
