import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { QuestionForm } from "@/components/forms/QuestionForm";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getCateringPackages, getSettings } from "@/lib/content";
import { telHref } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact & Reservations",
  description: "Plan your event with Chef Patrick's Kitchen: a five-step inquiry, a quick question, or call our Caloocan and Balut, Tondo branches.",
};

export default async function ContactPage() {
  const [packages, settings] = await Promise.all([getCateringPackages(), getSettings()]);
  const { branches, hours } = settings.contact;

  return (
    <>
      <section aria-labelledby="page-title" className="bg-ink pt-32 md:pt-40">
        <div className="container-site">
          <SectionLabel index="00" label="Contact" meta={hours} />
          <RevealText as="h1" id="page-title" trigger="intro" className="display mt-12 text-hero md:mt-16">
            Reserve your <em className="italic-wonk text-red-glow">date</em>
          </RevealText>
        </div>
      </section>

      <section id="contact" aria-label="Event inquiry" className="scroll-mt-24 bg-ink py-20 md:py-28">
        <div className="container-site">
          <InquiryForm packages={packages} />
        </div>
      </section>

      <section aria-labelledby="question-title" className="bg-ink pb-24 md:pb-36">
        <div className="container-site grid gap-12 border-t border-line pt-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="02" label="Ask us anything" meta="Reply within a day" />
            <RevealText as="h2" id="question-title" className="display mt-10 text-[clamp(2.5rem,5vw,4.5rem)]">
              Just a <em className="italic-wonk text-red-glow">question?</em>
            </RevealText>
            <p className="mt-6 max-w-sm text-muted">Menus, venues, dates or prices. Ask, and we&rsquo;ll answer by email.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <QuestionForm />
          </div>
        </div>
      </section>

      <section aria-labelledby="branches-title" className="bg-charcoal py-24 md:py-36">
        <div className="container-site">
          <SectionLabel index="03" label="Branches" meta="Call or visit" />
          <h2 id="branches-title" className="sr-only">
            Our branches
          </h2>
          <div className="mt-14 grid gap-16 md:grid-cols-2">
            {branches.map((b) => (
              <div key={b.id}>
                <p className="micro text-muted">
                  {b.role}
                  {b.since ? ` · since ${b.since}` : ""}
                </p>
                <h3 className="display mt-4 text-[clamp(2.5rem,5vw,4.5rem)]">{b.name}</h3>
                {b.mapHref ? (
                  <a href={b.mapHref} target="_blank" rel="noopener noreferrer" className="link-draw mt-6 inline-block text-xl" data-cursor="Map">
                    {b.address}
                  </a>
                ) : (
                  <p className="mt-6 text-xl">{b.address}</p>
                )}
                <ul className="mt-6 flex flex-wrap gap-2">
                  {b.phones.map((ph) => (
                    <li key={ph}>
                      <a href={telHref(ph)} className="inline-flex h-11 items-center rounded-full border border-line px-5 tabular-nums transition-colors hover:border-red hover:bg-red">
                        {ph}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
