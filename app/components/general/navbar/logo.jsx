
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center text-gray-300 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap">
      <span className="flex bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">Bem</span>
      <span className="hidden xs:inline text-gray-200 ml-2">Site Developer</span>
      <span className="inline xs:hidden text-gray-200 ml-2">Site</span>
    </Link>
  )
}