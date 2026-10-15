import type { ReactNode } from "react";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Photo } from "@/lib/data/photos";

interface PageHeroProps {
  label: string;
  meta: string;
  title: ReactNode;
  intro: ReactNode;
  photo?: Photo;
}

/** Header for inner pages: a huge split headline, a short intro and one wide photograph that wipes open. */
export function PageHero({ label, meta, title, intro, photo }: PageHeroProps) {
  return (
    <section aria-labelledby="page-title" className="bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container-site">
        <SectionLabel index="00" label={label} meta={meta} />
        <RevealText as="h1" id="page-title" trigger="intro" className="display mt-12 text-hero md:mt-16">
          {title}
        </RevealText>
        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
          <RevealText as="p" trigger="intro" delay={0.25} className="max-w-xl text-lg leading-relaxed text-muted md:col-span-5 md:col-start-8 md:text-xl">
            {intro}
          </RevealText>
        </div>
        {photo && <RevealImage photo={photo} sizes="100vw" priority className="mt-16 aspect-[16/10] md:mt-24 md:aspect-[21/9]" />}
      </div>
    </section>
  );
}
