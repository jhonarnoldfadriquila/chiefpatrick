import type { Metadata } from "next";
import { VenuesRail } from "@/components/home/VenuesRail";
import { RevealText } from "@/components/motion/RevealText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { photos } from "@/lib/data/photos";
import { getVenues } from "@/lib/content";

export const metadata: Metadata = {
  title: "Venues",
  description: "CPK's own function halls in Caloocan and partner venues across Quezon City, CAMANAVA and Manila where we cater.",
};

export default async function VenuesPage() {
  const venues = await getVenues();
  const { ownHalls, partners: partnerVenues } = venues;
  const venueCount = ownHalls.length + partnerVenues.reduce((n, a) => n + a.venues.length, 0);
  return (
    <>
      <PageHero
        label="Venues"
        meta={`${venueCount} venues · Metro Manila`}
        title={
          <>
            Halls &amp; <em className="italic-wonk text-red-glow">venues</em>
          </>
        }
        intro={`${ownHalls.length} halls of our own at UE Caloocan, and ${venueCount - ownHalls.length} partner venues where our crew already knows the kitchen.`}
        photo={photos.greenCeilingHall}
      />
      <VenuesRail venues={venues} />

      <section aria-labelledby="partners-title" className="bg-ink py-24 md:py-36">
        <div className="container-site">
          <SectionLabel index="07" label="Partner venues" meta="Capacity in guests" />
          <RevealText as="h2" id="partners-title" className="display mt-14 text-title">
            Where else we <em className="italic-wonk text-red-glow">cater</em>
          </RevealText>
          <div className="mt-16 space-y-20">
            {partnerVenues.map((group, gi) => (
              <div key={group.area} className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="micro text-muted">({String(gi + 1).padStart(2, "0")})</p>
                  <h3 className="display mt-3 text-4xl md:text-5xl lg:sticky lg:top-28">{group.area}</h3>
                </div>
                <table className="w-full text-left lg:col-span-8">
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Venue</th>
                      <th scope="col">Address</th>
                      <th scope="col">Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.venues.map((v) => (
                      <tr key={v.name} className="group border-t border-line align-baseline">
                        <th scope="row" className="py-5 pr-6 font-serif text-2xl font-normal tracking-tight transition-colors group-hover:text-red-glow">
                          {v.name}
                          {v.address && <span className="mt-1 block font-sans text-sm text-muted md:hidden">{v.address}</span>}
                        </th>
                        <td className="hidden py-5 pr-6 text-sm text-muted md:table-cell">{v.address ?? "—"}</td>
                        <td className="micro py-5 text-right whitespace-nowrap tabular-nums">
                          {v.min}–{v.max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
