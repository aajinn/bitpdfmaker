import Link from "next/link"

export default function RootLayout({
        children,
}: {
        children: React.ReactNode
}) {
        return (
                <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
                        <header className="bg-white shadow ">
                                <nav className=" ml-3  w-full justify-center container mx-auto py-4 flex gap-6">
                                        <Link
                                                href={'/'}
                                                prefetch={true}
                                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                                Home
                                        </Link>
                                        <Link
                                                href={'/about'}
                                                prefetch={true}
                                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                                About
                                        </Link>
                                        <Link
                                                href={'/privacy'}
                                                prefetch={true}
                                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                                Privacy
                                        </Link>
                                        <Link
                                                href={'/terms'}
                                                prefetch={true}
                                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                                Terms
                                        </Link>
                                        <Link
                                                href={'/contact'}
                                                prefetch={true}
                                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                                Contact
                                        </Link>
                                </nav>
                        </header>
                        <main className="flex-1 container mx-auto ml-3 text-2xl break-words ">
                                {children}
                        </main>
                        <footer className="bg-gray-100 border-t">
                                <div className="container mx-auto py-8 text-center text-gray-500 text-sm">
                                        {/* Footer content */}
                                        &copy; {new Date().getFullYear()} BitMakerPdf. All rights reserved.
                                </div>
                        </footer>
                </div>
        )
}