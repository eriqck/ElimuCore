import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";
import { getCurrentMemberContext } from "@/lib/membership";
import { MobileHeaderMenu } from "@/components/site/mobile-header-menu";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
  { label: "Scheme Bot", href: "/scheme-bot" }
] as const;

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
            <MobileHeaderMenu
              navigation={navigation}
              isAuthenticated={Boolean(memberContext.user)}
            />
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
