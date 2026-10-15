import type { Metadata } from "next";
import { Collage } from "@/components/gallery/Collage";
import { PageHero } from "@/components/ui/PageHero";
import { getGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Chef Patrick's Kitchen events: buffets, styled tables, wedding and debut halls, and the crew.",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <>
      <PageHero
        label="Gallery"
        meta={`${items.length} photographs`}
        title={
          <>
            From our <em className="italic-wonk text-red-glow">events</em>
          </>
        }
        intro="Halls we have cooked for and dressed: buffets, centrepieces, stages and the crew in red. Click any photo to open it."
      />
      <section aria-label="Photographs" className="bg-ink pb-32">
        <div className="container-site">
          <Collage items={items} />
        </div>
      </section>
    </>
  );
}
