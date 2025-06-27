"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
     const [isMenuOpen, setIsMenuOpen] = useState(false);

     return (
          <header className="w-full max-w-5xl mb-4 md:mb-6 mx-auto px-4">
               <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-600">
                         <span className="text-green-700">Bit</span>Maker
                         <span className="text-red-600">Pdf</span>
                    </h1>

                    {/* Mobile Menu Button */}
                    <button
                         onClick={() => setIsMenuOpen(!isMenuOpen)}
                         className="md:hidden mt-2 p-2 text-gray-800 hover:text-indigo-600 focus:outline-none"
                         aria-label="Toggle menu"
                    >
                         <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                         >
                              {isMenuOpen ? (
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                   />
                              ) : (
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                   />
                              )}
                         </svg>
                    </button>

                    {/* Navigation Menu */}
                    <nav
                         className={`${isMenuOpen ? "flex" : "hidden"
                              } md:flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-800 mt-2 md:mt-3 w-full md:w-auto`}
                    >
                         <Link
                              href="/"
                              prefetch={true}
                              className="w-full md:w-auto text-center py-2 px-4 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                         >
                              Home
                         </Link>
                         <Link
                              href="/about"
                              prefetch={true}
                              className="w-full md:w-auto text-center py-2 px-4 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                         >
                              About
                         </Link>
                         <Link
                              href="/privacy"
                              prefetch={true}
                              className="w-full md:w-auto text-center py-2 px-4 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                         >
                              Privacy
                         </Link>
                         <Link
                              href="/terms"
                              prefetch={true}
                              className="w-full md:w-auto text-center py-2 px-4 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                         >
                              Terms
                         </Link>
                         <Link
                              href="/contact"
                              prefetch={true}
                              className="w-full md:w-auto text-center py-2 px-4 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                         >
                              Contact
                         </Link>
                    </nav>
               </div>
          </header>
     );
}
