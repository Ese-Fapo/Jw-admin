"use client";

import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
    >
      <FaHome className="text-lg group-hover:rotate-12 transition-transform duration-300" />
      <span className="font-medium">Home</span>
    </Link>
  );
}
