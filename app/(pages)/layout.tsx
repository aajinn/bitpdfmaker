import Link from "next/link";
import Header from "../component/Header";

export default function RootLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
               <Header />
               <main className="flex-1 container mx-auto ml-3 text-2xl break-words ">
                    {children}
               </main>
               <footer className="bg-gray-100 border-t">
                    <div className="container mx-auto py-8 text-center text-gray-500 text-sm">
                         {/* Footer content */}
                         &copy; {new Date().getFullYear()} BitMakerPdf. All
                         rights reserved.
                    </div>
               </footer>
          </div>
     );
}
