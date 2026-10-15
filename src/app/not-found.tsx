import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-5 text-rice">
      <div className="text-center">
        <p className="micro text-muted">(404) Not found</p>
        <h1 className="display mt-8 text-[clamp(4rem,12vw,12rem)]">
          Not on the <em className="italic-wonk text-red-glow">menu</em>
        </h1>
        <Link href="/" className="micro mt-12 inline-flex h-14 items-center rounded-full bg-red px-8 transition-colors hover:bg-red-glow">
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
