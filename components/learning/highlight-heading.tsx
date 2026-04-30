type HighlightHeadingProps = {
  before?: string;
  highlight: string;
  after?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
};

export function HighlightHeading({
  before,
  highlight,
  after,
  className = "",
  align = "left",
  as = "h2"
}: HighlightHeadingProps) {
  const Tag = as;

  return (
    <Tag
      className={`font-display flex flex-wrap items-center gap-x-3 gap-y-3 leading-[0.96] tracking-tight text-[#145f84] ${
        align === "center" ? "justify-center text-center" : "justify-start text-left"
      } ${className}`}
    >
      {before ? <span>{before}</span> : null}
      <span className="learning-highlight-shell">
        <span className="learning-highlight-fill">{highlight}</span>
      </span>
      {after ? <span>{after}</span> : null}
    </Tag>
  );
}
