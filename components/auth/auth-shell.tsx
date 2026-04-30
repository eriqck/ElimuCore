import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";

type AuthShellProps = {
  title: string;
  children: React.ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#6f1023] px-4 py-10">
      <div className="relative w-full max-w-[24rem]">
        <Link
          href="/"
          className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
        >
          <Image
            src={logo}
            alt="ELimuCore"
            priority
            width={140}
            height={140}
            className="-mt-9 h-auto w-[7.25rem] max-w-none"
          />
        </Link>

        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
          <div className="mx-4 mt-4 rounded-lg bg-[#e7286f] px-4 py-4 text-center text-lg font-semibold tracking-[0.14em] text-white sm:text-xl">
            {title}
          </div>

          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
