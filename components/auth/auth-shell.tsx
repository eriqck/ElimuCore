import Image from "next/image";
import Link from "next/link";
import codingArtwork from "@/assets/coding.png";
import familyArtwork from "@/assets/family.png";
import logo from "@/assets/weblogo.png";

type AuthShellProps = {
  title: string;
  children: React.ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#6f1023] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(87,12,30,0.94),rgba(122,16,41,0.9))]" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 -left-24 w-[40rem] opacity-[0.16] blur-[8px]">
          <Image
            src={codingArtwork}
            alt=""
            fill
            priority
            className="object-contain object-left"
          />
        </div>

        <div className="absolute inset-y-0 -right-16 w-[44rem] opacity-[0.2] blur-[8px]">
          <Image
            src={familyArtwork}
            alt=""
            fill
            priority
            className="object-contain object-right"
          />
        </div>
      </div>

      <div className="relative w-full max-w-[24rem]">
        <Link
          href="/"
          className="mx-auto mb-5 flex w-fit items-center justify-center rounded-full bg-white/95 p-3 shadow-[0_14px_28px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
        >
          <Image
            src={logo}
            alt="ELimuCore"
            priority
            className="h-14 w-auto sm:h-16"
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
