import React from 'react'
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className='mt-16 border-t border-slate-800 bg-slate-950'>
      <div className='content-wrap py-8'>
        <div className='flex flex-col items-start justify-between gap-6 md:flex-row'>
          <div>
            <h3 className='text-base font-semibold text-white'>Tech Blog</h3>
            <p className='mt-2 max-w-md text-sm text-slate-400'>
              New clean frontend, same backend logic. Your API/auth/database remain untouched.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <Link href='/' className='text-sm text-slate-400 hover:text-white'>Home</Link>
            <Link href='/articles' className='text-sm text-slate-400 hover:text-white'>Articles</Link>
            <Link href='/about' className='text-sm text-slate-400 hover:text-white'>About</Link>
            <Link href='/write' className='text-sm text-slate-400 hover:text-white'>Write</Link>
          </div>

          <div className='flex items-center gap-3 text-slate-400'>
            <a href='https://github.com' target='_blank' rel='noopener noreferrer' aria-label='GitHub'>
              <FaGithub size={18} />
            </a>
            <a href='https://www.linkedin.com' target='_blank' rel='noopener noreferrer' aria-label='LinkedIn'>
              <FaLinkedin size={18} />
            </a>
            <a href='mailto:hello@example.com' aria-label='Email'>
              <FaEnvelope size={18} />
            </a>
          </div>
        </div>

        <p className='mt-6 text-xs text-slate-500'>© {new Date().getFullYear()} Tech Blog</p>
      </div>
    </footer>
  )
}
