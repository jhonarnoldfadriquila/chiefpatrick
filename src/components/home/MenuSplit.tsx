"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { chineseDishes, filipinoDishes } from "@/lib/data/home";

type Dish = { name: string };

function Half({ title, dishes, start }: { title: string; dishes: Dish[]; start: number }) {
  return (
    <div>
      <div className="sticky top-24 z-10 bg-ink pt-2 pb-6">
        <h3 className="display flex items-baseline justify-between text-[clamp(3rem,7vw,7.5rem)]">
          <span className={title === "Chinese" ? "italic-wonk text-red-glow" : undefined}>{title}</span>
          <span className="micro text-muted">({dishes.length})</span>
        </h3>
      </div>
      <ul>
        {dishes.map((d, i) => (
          <li key={d.name}>
            <div
              className="group flex items-baseline gap-5 border-t border-line py-5 transition-colors duration-300 hover:text-red-glow"
            >
              <span className="micro w-9 shrink-0 text-muted">({String(start + i).padStart(2, "0")})</span>
              <span className="font-serif text-[clamp(1.5rem,2.4vw,2.5rem)] leading-tight tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                {d.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** (04) Two sticky halves of the menu, with the dishes as large type rows. */
export function MenuSplit({ dishCount }: { dishCount: number }) {
  return (
    <section aria-labelledby="menu-title" className="bg-ink py-28 md:py-40">
      <div className="container-site">
        <SectionLabel index="04" label="The menu" meta={`${dishCount} dishes · build your own buffet`} />
        <div className="mt-14 grid gap-8 md:grid-cols-12 md:items-end">
          <RevealText as="h2" id="menu-title" className="display text-title md:col-span-7">
            Two kitchens, <em className="italic-wonk">one table</em>
          </RevealText>
          <p className="max-w-md text-muted md:col-span-4 md:col-start-9">
            Filipino comfort and Chinese wok cooking, served side by side. Choose your mains, noodles, rice and desserts for
            every package.
          </p>
        </div>

        <div className="mt-20 grid gap-20 lg:grid-cols-2 lg:gap-16">
          <Half title="Filipino" dishes={filipinoDishes} start={1} />
          <Half title="Chinese" dishes={chineseDishes} start={filipinoDishes.length + 1} />
        </div>

        <Link href="/menu" className="group mt-16 inline-flex items-center gap-3 border-b border-rice pb-1 text-lg" data-cursor="Open">
          See all {dishCount} dishes
          <ArrowUpRightIcon size={20} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
        </Link>
      </div>

    </section>
  );
}
