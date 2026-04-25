"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import codingArtwork from "@/assets/coding.png";
import dashboardArtwork from "@/assets/dash.png";
import familyArtwork from "@/assets/family.png";
import zoomArtwork from "@/assets/zoom.png";

type HeroSlide = {
  image: StaticImageData;
  alt: string;
  href: string;
  ctaLabel: string;
  title: string;
  ribbon: string;
  description: string;
  note: string;
  backgroundClass: string;
  titleClass: string;
  bodyClass: string;
  ribbonClass: string;
  noteClass: string;
  dotActiveClass: string;
  dotInactiveClass: string;
};

const slides: HeroSlide[] = [
  {
    image: codingArtwork,
    alt: "African children learning coding on laptops",
    href: "/signup",
    ctaLabel: "Find Out More",
    title: "LIVE &\nENGAGING",
    ribbon: "Digital learning for teachers and parents",
    description:
      "Access practical digital learning support, classroom-ready resources, and guided member access from one clear library.",
    note: "Full unlimited access starts from KSh 300.",
    backgroundClass: "bg-[#f7f5f2]",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#ffd33d] text-[#17437f]",
    noteClass: "text-[#3147d1]",
    dotActiveClass: "bg-[#33b9a8]",
    dotInactiveClass: "bg-[#9ce3d8] hover:bg-[#6ed3c5]"
  },
  {
    image: dashboardArtwork,
    alt: "ELimuCore performance dashboard on a tablet",
    href: "/resources?category=lesson-plans",
    ctaLabel: "Find Out More",
    title: "Track learner\nprogress clearly",
    ribbon: "Reports, performance, and subject insight",
    description:
      "Use ELimuCore to keep teaching, revision, and learner performance resources easier to follow across the school term.",
    note: "Built for schools, teachers, and parents.",
    backgroundClass: "bg-[#2f80ed]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#2f80ed]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#69c7ff] hover:bg-[#9fdfff]"
  },
  {
    image: familyArtwork,
    alt: "African family learning together at home",
    href: "/resources",
    ctaLabel: "Find Out More",
    title: "Home study support\nfor families",
    ribbon: "Practical digital teaching for families",
    description:
      "Give parents one organized place for guided study support, online learning, and classroom follow-up resources at home.",
    note: "Fast search. Clear access. Helpful support.",
    backgroundClass: "bg-[#13c48a]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#0d7c58]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#53d8b4] hover:bg-[#7be3c7]"
  },
  {
    image: zoomArtwork,
    alt: "Teacher supporting learners through an online lesson",
    href: "/#plans",
    ctaLabel: "Sign Up Now",
    title: "Membership for\nteachers and parents",
    ribbon: "One account. Full unlimited access.",
    description:
      "Choose 1 month, 6 months, or 1 year and download as many resources as you need with no extra charge during the subscription period.",
    note: "KSh 300, KSh 500, or KSh 1000.",
    backgroundClass: "bg-[#8b1028]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#8b1028]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#d86b86] hover:bg-[#e38aa0]"
  },
  {
    image: dashboardArtwork,
    alt: "ELimuCore performance dashboard on a tablet",
    href: "/resources?category=past-papers",
    ctaLabel: "Find Out More",
    title: "Revision and\nassessment support",
    ribbon: "PP1 to Grade 10, Form 3 and Form 4",
    description:
      "Search notes, exams, topical questions, and classroom planning resources faster for everyday teaching and revision needs.",
    note: "Unlimited downloads during your active membership.",
    backgroundClass: "bg-white",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#7b79f0] text-white",
    noteClass: "text-[#3047d1]",
    dotActiveClass: "bg-[#31b8a7]",
    dotInactiveClass: "bg-[#8fcde8] hover:bg-[#67b7df]"
  }
];

const autoAdvanceDelay = 6500;

export function HeroGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoAdvanceDelay);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className={`overflow-hidden ${activeSlide.backgroundClass}`}>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="relative grid min-h-[620px] items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-0">
          <div className="max-w-[560px] py-4">
            <h1
              className={`whitespace-pre-line text-[clamp(2.75rem,5vw,4.5rem)] font-black leading-[1.02] tracking-tight ${activeSlide.titleClass}`}
            >
              {activeSlide.title}
            </h1>

            <div
              className={`mt-5 inline-flex px-4 py-2 text-sm font-black uppercase tracking-[0.2em] ${activeSlide.ribbonClass}`}
            >
              {activeSlide.ribbon}
            </div>

            <p className={`mt-5 max-w-xl text-lg leading-8 ${activeSlide.bodyClass}`}>
              {activeSlide.description}
            </p>

            <p className={`mt-5 text-xl font-bold ${activeSlide.noteClass}`}>
              {activeSlide.note}
            </p>

            <Link
              href={activeSlide.href}
              className="mt-9 inline-flex items-center overflow-hidden rounded-md bg-[#f4a621] text-white shadow-[0_12px_24px_rgba(244,166,33,0.28)] transition hover:-translate-y-0.5 hover:bg-[#df9317]"
            >
              <span className="px-6 py-4 text-lg font-bold">
                {activeSlide.ctaLabel}
              </span>
              <span className="border-l border-white/20 px-5 py-4 text-2xl font-black">
                &gt;
              </span>
            </Link>
          </div>

          <div className="flex min-h-[320px] items-center justify-center lg:min-h-[620px]">
            <div className="relative h-[320px] w-full max-w-[680px] sm:h-[410px] lg:h-[540px]">
              <Image
                key={activeSlide.alt}
                src={activeSlide.image}
                alt={activeSlide.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain object-center"
              />
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={`${slide.title}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to hero slide ${index + 1}`}
                className={`h-3.5 w-3.5 rounded-full transition ${
                  activeIndex === index
                    ? activeSlide.dotActiveClass
                    : activeSlide.dotInactiveClass
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
