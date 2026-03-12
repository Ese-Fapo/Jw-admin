import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
  const topics = [
    'Next.js App Router frontend',
    'API routes for post CRUD + search',
    'Better Auth social login',
    'Prisma + PostgreSQL data layer',
    'Cloudinary image uploads',
    'React Query for client data fetching',
  ]

  return (
    <section className='content-wrap py-12 sm:py-16'>
      <div className='card p-8 sm:p-10'>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>About this project</h1>
        <p className='mt-4 max-w-3xl text-slate-300'>
          You asked for a frontend cleanup while keeping backend logic. This page is now part of the
          simplified UI layer that sits on top of your existing APIs and auth flows.
        </p>

        <h2 className='mt-8 text-xl font-semibold text-white'>What stays intact</h2>
        <ul className='mt-3 grid gap-2 sm:grid-cols-2'>
          {topics.map((topic) => (
            <li key={topic} className='rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200'>
              {topic}
            </li>
          ))}
        </ul>

        <div className='mt-8 flex gap-3'>
          <Link href='/articles' className='rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500'>
            View articles
          </Link>
          <Link href='/write' className='rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900'>
            Write post
          </Link>
        </div>
      </div>
    </section>
  )
}
