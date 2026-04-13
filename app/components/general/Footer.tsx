import React from 'react'
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className='mt-16 border-t border-slate-800 bg-slate-950'>
      <div className='content-wrap py-8'>
        <div className='flex flex-col items-start justify-between gap-6 md:flex-row'>
          <div>
            <h3 className='text-base font-semibold text-white'>JW Workbook App</h3>
            <p className='mt-2 max-w-md text-sm text-slate-400'>
              Christian Life and Ministry workbook planning with admin control for assignments.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
            <Link href='/' className='text-sm text-slate-400 hover:text-white'>Workbook</Link>
            <Link href='/cart-schedule' className='text-sm text-slate-400 hover:text-white'>Cart Schedule</Link>
            <Link href='/assignments' className='text-sm text-slate-400 hover:text-white'>Assignments</Link>
            <Link href='/admin' className='text-sm text-slate-400 hover:text-white'>Admin</Link>
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

        <p className='mt-6 text-xs text-slate-500'>© {new Date().getFullYear()} JW Workbook App</p>
      </div>
    </footer>
  )
}
