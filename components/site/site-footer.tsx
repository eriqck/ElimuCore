import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import logo from "@/assets/weblogo.png";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/#plans" },
  { label: "Support", href: "/#how-to-use" },
  { label: "Scheme Bot", href: "/scheme-bot" },
  { label: "Login", href: "/login" }
] as const;

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6H16.8V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4.1V11H8v3h2.7v8h2.8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72l.35 2.37a2 2 0 0 1-.57 1.7L8.1 10.55a16 16 0 0 0 5.35 5.35l1.76-1.76a2 2 0 0 1 1.7-.57l2.37.35A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SocialButton({
  href,
  label,
  children
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white shadow-sm transition hover:border-[#25b24a] hover:bg-[#25b24a] hover:text-white";

  if (!href) {
    return (
      <span
        aria-label={label}
        title={`${label} coming soon`}
        className={`${className} cursor-default text-white/45 hover:border-white/12 hover:bg-white/8 hover:text-white/45`}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={className}
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-white/8 bg-[#151515] px-4 py-10 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_1fr]">
          <div>
            <Image
              src={logo}
              alt="ELimuCore"
              width={190}
              height={60}
              className="h-12 w-auto rounded-md bg-white px-2 py-1"
            />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              Have a Question?
            </h2>
            <div className="mt-6 space-y-4 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[#25b24a]">
                  <LocationIcon />
                </span>
                <p className="leading-7">Baazar&apos;s Plaza, Nairobi</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[#25b24a]">
                  <PhoneIcon />
                </span>
                <a
                  href="tel:+254759481281"
                  className="leading-7 transition hover:text-[#25b24a]"
                >
                  0759 481 281
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Links
            </h2>
            <div className="mt-6 space-y-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition hover:text-[#25b24a]"
                >
                  <span className="text-[#25b24a]">
                    <ArrowIcon />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Connect with us on social media.
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <SocialButton
                href="https://www.facebook.com/elimucoreh"
                label="ELimuCore on Facebook"
              >
                <FacebookIcon />
              </SocialButton>
              <SocialButton label="ELimuCore on Instagram">
                <InstagramIcon />
              </SocialButton>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-5 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright ©2026 ELimuCore. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

