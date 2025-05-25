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
               <footer className="text-bg-indigo-400 py-6 text-center select-none">
                    &copy; {new Date().getFullYear()} BitMakerPdf. All rights
                    reserved.
               </footer>
          </div>
     );
}
