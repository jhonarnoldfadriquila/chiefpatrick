import type { Metadata } from "next";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealText } from "@/components/motion/RevealText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { photos } from "@/lib/data/photos";

export const metadata: Metadata = {
  title: "About Us",
  description: "Chef Patrick's Kitchen opened in Balut, Tondo in 2009 and has catered from its own Caloocan halls since 2013.",
};

// Mission, as published by CPK (lightly edited for length).
const MISSION = [
  "Create a venue and a dining experience guests remember long after the party.",
  "Use high-quality, fresh ingredients to deliver superior dishes at affordable prices.",
  "Keep pushing our commitment to excellent customer service.",
  "Give work to people who are skilled in food and beverage.",
  "Build a crew that communicates and works as one team.",
  "Be the leading catering company in Metro Manila.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        meta="Balut, Tondo · 2009"
        title={
          <>
            Started <em className="italic-wonk text-red-glow">small</em>
          </>
        }
        intro="A local restaurant that grew into a caterer with its own halls, still cooking Filipino and Chinese food at fair prices."
        photo={photos.crewStanding}
      />

      {/* (01) 2009 / (02) 2013 */}
      {[
        {
          year: "2009",
          title: "Rodriguez Street, Balut",
          text: "Chef Patrick’s Kitchen began as a small restaurant at 2293 Rodriguez St. in Balut, Tondo, delighting neighbours with fresh Filipino and Chinese dishes at an affordable price. Families asked us to cook for their parties, and the restaurant became a caterer.",
          photo: photos.buffet,
        },
        {
          year: "2013",
          title: "Our own halls in Caloocan",
          text: "On 28 June 2013 we opened a second branch on UE Tech Street in Caloocan, for 100 to 300 guests. It is now our office, our main kitchen and the home of CPK Main Hall, Hall B and the two Dine & Cheers rooms.",
          photo: photos.redCarpetHall,
        },
      ].map((c, i) => (
        <section key={c.year} aria-labelledby={`y-${c.year}`} className="bg-ink py-20 md:py-32">
          <div className="container-site">
            <SectionLabel index={String(i + 1).padStart(2, "0")} label={c.title} meta={c.year} />
            <div className="mt-14 grid items-end gap-12 md:grid-cols-12">
              <div className={i % 2 ? "md:order-2 md:col-span-5 md:col-start-8" : "md:col-span-5"}>
                <RevealText as="h2" id={`y-${c.year}`} className="display text-[clamp(6rem,16vw,16rem)] text-red-glow italic-wonk">
                  {c.year}
                </RevealText>
                <RevealText as="p" className="mt-8 max-w-md text-lg leading-relaxed text-muted">
                  {c.text}
                </RevealText>
              </div>
              <div className={i % 2 ? "md:order-1 md:col-span-6" : "md:col-span-6 md:col-start-7"}>
                <RevealImage photo={c.photo} sizes="(min-width: 768px) 50vw, 92vw" from={i % 2 ? "left" : "right"} className="aspect-[4/5]" />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* (03) Mission */}
      <section aria-labelledby="mission-title" className="relative overflow-hidden bg-red-deep py-24 md:py-36">
        <span aria-hidden className="pointer-events-none absolute -top-[10vw] right-0 font-serif text-[40vw] leading-none text-transparent opacity-10 select-none [-webkit-text-stroke:1.5px_var(--color-rice)]">
          囍
        </span>
        <div className="container-site relative">
          <SectionLabel index="03" label="Mission" meta="What we promise" className="border-rice/25 [&_span]:text-rice" />
          <RevealText as="h2" id="mission-title" className="display mt-14 max-w-[16ch] text-title">
            Good food, at a <em className="italic-wonk">fair</em> price
          </RevealText>
          <ol className="mt-16 grid gap-x-12 md:grid-cols-2">
            {MISSION.map((m, i) => (
              <li key={m} className="flex gap-6 border-t border-rice/25 py-6">
                <span className="micro w-10 shrink-0 pt-1 text-rice/70">({String(i + 1).padStart(2, "0")})</span>
                <span className="text-xl leading-snug">{m}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* (04) Vision */}
      <section aria-labelledby="vision-title" className="bg-ink py-24 md:py-40">
        <div className="container-site grid gap-14 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <SectionLabel index="04" label="Vision" meta="Caloocan · Tondo" />
            <h2 id="vision-title" className="sr-only">
              Vision
            </h2>
            <RevealText as="p" className="display mt-12 text-[clamp(2rem,4vw,3.75rem)] leading-[1.05]">
              To be the <em className="italic-wonk text-red-glow">premier venue</em> for our neighbours&rsquo; gatherings, with exceptional food and
              outstanding service at reasonable prices.
            </RevealText>
          </div>
          <RevealImage photo={photos.crewSeated} sizes="(min-width: 768px) 40vw, 92vw" className="aspect-[4/5] md:col-span-5 md:col-start-8" />
        </div>
      </section>
    </>
  );
}
