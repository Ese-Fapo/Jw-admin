import Image  from "next/image";
import { Suspense } from "react";

import React from "react";
import ContainerLay from "@/PageLayout/ContainerLay";
import RecentPost  from "@/app/components/home/RecentPost";




function MainContent() {
  return (
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        {/* Hero Section */}
        <div className="text-center px-4 py-6 md:py-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-200 tracking-wide leading-tight md:leading-snug lg:leading-normal animate-slide-down">
            <span className="text-blue-500 inline-block animate-pulse-slow">
              Bem-vindo — Vamos construir sua presença online
            </span>
            <br />
            <span className="text-gray-300 text-2xl sm:text-3xl md:text-4xl lg:text-5xl block mt-4 animate-slide-up animation-delay-300">
             Nós orientamos você na escolha do site ideal para que seu negócio tenha uma aparência profissional e transmita credibilidade no ambiente digital.
            </span>
          </h1>
        </div>

        {/* Main Content Section */}
        <div className="py-8 md:py-12 lg:py-16 animate-fade-in-up animation-delay-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Image Section */}
            <div className="order-1 lg:order-1 w-full animate-slide-in-left animation-delay-700">
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden shadow-2xl hover:shadow-blue-500/30 transition-all duration-500">
                <Image
                  src="/image for blog/working_lady.jpg"
                  alt="Ilustração do Blog Tech - Profissional trabalhando com tecnologia"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  priority
                />
              </div>
            </div>
            {/* Text Content Section */}
            <div className="order-2 lg:order-2 space-y-6 animate-slide-in-right animation-delay-700">
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/50 rounded-full px-4 py-2 shadow-lg shadow-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs sm:text-sm uppercase tracking-widest font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Descubra. Aprenda. Inove.
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Bem-vindo ao seu ponto de partida digital
              </h2>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
               No mundo digital de hoje, ter uma presença online é essencial para qualquer negócio. Um site ajuda a construir confiança, alcançar mais clientes e fortalecer sua marca. Aqui, você vai conhecer diferentes tipos de sites e descobrir qual é o mais adequado para o seu negócio.
               <br />
               Descubra como diferentes tipos de sites impulsionam o crescimento do seu negócio e escolha a melhor solução para alcançar seus objetivos.
              </p>
              <div className="pt-4">
                <a
                  href="/articles"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                >
                  Explorar Artigos
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-400">Carregando publicações recentes...</p></div></div>}>
          <RecentPost />
        </Suspense>
      </div>
  );
}

export default function Home() {
  return (
    

    <ContainerLay>
      <MainContent />
    </ContainerLay>
  );
}
