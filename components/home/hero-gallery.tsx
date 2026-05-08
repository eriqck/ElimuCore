"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import codingArtwork from "@/assets/coding.png";
import dashboardArtwork from "@/assets/dash.png";
import familyArtwork from "@/assets/family.png";
import numbersArtwork from "@/assets/numbers1.png";

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
  imageClassName?: string;
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
    note: "Full unlimited access starts from KSh 299.",
    backgroundClass: "bg-[#f7f5f2]",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#ffd33d] text-[#17437f]",
    noteClass: "text-[#3147d1]",
    dotActiveClass: "bg-[#33b9a8]",
    dotInactiveClass: "bg-[#9ce3d8] hover:bg-[#6ed3c5]",
    imageClassName: "object-contain object-center"
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
    backgroundClass: "bg-[#2e7eec]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#2f80ed]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#69c7ff] hover:bg-[#9fdfff]",
    imageClassName: "object-contain object-center scale-[1.06]"
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
    backgroundClass: "bg-[#15b987]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#0d7c58]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#53d8b4] hover:bg-[#7be3c7]",
    imageClassName: "object-contain object-center scale-[1.08]"
  },
  {
    image: numbersArtwork,
    alt: "ELimuCore numbers learning experience on a tablet",
    href: "/#plans",
    ctaLabel: "Sign Up Now",
    title: "Membership for\nteachers and parents",
    ribbon: "One account. Full unlimited access.",
    description:
      "Choose 1 month, 6 months, or 1 year and download as many resources as you need with no extra charge during the subscription period.",
    note: "KSh 299, KSh 499, or KSh 999.",
    backgroundClass: "bg-[#faf7f2]",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#8b1028] text-white",
    noteClass: "text-[#8b1028]",
    dotActiveClass: "bg-[#8b1028]",
    dotInactiveClass: "bg-[#dba8b3] hover:bg-[#c97889]",
    imageClassName: "object-contain object-center scale-[1.02]"
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
    backgroundClass: "bg-[#2e7eec]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#2e7eec]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#69c7ff] hover:bg-[#9fdfff]",
    imageClassName: "object-contain object-center scale-[1.06]"
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
        <div className="relative grid items-center gap-6 py-6 pb-10 sm:min-h-[620px] sm:gap-12 sm:py-10 sm:pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-0">
          <div className="order-2 max-w-[560px] py-0 sm:py-4 lg:order-1">
            <h1
              className={`whitespace-pre-line text-[clamp(2rem,12vw,4.5rem)] font-black leading-[1.02] tracking-tight ${activeSlide.titleClass}`}
            >
              {activeSlide.title}
            </h1>

            <div
              className={`mt-4 inline-flex max-w-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] sm:mt-5 sm:text-sm sm:tracking-[0.2em] ${activeSlide.ribbonClass}`}
            >
              {activeSlide.ribbon}
            </div>

            <p
              className={`mt-4 max-w-xl text-[15px] leading-7 sm:mt-5 sm:text-lg sm:leading-8 ${activeSlide.bodyClass}`}
            >
              {activeSlide.description}
            </p>

            <p
              className={`mt-4 text-base font-bold sm:mt-5 sm:text-xl ${activeSlide.noteClass}`}
            >
              {activeSlide.note}
            </p>

            <Link
              href={activeSlide.href}
              className="mt-7 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f4a621] text-white shadow-[0_12px_24px_rgba(244,166,33,0.28)] transition hover:-translate-y-0.5 hover:bg-[#df9317] sm:mt-9 sm:w-auto"
            >
              <span className="px-6 py-4 text-base font-bold sm:text-lg">
                {activeSlide.ctaLabel}
              </span>
              <span className="border-l border-white/20 px-5 py-4 text-xl font-black sm:text-2xl">
                &gt;
              </span>
            </Link>
          </div>

          <div className="order-1 flex min-h-[240px] items-center justify-center sm:min-h-[320px] lg:order-2 lg:min-h-[620px]">
            <div className="relative h-[220px] w-full max-w-[680px] sm:h-[410px] lg:h-[540px]">
              <Image
                key={activeSlide.alt}
                src={activeSlide.image}
                alt={activeSlide.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={
                  activeSlide.imageClassName ?? "object-contain object-center"
                }
              />
            </div>
          </div>

          <div className="order-3 mt-3 flex items-center justify-center gap-3 lg:absolute lg:bottom-10 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
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
