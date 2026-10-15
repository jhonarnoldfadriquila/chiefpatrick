import type { Metadata } from "next";
import { PackageStack } from "@/components/home/PackageStack";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealText } from "@/components/motion/RevealText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getCateringPackages } from "@/lib/content";
import { photos } from "@/lib/data/photos";

export const metadata: Metadata = {
  title: "Catering Packages",
  description: "Catering packages from Chef Patrick's Kitchen: buffet, crew, styling and venue, quoted for your guest count.",
};

const STEPS = [
  ["Tell us the day", "Send the date, the guest count and the venue, or ask us to suggest one of our halls."],
  ["Choose the dishes", "Pick from the full menu. Any dish in a package can be swapped for another."],
  ["Confirm the quote", "We send a menu and a quote, then hold the date once it is confirmed."],
  ["We cook, set and serve", "Everything is cooked on the day, set up at the venue and served by our crew."],
];

export default async function CateringPage() {
  const packages = await getCateringPackages();
  return (
    <>
      <PageHero
        label="Packages"
        meta="Buffet · crew · styling · hall"
        title={
          <>
            Packages, <em className="italic-wonk text-red-glow">plated</em>
          </>
        }
        intro="A buffet, a crew to serve it and, if you want, the styling and the hall. Choose a package and make the menu your own."
        photo={photos.lanterns}
      />
      <PackageStack packages={packages} index="01" />

      <section aria-labelledby="steps-title" className="bg-ink py-24 md:py-40">
        <div className="container-site">
          <SectionLabel index="02" label="How booking works" meta="Four steps" />
          <div className="mt-14 grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <RevealText as="h2" id="steps-title" className="display text-title lg:sticky lg:top-28">
                From inquiry to <em className="italic-wonk text-red-glow">last dance</em>
              </RevealText>
            </div>
            <ol className="lg:col-span-6 lg:col-start-7">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="grid grid-cols-[4rem_1fr] gap-4 border-t border-line py-8">
                  <span className="display text-4xl text-red-glow italic-wonk">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-2xl">{title}</h3>
                    <p className="mt-2 text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-24 grid gap-5 md:grid-cols-3">
            {[photos.tableNumber, photos.buffet, photos.crewStanding].map((p, i) => (
              <RevealImage key={p.src} photo={p} sizes="(min-width: 768px) 33vw, 92vw" from={i === 1 ? "bottom" : i ? "right" : "left"} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
