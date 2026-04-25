import Link from "next/link";

type AuthShellProps = {
  kicker: string;
  title: string;
  description: string;
  sideTitle: string;
  sideCopy: string;
  sideItems: string[];
  children: React.ReactNode;
  footerPrompt: string;
  footerHref: string;
  footerLinkLabel: string;
};

export function AuthShell({
  kicker,
  title,
  description,
  sideTitle,
  sideCopy,
  sideItems,
  children,
  footerPrompt,
  footerHref,
  footerLinkLabel
}: AuthShellProps) {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="brand-band rounded-[2rem] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
            {kicker}
          </p>
          <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {sideTitle}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-100">
            {sideCopy}
          </p>

          <div className="mt-8 grid gap-3">
            {sideItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-[2rem] border border-white/60 p-8 sm:p-10">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.22em]">
            {kicker}
          </p>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-stone-200 pt-6 text-sm text-slate-600">
            {footerPrompt}{" "}
            <Link
              href={footerHref}
              className="font-semibold text-rose-900 transition hover:text-orange-600"
            >
              {footerLinkLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
