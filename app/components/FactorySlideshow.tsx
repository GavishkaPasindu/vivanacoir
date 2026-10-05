"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = Array.from({ length: 13 }, (_, i) => `/factory-gallery/slide-${i + 1}.jpg`);

export default function FactorySlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="slideshow-container">
      <div 
        className="slideshow-inner"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className="slideshow-slide" key={index}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide} alt={`Factory view ${index + 1}`} className="slideshow-image" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="slideshow-arrow-left" onClick={prevSlide}>
        <ChevronLeft size={30} />
      </div>
      <div className="slideshow-arrow-right" onClick={nextSlide}>
        <ChevronRight size={30} />
      </div>

      {/* Dots */}
      <div className="slideshow-dots">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`slideshow-dot ${currentIndex === slideIndex ? "active" : ""}`}
          ></div>
        ))}
      </div>
    </div>
  );
}
