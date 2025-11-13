import { useEffect, useRef, useState } from 'react';

interface Founder {
  name: string;
  image: string;
}

export function Founders() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const founders: Founder[] = [
    {
      name: 'Gan Zhen Kang',
      image: '/image copy copy copy copy.png',
    },
    {
      name: 'Muhammad Firdaus Bin Idros',
      image: '/image copy copy copy copy copy.png',
    },
    {
      name: 'Poon Yu Yi',
      image: '/WhatsApp Image 2025-11-13 at 20.09.54_e1f84b1e.jpg',
    },
    {
      name: 'Shernice Sim',
      image: '/image copy copy copy copy copy copy.png',
    },
    {
      name: 'Bryan Stevenson Gunawan',
      image: 'https://ui-avatars.com/api/?name=Bryan+Stevenson+Gunawan&size=400&background=3B82F6&color=fff&bold=true&format=png',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-gradient-to-b from-transparent via-[#1F2937]/10 to-transparent"
      aria-label="Meet Our Founders"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className={`text-5xl md:text-6xl font-bold mb-6 transition-all duration-1000 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            Meet Our Founders
          </h2>
          <p
            className={`text-xl text-[#9CA3AF] transition-all duration-1000 delay-200 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            The passionate team behind FlowPost
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {founders.map((founder, index) => (
            <div
              key={founder.name}
              className={`group cursor-pointer transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
              }}
              aria-label={founder.name}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6 w-48 h-48 md:w-52 md:h-52">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="relative w-full h-full rounded-full object-cover border-3 border-[#3B82F6]/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] group-hover:border-[#3B82F6] transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-[#3B82F6] transition-colors duration-300">
                  {founder.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .grid > div {
            max-width: 280px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </section>
  );
}
