import Link from "next/link";

export default function Header() {
     return (
          <header className="w-full max-w-5xl mb-4 md:mb-6 mx-auto ">
               <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-400">
                    <span className="text-green-500">Bit</span>Maker
                    <span className="text-red-600">Pdf</span>
                    <nav className="space-x-4 text-gray-800 mt-2 md:mt-3">
                         <Link href="/" prefetch={true}>
                              Home
                         </Link>
                         <Link href="/about" prefetch={true}>
                              About
                         </Link>
                         <Link href="/privacy" prefetch={true}>
                              Privacy
                         </Link>
                         <Link href="/terms" prefetch={true}>
                              Terms
                         </Link>
                         <Link href="/contact" prefetch={true}>
                              Contact
                         </Link>
                    </nav>
               </h1>
          </header>
     );
}
