import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";
import { getCurrentMemberContext } from "@/lib/membership";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#package" },
  { label: "Pricing", href: "/#plans" },
  { label: "Support", href: "/#how-to-use" },
  { label: "Scheme Bot", href: "/scheme-bot" }
] as const;

export async function SiteHeader() {
  const memberContext = await getCurrentMemberContext();
  const signedInNavItems = [
    ...navItems,
    { label: "Premium Materials", href: "/resources" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#ececec] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="ELimuCore"
              width={248}
              height={74}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {(memberContext.user ? signedInNavItems : navItems).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:bg-[#25b24a] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            {memberContext.user ? (
              <>
                <Link
                  href="/account"
                  className="brand-button-secondary rounded-md px-5 py-2.5 text-sm font-semibold transition"
                >
                  My Account
                </Link>
                <Link
                  href="/classes"
                  className="brand-button-primary rounded-md px-5 py-2.5 text-sm font-semibold text-white transition"
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
                  href="/login"
                  className="brand-button-secondary rounded-md px-5 py-2.5 text-sm font-semibold transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="brand-button-primary rounded-md px-5 py-2.5 text-sm font-semibold text-white transition"
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
