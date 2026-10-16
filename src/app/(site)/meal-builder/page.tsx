import type { Metadata } from "next";
import { MealBuilder } from "@/components/meal-builder/MealBuilder";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMealCatalog } from "@/lib/content";
import { kiddieMenu } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Meal Builder",
  description: "Plan your Chef Patrick's Kitchen catering order: party trays, buffet packages and the kiddie menu, priced upfront.",
};

export default async function MealBuilderPage() {
  const catalog = await getMealCatalog();
  const dishes = catalog.menu.reduce((n, s) => n + s.items.length, 0);

  return (
    <section aria-labelledby="page-title" className="bg-ink pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="container-site">
        <SectionLabel index="00" label="Meal builder" meta={`${dishes} dishes · priced upfront`} />
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
          <RevealText as="h1" id="page-title" trigger="intro" className="display text-[clamp(3.5rem,9vw,10rem)] md:col-span-8">
            Plan your <em className="italic-wonk text-red-glow">order</em>
          </RevealText>
          <p className="max-w-md text-lg leading-relaxed text-muted md:col-span-4">
            Party trays, buffet packages and the kiddie menu. Build it dish by dish, see the total as you go, and we confirm within a day.
          </p>
        </div>
        <div className="mt-20 md:mt-28">
          <MealBuilder catalog={catalog} kiddieSets={kiddieMenu.sets.map((s) => ({ name: s.name, courses: s.courses.map((c) => [...c]) }))} />
        </div>
      </div>
    </section>
  );
}
