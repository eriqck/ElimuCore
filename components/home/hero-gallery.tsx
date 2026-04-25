"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroFigure = {
  src: string;
  alt: string;
  className: string;
};

type HeroSlide = {
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
  imageKind?: "photo" | "collage";
  src?: string;
  alt?: string;
  figures?: HeroFigure[];
};

const slides: HeroSlide[] = [
  {
    href: "/signup",
    ctaLabel: "Find Out More",
    title: "LIVE &\nENGAGING",
    ribbon: "Digital learning for teachers and parents",
    description:
      "Find lesson plans, schemes of work, KCSE papers, CBE assessments, and printable study support inside one clear membership library.",
    note: "Full unlimited access starts from KSh 300.",
    backgroundClass: "bg-[#f7f5f2]",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#ffd33d] text-[#17437f]",
    noteClass: "text-[#3147d1]",
    dotActiveClass: "bg-[#33b9a8]",
    dotInactiveClass: "bg-[#9ce3d8] hover:bg-[#6ed3c5]",
    imageKind: "collage",
    figures: [
      {
        src: "https://pikwizard.com/pw/medium/344776e77a31945459d3d9e8d16a178a.png",
        alt: "African child using a tablet for home learning",
        className:
          "absolute bottom-2 left-0 z-20 h-[250px] w-[220px] sm:h-[320px] sm:w-[280px] lg:h-[390px] lg:w-[330px]"
      },
      {
        src: "https://pikwizard.com/pw/medium/cedf37eda4dc3199230880ff35406610.png",
        alt: "African girl using a laptop for digital learning",
        className:
          "absolute bottom-6 right-0 z-30 h-[235px] w-[210px] sm:h-[310px] sm:w-[280px] lg:h-[380px] lg:w-[330px]"
      }
    ]
  },
  {
    href: "/resources?category=lesson-plans",
    ctaLabel: "Find Out More",
    title: "Teacher planning\nmade simple",
    ribbon: "Lesson plans, schemes, and weekly support",
    description:
      "ELimuCore keeps classroom planning resources together so teachers can move faster from preparation to teaching.",
    note: "Built for busy school terms.",
    backgroundClass: "bg-[#2f80ed]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#2f80ed]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#69c7ff] hover:bg-[#9fdfff]",
    imageKind: "photo",
    src: "https://images.pexels.com/photos/5905964/pexels-photo-5905964.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African teacher guiding digital learning with a laptop"
  },
  {
    href: "/resources?category=past-papers",
    ctaLabel: "Find Out More",
    title: "Revision papers\nby grade and subject",
    ribbon: "PP1 to Grade 10, Form 3 and Form 4",
    description:
      "Search exams, notes, topical questions, assignments, and marked revision files faster for school and home use.",
    note: "Unlimited downloads during your active membership.",
    backgroundClass: "bg-[#13c48a]",
    titleClass: "text-white",
    bodyClass: "text-white/85",
    ribbonClass: "bg-white text-[#0d7c58]",
    noteClass: "text-white",
    dotActiveClass: "bg-white",
    dotInactiveClass: "bg-[#53d8b4] hover:bg-[#7be3c7]",
    imageKind: "photo",
    src: "https://images.pexels.com/photos/34162714/pexels-photo-34162714.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African learners using revision materials together"
  },
  {
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
    dotInactiveClass: "bg-[#d86b86] hover:bg-[#e38aa0]",
    imageKind: "photo",
    src: "https://images.pexels.com/photos/30058872/pexels-photo-30058872.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African teacher and learners using classroom materials"
  },
  {
    href: "/resources",
    ctaLabel: "Find Out More",
    title: "Home study support\nfor families",
    ribbon: "Digital teaching made practical",
    description:
      "Parents can quickly search by grade, subject, or resource type and find classroom-friendly learning support without mastering the whole catalog.",
    note: "Fast search. Clean access. Trusted files.",
    backgroundClass: "bg-white",
    titleClass: "text-[#2f3640]",
    bodyClass: "text-slate-700",
    ribbonClass: "bg-[#7b79f0] text-white",
    noteClass: "text-[#3047d1]",
    dotActiveClass: "bg-[#31b8a7]",
    dotInactiveClass: "bg-[#8fcde8] hover:bg-[#67b7df]",
    imageKind: "photo",
    src: "https://images.pexels.com/photos/5905961/pexels-photo-5905961.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African learner studying independently with a laptop"
  }
];

const autoAdvanceDelay = 6500;

function HeroCollage() {
  const collageFigures = slides[0].figures ?? [];

  return (
    <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[620px]">
      <div className="relative h-[320px] w-full max-w-[620px] sm:h-[410px] lg:h-[540px]">
        <div className="absolute right-[14%] top-[12%] h-[180px] w-[180px] rounded-full bg-[#0d7fb7] sm:h-[230px] sm:w-[230px] lg:h-[290px] lg:w-[290px]" />
        <div className="absolute right-[8%] top-[22%] h-[170px] w-[140px] rounded-[55%] bg-[#0b7b23] sm:h-[220px] sm:w-[180px] lg:h-[280px] lg:w-[220px]" />
        <div className="absolute right-0 top-[26%] h-[160px] w-[130px] rounded-[58%] bg-[#f3c529] sm:h-[210px] sm:w-[175px] lg:h-[260px] lg:w-[210px]" />

        {collageFigures.map((figure) => (
          <div key={figure.src} className={figure.className}>
            <Image
              src={figure.src}
              alt={figure.alt}
              fill
              sizes="(min-width: 1024px) 24vw, 45vw"
              className="object-contain object-bottom"
            />
          </div>
        ))}

        <div className="absolute left-2 top-[22%] z-40 -rotate-[10deg] text-left">
          <p className="text-[clamp(1.3rem,3vw,2.5rem)] font-black uppercase tracking-tight text-[#ff4f4f] [text-shadow:2px_2px_0_#fff]">
            From
          </p>
          <p className="text-[clamp(1.6rem,4vw,3rem)] font-black leading-none text-[#ff4f4f] [text-shadow:2px_2px_0_#fff]">
            KSh 300
          </p>
          <span className="absolute left-[-12px] top-[38px] h-[6px] w-[125px] -rotate-[18deg] bg-[#ff2f2f] sm:top-[48px] sm:w-[155px] lg:top-[62px] lg:w-[190px]" />
        </div>

        <div className="absolute bottom-[14%] left-[36%] z-40 rotate-[-6deg] text-left">
          <p className="text-[clamp(1.4rem,3vw,2.4rem)] font-black uppercase tracking-tight text-[#ff3a3a] [text-shadow:2px_2px_0_#fff]">
            Unlimited
          </p>
          <p className="text-[clamp(1.5rem,3.4vw,2.8rem)] font-black leading-none text-[#ff3a3a] [text-shadow:2px_2px_0_#fff]">
            Access
          </p>
        </div>

        <div className="absolute left-[7%] top-[14%] z-40 text-black/55">
          <div className="flex gap-1">
            <span className="h-3 w-3 rounded-full border-2 border-current" />
            <span className="h-3 w-3 rounded-full border-2 border-current" />
          </div>
        </div>
        <div className="absolute left-[10%] top-[54%] z-40 h-8 w-8 rounded-full border-2 border-black/45" />
        <div className="absolute right-[6%] top-[38%] z-40 h-10 w-10 rotate-12 rounded-full border-2 border-black/40" />
      </div>
    </div>
  );
}

function HeroPhoto({
  slide
}: {
  slide: HeroSlide;
}) {
  if (!slide.src || !slide.alt) {
    return null;
  }

  return (
    <div className="flex min-h-[320px] items-center justify-center lg:min-h-[620px]">
      <div className="relative h-[320px] w-full max-w-[620px] sm:h-[410px] lg:h-[540px]">
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}

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

          {activeSlide.imageKind === "collage" ? (
            <HeroCollage />
          ) : (
            <HeroPhoto slide={activeSlide} />
          )}

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
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
