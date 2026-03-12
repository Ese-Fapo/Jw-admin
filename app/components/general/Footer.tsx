import React from 'react'
import Link from 'next/link'
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaHeart, FaFacebook, FaInstagram } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className='relative bg-linear-to-br from-slate-950 via-gray-900 to-black border-t border-gray-800 mt-20 overflow-hidden'>
      {/* Decorative gradient overlay */}
      <div className='absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500 via-orange-500 to-pink-500'></div>
      <div className='absolute -top-24 -left-16 w-64 h-64 bg-linear-to-br from-amber-600/30 via-orange-600/20 to-pink-600/10 blur-3xl rounded-full'></div>
      <div className='absolute -bottom-24 -right-10 w-72 h-72 bg-linear-to-br from-rose-500/20 via-amber-500/15 to-orange-500/10 blur-3xl rounded-full'></div>
      
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <h3 className='text-2xl font-bold bg-linear-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm'>
               Bem Site Developer
            </h3>
            <p className='text-gray-400 text-sm leading-relaxed'>
              Desenvolvimento web moderno, performance e experiências digitais feitas sob medida.
            </p>
            <div className='flex gap-3'>
              <a href='https://github.com/arumemi' target='_blank' rel='noopener noreferrer' 
                className='p-2 bg-gray-800/80 hover:bg-linear-to-br hover:from-gray-700 hover:to-gray-900 rounded-lg transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-cyan-500/50'>
                <FaGithub size={20} className='text-gray-300 group-hover:text-white' />
              </a>
              
              
              <a href='https://www.linkedin.com/in/ese-fapohunda-118594360/' target='_blank' rel='noopener noreferrer'
                className='p-2 bg-gray-800/80 hover:bg-linear-to-br hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-blue-500/60'>
                <FaLinkedin size={20} className='text-gray-300' />
              </a>
              <a href='mailto:esefapohunda@gmail.com' target='blank' rel='noopener noreferrer'
                className='p-2 bg-gray-800/80 hover:bg-linear-to-br hover:from-emerald-600 hover:to-cyan-600 rounded-lg transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-emerald-500/60'>
                <FaEnvelope size={20} className='text-gray-300' />
                
              </a>
              <a href='https://www.facebook.com/essi.faps.2025' target='_blank' rel='noopener noreferrer'
                className='p-2 bg-gray-800/80 hover:bg-linear-to-br hover:from-blue-500 hover:to-indigo-600 rounded-lg transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-indigo-500/60'>
                <FaFacebook size={20} className='text-gray-300' />
              </a>
              <a href='https://www.instagram.com/easy_ese_1/' target='_blank' rel='noopener noreferrer'
                className='p-2 bg-gray-800/80 hover:bg-linear-to-br hover:from-pink-500 hover:via-purple-500 hover:to-amber-500 rounded-lg transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-pink-500/60'>
                <FaInstagram size={20} className='text-gray-300' />
              </a>
              
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-white font-semibold text-lg mb-4'>Links Rápidos</h4>
            <ul className='space-y-3'>
              <li>
                <Link href='/' className='text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm'>
                  Início
                </Link>
              </li>
              <li>
                <Link href='/articles' className='text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm'>
                  Artigos
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm'>
                  Sobre
                </Link>
              </li>
              <li>
                <Link href='/write' className='text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm'>
                  Escrever
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className='space-y-4'>
            <h4 className='text-white font-semibold text-lg mb-4'>Categorias</h4>
            <ul className='space-y-3'>
              <li>
                <Link href='/articles?category=react' className='text-gray-400 hover:text-purple-300 transition-colors duration-300 text-sm'>
                  E-commerce
                </Link>
              </li>
              <li>
                <Link href='/articles?category=python' className='text-gray-400 hover:text-purple-300 transition-colors duration-300 text-sm'>
                  landing Pages
                </Link>
              </li>
              <li>
                <Link href='/articles?category=devops' className='text-gray-400 hover:text-purple-300 transition-colors duration-300 text-sm'>
                  Portfólios
                </Link>
              </li>
              <li>
                <Link href='/articles?category=database' className='text-gray-400 hover:text-purple-300 transition-colors duration-300 text-sm'>
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className='space-y-4'>
            <h4 className='text-white font-semibold text-lg mb-4'>Newsletter</h4>
            <p className='text-gray-400 text-sm mb-4'>
              Receba as últimas atualizações diretamente no seu email.
            </p>
            <div className='flex flex-col gap-2'>
              <Link href='mailto:esefapohunda@gmail.com' className='text-gray-400 hover:text-cyan-300 transition-colors duration-300 text-sm'>
              <input 
                type='email' 
                placeholder='seu@email.com'
                className='px-4 py-2 bg-gray-800/80 border border-gray-700/70 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-gray-500'
              />
              </Link>
              <button className='px-4 py-2 bg-linear-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 text-sm shadow-lg shadow-cyan-900/30'>
                Inscrever-se
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-gray-800'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-gray-400 text-sm text-center md:text-left'>
              © {new Date().getFullYear()} Bem Site Developer. Todos os direitos reservados.
            </p>
            <div className='flex items-center gap-1 text-gray-400 text-sm'>
             
              <FaHeart className='text-red-600 animate-pulse' size={14} />
              <FaHeart className='text-red-600 animate-pulse' size={14} />
              <FaHeart className='text-red-600 animate-pulse' size={14} />
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
