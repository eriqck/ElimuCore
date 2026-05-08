import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";
import { getCurrentMemberContext } from "@/lib/membership";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
  { label: "Scheme Bot", href: "/scheme-bot" }
] as const;

function MenuIcon() {
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
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export async function SiteHeader() {
  const memberContext = await getCurrentMemberContext();
  const navigation = memberContext.user
    ? [...navItems, { label: "Premium Materials", href: "/resources" }]
    : navItems;

  return (
    <header className="sticky top-0 z-50 border-b border-[#ececec] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="ELimuCore"
              width={248}
              height={74}
              priority
              className="h-11 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/classes"
              className="rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(37,178,74,0.24)] transition hover:bg-emerald-600"
            >
              Classes
            </Link>

            <details className="group relative">
              <summary className="header-menu-summary flex h-11 w-11 list-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                <MenuIcon />
              </summary>

              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.16)]">
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
                  {memberContext.user ? (
                    <>
                      <Link
                        href="/account"
                        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/classes"
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Self-Learning Junior Classes
                      </Link>
                      <form action="/auth/signout" method="post">
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="hidden items-center justify-between gap-6 lg:flex">
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="ELimuCore"
              width={248}
              height={74}
              priority
              className="h-14 w-auto"
            />
          </Link>

          <nav className="flex items-center justify-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#25b24a] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {memberContext.user ? (
              <>
                <Link
                  href="/account"
                  className="brand-button-secondary rounded-md px-5 py-2.5 text-center text-sm font-semibold transition"
                >
                  My Account
                </Link>
                <Link
                  href="/classes"
                  className="brand-button-primary rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition"
                >
                  Self-Learning Junior Classes
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/classes"
                  className="brand-button-primary rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition"
                >
                  Self-Learning Junior Classes
                </Link>
                <Link
                  href="/login"
                  className="brand-button-secondary rounded-md px-5 py-2.5 text-center text-sm font-semibold transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="brand-button-primary rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
