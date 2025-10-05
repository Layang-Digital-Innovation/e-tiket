"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroSliderProps {
  heroImages: string[];
}

export default function HeroSlider({ heroImages }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section className="relative overflow-hidden min-h-screen font-heebo">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              width={1920}
              height={1080}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover z-0"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-primary/80"></div>
          </div>
        ))}
      </div>
      
      {/* Hero Content - Bottom Left */}
      <div className="relative z-10 h-screen flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-pt-serif font-bold text-white mb-6 leading-tight">
              Platform Tiket Event Terdepan
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Buat, kelola, dan jual tiket event Anda dengan mudah. Bergabunglah dengan ribuan event organizer yang mempercayai platform kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size={"lg"}>
                Cari Event
              </Button>
              <Button variant={"outline"} size={"lg"}>
                Buat Event
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}