"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const slides = [
  {
    src: "https://images.pexels.com/photos/5905964/pexels-photo-5905964.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African teacher supporting learners through a digital class setup",
    eyebrow: "Teacher and parent library",
    title: "Trusted learning support for classrooms and homes",
    summary:
      "Find lesson plans, assessments, revision papers, and practical study support from one clear member library.",
    detail: "Built for busy teachers and involved parents.",
    href: "/resources",
    ctaLabel: "Browse Resources",
    panelClass: "bg-[#8b1028] text-white",
    cardClass: "border-white/10 bg-white/10",
    circleClass: "bg-white/12",
    eyebrowClass: "bg-white text-[#8b1028]",
    summaryClass: "text-white/82",
    detailClass: "text-white/72",
    buttonClass:
      "bg-white text-[#8b1028] hover:bg-[#f7d8e0] hover:text-[#6e0d20]",
    dotActiveClass: "bg-white"
  },
  {
    src: "https://images.pexels.com/photos/34162714/pexels-photo-34162714.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African learners studying together in class",
    eyebrow: "KCSE and CBE support",
    title: "Find revision papers and teaching resources faster",
    summary:
      "Search by subject, level, or resource type and reach what you need without digging through cluttered pages.",
    detail: "Past papers, notes, schemes, and classroom files in one place.",
    href: "/resources",
    ctaLabel: "Find Out More",
    panelClass: "bg-white text-slate-900",
    cardClass: "border-[#ead8de] bg-[#fcf8f9]",
    circleClass: "bg-[#f6dce4]",
    eyebrowClass: "bg-[#8b1028] text-white",
    summaryClass: "text-slate-600",
    detailClass: "text-[#8b1028]",
    buttonClass:
      "bg-[#8b1028] text-white hover:bg-[#6e0d20] hover:text-white",
    dotActiveClass: "bg-[#8b1028]"
  },
  {
    src: "https://images.pexels.com/photos/30058872/pexels-photo-30058872.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African teacher standing with learners in a classroom",
    eyebrow: "Planning made easier",
    title: "Lesson plans and schemes that stay easy to reach",
    summary:
      "Support weekly teaching with organized classroom materials that match the way schools actually plan and revise.",
    detail: "Ready for teachers, schools, and home-learning support.",
    href: "/resources?category=lesson-plans",
    ctaLabel: "Explore Teacher Tools",
    panelClass: "bg-[#f8eef2] text-slate-900",
    cardClass: "border-[#e7cfd7] bg-white",
    circleClass: "bg-[#e4bcc9]",
    eyebrowClass: "bg-white text-[#8b1028]",
    summaryClass: "text-slate-600",
    detailClass: "text-[#8b1028]",
    buttonClass:
      "bg-[#8b1028] text-white hover:bg-[#6e0d20] hover:text-white",
    dotActiveClass: "bg-[#8b1028]"
  },
  {
    src: "https://images.pexels.com/photos/5905961/pexels-photo-5905961.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Black child studying at home with a laptop",
    eyebrow: "Home learning support",
    title: "Give families simple access to the right study help",
    summary:
      "Parents can quickly find grade-based support, revision materials, and guided practice for learners at home.",
    detail: "One membership opens the full library while the plan is active.",
    href: "/signup",
    ctaLabel: "Sign Up Now",
    panelClass: "bg-[#761128] text-white",
    cardClass: "border-white/10 bg-white/10",
    circleClass: "bg-white/10",
    eyebrowClass: "bg-[#f3c746] text-[#6e0d20]",
    summaryClass: "text-white/82",
    detailClass: "text-white/72",
    buttonClass:
      "bg-[#f3a61a] text-white hover:bg-[#d99212] hover:text-white",
    dotActiveClass: "bg-white"
  }
] as const;

export function HeroGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border shadow-[0_28px_60px_rgba(95,15,35,0.1)] ${activeSlide.panelClass} ${
        activeSlide.panelClass.includes("bg-white")
          ? "border-[#ead8de]"
          : "border-transparent"
      }`}
    >
      <div className="grid min-h-[540px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-14">
        <div className="relative z-10 max-w-2xl">
          <p
            className={`inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] ${activeSlide.eyebrowClass}`}
          >
            {activeSlide.eyebrow}
          </p>
          <h1 className="font-display mt-6 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-[4.1rem]">
            {activeSlide.title}
          </h1>
          <p className={`mt-5 max-w-xl text-base leading-8 ${activeSlide.summaryClass}`}>
            {activeSlide.summary}
          </p>
          <p className={`mt-4 text-lg font-semibold ${activeSlide.detailClass}`}>
            {activeSlide.detail}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={activeSlide.href}
              className={`inline-flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] shadow-lg transition hover:-translate-y-0.5 ${activeSlide.buttonClass}`}
            >
              <span>{activeSlide.ctaLabel}</span>
              <span className="text-lg">&gt;</span>
            </Link>
          </div>
        </div>

        <div className="relative h-[340px] sm:h-[420px] lg:h-[460px]">
          <div
            className={`absolute right-0 top-1/2 h-[18rem] w-[18rem] -translate-y-1/2 rounded-full blur-[1px] sm:h-[22rem] sm:w-[22rem] lg:h-[28rem] lg:w-[28rem] ${activeSlide.circleClass}`}
          />
          <div
            className={`absolute bottom-0 right-0 left-8 overflow-hidden rounded-[2rem] border shadow-2xl lg:left-12 ${activeSlide.cardClass}`}
          >
            <Image
              key={activeSlide.src}
              src={activeSlide.src}
              alt={activeSlide.alt}
              width={900}
              height={700}
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[460px]"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show slide ${index + 1}`}
            className={`h-3 rounded-full transition ${
              activeIndex === index
                ? `w-8 ${slide.dotActiveClass}`
                : "w-3 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 z-20 hidden items-center gap-3 sm:flex">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous slide"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#8b1028] shadow-lg transition hover:bg-white"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next slide"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#8b1028] shadow-lg transition hover:bg-white"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
