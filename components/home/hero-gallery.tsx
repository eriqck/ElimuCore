"use client";

import Image from "next/image";
import { useState } from "react";

const galleryImages = [
  {
    src: "https://images.pexels.com/photos/34162714/pexels-photo-34162714.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African secondary school learners studying together in class",
    title: "Revision built for African classrooms",
    caption: "Teachers can access classroom-ready KCSE and CBE materials for everyday planning."
  },
  {
    src: "https://images.pexels.com/photos/28593054/pexels-photo-28593054.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Young African children writing in a classroom",
    title: "Support from early learning upward",
    caption: "Parents and teachers can find grade-friendly resources for learners at every stage."
  },
  {
    src: "https://images.pexels.com/photos/30058872/pexels-photo-30058872.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "African teacher standing with learners in a classroom",
    title: "Tools for teachers leading real classes",
    caption: "Lesson plans, schemes of work, exams, and assessments stay easy to reach."
  },
  {
    src: "https://images.pexels.com/photos/5905961/pexels-photo-5905961.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Black child studying at home with a laptop during an online lesson",
    title: "Home-study support for families",
    caption: "Parents can guide revision and homework using downloadable learning resources."
  },
  {
    src: "https://images.pexels.com/photos/5905964/pexels-photo-5905964.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Black female teacher supporting learners through an online class setup",
    title: "Digital teaching made practical",
    caption: "One active membership unlocks unlimited downloads for classroom and home use."
  }
] as const;

export function HeroGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 via-stone-950/35 to-transparent p-6 text-white">
          <p className="font-display text-3xl font-black tracking-tight">
            {activeImage.title}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-100">
            {activeImage.caption}
          </p>
        </div>

        <button
          type="button"
          onClick={showPrevious}
          aria-label="Show previous gallery image"
          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl font-black text-rose-900 shadow-lg transition hover:bg-orange-500 hover:text-white"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Show next gallery image"
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl font-black text-rose-900 shadow-lg transition hover:bg-orange-500 hover:text-white"
        >
          &gt;
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show gallery image ${index + 1}`}
              className={`h-2.5 rounded-full transition ${
                activeIndex === index
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 p-2 sm:gap-3 sm:p-3">
        {galleryImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Select ${image.title}`}
            className={`overflow-hidden rounded-xl border-2 bg-stone-100 transition hover:-translate-y-0.5 ${
              activeIndex === index
                ? "border-orange-500"
                : "border-transparent hover:border-rose-800"
            }`}
          >
            <Image
              src={image.src}
              alt=""
              width={240}
              height={120}
              className="h-20 w-full object-cover sm:h-24"
              sizes="(min-width: 640px) 20vw, 18vw"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
