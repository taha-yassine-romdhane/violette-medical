import Reveal from "@/components/motion/Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Part of the title rendered in the brand violet */
  accent?: string;
  description?: string;
  align?: "center" | "left";
}

export default function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`max-w-3xl mb-10 sm:mb-12 ${centered ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <span className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4 ${centered ? "justify-center" : ""}`}>
          <span className="w-8 h-px bg-purple-300" />
          {eyebrow}
          {centered && <span className="w-8 h-px bg-purple-300" />}
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-4">
          {title} {accent && <span className="text-gradient-violet">{accent}</span>}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={160}>
          <p className="text-[15px] sm:text-lg text-gray-500 leading-relaxed">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
