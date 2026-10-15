import type { Metadata } from "next";
import { Marquee } from "@/components/motion/Marquee";
import { RevealText } from "@/components/motion/RevealText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getKiddie, getMenu } from "@/lib/content";
import { kiddieMenu } from "@/lib/data/menu";
import { photos } from "@/lib/data/photos";
import { formatPeso } from "@/lib/format";

export const metadata: Metadata = {
  title: "Menu",
  description: "The Chef Patrick's Kitchen catering menu: soups, beef, pork, chicken, seafood, noodles, rice, desserts and the kiddie menu.",
};

export default async function MenuPage() {
  const [menu, kiddie] = await Promise.all([getMenu(), getKiddie()]);
  const dishCount = menu.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <PageHero
        label="Menu"
        meta={`${dishCount} dishes · ${menu.length} courses`}
        title={
          <>
            The <em className="italic-wonk text-red-glow">menu</em>
          </>
        }
        intro="Build your buffet from the whole list. Pick the mains, noodles, rice and desserts; we quote by package and guest count."
        photo={photos.buffet}
      />

      <section aria-label="Courses" className="border-y border-line bg-ink py-6">
        <Marquee items={menu.map((s) => s.name)} className="display text-[clamp(2.5rem,5vw,4.5rem)]" baseSpeed={45} />
      </section>

      <section aria-label="Dishes" className="bg-ink py-24 md:py-32">
        <div className="container-site space-y-24 md:space-y-32">
          {menu.map((section, si) => (
            <div key={section.id} id={section.id} className="grid scroll-mt-28 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <p className="micro text-muted">
                    ({String(si + 1).padStart(2, "0")}) {section.items.length} dishes
                  </p>
                  <RevealText as="h2" className="display mt-4 text-[clamp(3rem,6vw,6rem)]">
                    {si % 3 === 1 ? <em className="italic-wonk text-red-glow">{section.name}</em> : section.name}
                  </RevealText>
                </div>
              </div>
              <ul className="lg:col-span-8">
                {section.items.map((item, i) => (
                  <li key={item.name} className="group flex items-baseline gap-5 border-t border-line py-5">
                    <span className="micro w-9 shrink-0 text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-serif text-[clamp(1.375rem,2.2vw,2.25rem)] leading-tight tracking-tight transition-[color,translate] duration-500 group-hover:translate-x-2 group-hover:text-red-glow">
                      {item.name}
                    </span>
                    {item.note && <span className="micro text-gold">{item.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="kiddie" aria-labelledby="kiddie-title" className="bg-red py-24 md:py-36">
        <div className="container-site">
          <SectionLabel index={String(menu.length + 1).padStart(2, "0")} label="Kiddie menu" meta={`Minimum ${kiddie.minimum} children`} className="border-rice/30 [&_span]:text-rice" />
          <div className="mt-14 flex flex-wrap items-end justify-between gap-8">
            <RevealText as="h2" id="kiddie-title" className="display text-title">
              For the <em className="italic-wonk">little</em> guests
            </RevealText>
            <p className="display text-[clamp(3rem,6vw,5.5rem)]">
              {formatPeso(kiddie.price)}
              <span className="micro ml-3 align-middle">++ / child</span>
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {kiddieMenu.sets.map((set) => (
              <div key={set.name}>
                <h3 className="display border-b border-rice/30 pb-4 text-4xl italic-wonk">{set.name}</h3>
                <dl className="mt-6 space-y-4">
                  {set.courses.map(([course, dishes]) => (
                    <div key={course}>
                      <dt className="micro text-rice/75">{course}</dt>
                      <dd className="mt-1 text-lg leading-snug">{dishes}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
