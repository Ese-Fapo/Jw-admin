import ContainerLay from '@/PageLayout/ContainerLay'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HomeButton from '@/app/components/general/HomeButton'

export default function AboutPage() {
  const topics: { icon: string; name: string }[] = [
    { icon: '🏢', name: 'Sites Institucionais / Empresariais' },
    { icon: '🛒', name: 'Lojas Virtuais (E-commerce)' },
    { icon: '👤', name: 'Sites Pessoais e Portfólios Profissionais' },
    { icon: '🎯', name: 'Landing Pages de Alta Conversão' },
    { icon: '📝', name: 'Blogs e Sites de Conteúdo' },
    { icon: '📱', name: 'Sites One Page (Página Única)' }
  ]

  return (
   <ContainerLay>
      <div className='px-4 sm:px-12 py-8 sm:py-12'>
        {/* Home Button - Top */}
        <div className='mb-8'>
          <HomeButton />
        </div>
        {/* Hero Section */}
        <div className='text-center mb-16 animate-fade-in'>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6'>
            Sobre <span className='text-amber-400'>Bem Site Developer</span>
          </h1>
          <p className='text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed'>
            Um blog moderno dedicado ao desenvolvimento real e engenharia reflexiva.
          </p>
        </div>

        {/* Main Content Section */}
        <div className='space-y-16'>
          {/* Why Tech Blog Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Image */}
            <div className='relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 group'>
              <Image 
                src='/image for blog/programming-background-collage (2).jpg' 
                alt='Bem Site Developer Workspace' 
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-500'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
            </div>

            {/* Text Content */}
            <div className='space-y-6'>
              <h2 className='text-3xl sm:text-4xl font-bold text-white'>
                Por que Bem Site Developer?
              </h2>
              <p className='text-gray-300 text-base sm:text-lg leading-relaxed'>
                Na Bem Site Developer, acreditamos que um site bem feito transforma negócios. Não entregamos apenas páginas — criamos soluções digitais estratégicas que aumentam sua visibilidade online, geram mais clientes e fortalecem sua marca. 
              </p>
              <p className='text-gray-300 text-base sm:text-lg leading-relaxed'>
                Com foco em design responsivo, SEO otimizado e experiência do usuário, ajudamos empresas e profissionais a se destacarem na web. Trabalhamos de forma transparente, com prazos claros e atendimento dedicado, garantindo que seu projeto não seja apenas bonito — mas eficaz e lucrativo.
              </p>
              <div className='flex flex-wrap gap-3 pt-4'>
                <span className='px-4 py-2 bg-amber-600/20 border border-amber-500/50 rounded-full text-amber-400 text-sm'>
                  Desenvolvimento Web
                </span>
                <span className='px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-full text-purple-400 text-sm'>
                  Programação
                </span>
                <span className='px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-full text-green-400 text-sm'>
                  Tecnologia
                </span>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className='bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-500/20 rounded-2xl p-8 sm:p-12'>
            <h3 className='text-2xl sm:text-3xl font-bold text-white mb-6 text-center'>
              Nossa Missão
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center space-y-3'>
                <div className='text-4xl mb-2'>📚</div>
                <h4 className='text-xl font-semibold text-white'>Educação</h4>
                <p className='text-gray-400 text-sm sm:text-base'>
                  Compartilhar conhecimento e tutoriais de qualidade
                </p>
              </div>
              <div className='text-center space-y-3'>
                <div className='text-4xl mb-2'>🚀</div>
                <h4 className='text-xl font-semibold text-white'>Inovação</h4>
                <p className='text-gray-400 text-sm sm:text-base'>
                  Explorar as últimas tendências em tecnologia
                </p>
              </div>
              <div className='text-center space-y-3'>
                <div className='text-4xl mb-2'>🤝</div>
                <h4 className='text-xl font-semibold text-white'>Comunidade</h4>
                <p className='text-gray-400 text-sm sm:text-base'>
                  criando um mundo de negócios mais justo, inclusivo e sustentável
                  
                </p>
              </div>
            </div>
          </div>

          {/* Topics Covered */}
          <div className='space-y-8'>
            <h3 className='text-2xl sm:text-3xl font-bold text-white text-center'>
              O Que Cobrimos
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {topics.map((topic, index) => (
                <div key={index} className='bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-amber-500 hover:bg-gray-800/70 transition-all duration-300'>
                  <div className='text-3xl mb-2'>{topic.icon}</div>
                  <h4 className='text-lg font-semibold text-white'>{topic.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className='text-center py-12'>
            <p className='text-xl sm:text-2xl text-gray-300 mb-6'>
              Junte-se a nós nesta jornada tecnológica!
            </p>
            <p className='text-base sm:text-lg text-gray-400 max-w-2xl mx-auto'>
              Obrigado por visitar o Bem Site Developer. Esperamos que você encontre inspiração e conhecimento aqui.
            </p>
           <Link href='/articles' className='inline-block mt-8 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-medium transition-colors duration-300'>
             Explorar Artigos
            </Link>
          </div>
        </div>
        
        {/* Home Button - Bottom */}
        <div className='mt-12 flex justify-center'>
          <HomeButton />
        </div>
      </div>
   </ContainerLay>
  )
}
