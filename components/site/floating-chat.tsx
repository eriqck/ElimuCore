"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type FloatingChatProps = {
  supportEmail?: string | null;
  supportWhatsapp?: string | null;
};

function normalizeWhatsappNumber(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

function ChatIcon() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sky-500">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PanelLink({
  href,
  label,
  accent
}: {
  href: string;
  label: string;
  accent: string;
}) {
  const className = `block rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${accent}`;
  const external =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:");

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
    >
      {label}
    </Link>
  );
}

export function FloatingChat({
  supportEmail,
  supportWhatsapp
}: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const whatsappNumber = normalizeWhatsappNumber(supportWhatsapp);

  const quickLinks = useMemo(() => {
    const links: Array<{
      href: string;
      label: string;
      accent: string;
    }> = [];

    if (whatsappNumber) {
      links.push({
        href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello ELimuCore, I need help with membership, materials, or schemes."
        )}`,
        label: "WhatsApp us",
        accent:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      });
    }

    if (supportEmail) {
      links.push({
        href: `mailto:${supportEmail}?subject=${encodeURIComponent(
          "ELimuCore Support"
        )}`,
        label: "Email support",
        accent:
          "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
      });
    }

    links.push(
      {
        href: "/account",
        label: "Membership help",
        accent:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
      },
      {
        href: "/scheme-bot",
        label: "Scheme Bot",
        accent:
          "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
      },
      {
        href: "/#how-to-use",
        label: "Support guide",
        accent:
          "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      }
    );

    return links;
  }, [supportEmail, whatsappNumber]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[70] flex flex-col items-stretch gap-3 sm:bottom-5 sm:left-auto sm:right-5 sm:items-end">
      {open ? (
        <div
          id="floating-chat-panel"
          ref={panelRef}
          className="pointer-events-auto w-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:w-[min(22rem,calc(100vw-2rem))]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">
                Support
              </p>
              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                How can we help?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Get quick help with membership, premium materials, and schemes.
          </p>

          <div className="mt-4 space-y-3">
            {quickLinks.map((link) => (
              <PanelLink
                key={`${link.label}-${link.href}`}
                href={link.href}
                label={link.label}
                accent={link.accent}
              />
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto relative inline-flex w-full items-center justify-center gap-3 rounded-full bg-sky-500 px-5 py-3 text-base font-bold text-white shadow-[0_16px_36px_rgba(14,165,233,0.35)] transition hover:-translate-y-0.5 hover:bg-sky-600 sm:w-auto"
        aria-expanded={open}
        aria-controls="floating-chat-panel"
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-sky-400/30 blur-xl" />
        {open ? <CloseIcon /> : <ChatIcon />}
        <span>{open ? "Minimize chat" : "Chat with us"}</span>
      </button>
    </div>
  );
}
