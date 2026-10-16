"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { BuffetBuilder, KiddieBuilder, TrayBuilder } from "@/components/meal-builder/Builders";
import { Checkout, type CheckoutResult } from "@/components/meal-builder/Checkout";
import { Stepper } from "@/components/meal-builder/parts";
import { useMotion } from "@/components/motion/SmoothScroll";
import { NEXT_STEPS, packagePicks, priceLine, TRAY_SIZES, trayPrices, type Catalog, type OrderLine, type PricedLine } from "@/lib/data/meal-builder";
import { photos, type Photo } from "@/lib/data/photos";
import { cn, formatPeso } from "@/lib/format";

type Service = "tray" | "buffet" | "kiddie";
const STEPS = ["Service", "Build", "Review", "Details"] as const;
const STORAGE_KEY = "cpk-meal-order";

interface Props {
  catalog: Catalog;
  kiddieSets: { name: string; courses: string[][] }[];
}

/** Four-step order estimator: choose a service → build → review → details. */
export function MealBuilder({ catalog, kiddieSets }: Props) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service>("tray");
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [done, setDone] = useState<CheckoutResult | null>(null);
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);
  const { lenis } = useMotion();

  // The order survives a reload (a per-browser convenience only; nothing is sent until checkout).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as OrderLine[];
      if (Array.isArray(saved)) setLines(saved.filter((l) => !("error" in priceLine(l, catalog))));
    } catch {}
    loaded.current = true;
  }, [catalog]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const priced = lines.map((l) => ({ line: l, p: priceLine(l, catalog) })).filter((x): x is { line: OrderLine; p: PricedLine } => !("error" in x.p));
  const total = priced.reduce((n, x) => n + x.p.total, 0);
  const count = lines.length;

  const go = (to: number) => {
    setStep(to);
    requestAnimationFrame(() => {
      if (!top.current) return;
      if (lenis) lenis.scrollTo(top.current, { offset: -110, duration: 1 });
      else top.current.scrollIntoView({ behavior: "smooth" });
    });
  };
  const start = (s: Service) => {
    setService(s);
    go(1);
  };
  const add = (l: OrderLine) => setLines((ls) => [...ls, l]);
  const remove = (key: string) => setLines((ls) => ls.filter((l) => l.key !== key));
  const setQty = (key: string, qty: number) => setLines((ls) => ls.map((l) => (l.key === key && l.kind === "tray" ? { ...l, qty } : l)));

  if (done) {
    return (
      <div ref={top} role="status" aria-live="polite" className="grid gap-14 py-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CheckCircleIcon size={56} weight="duotone" className="text-red-glow" />
          <p className="display mt-8 text-[clamp(3rem,7vw,6rem)]">
            Salamat, <em className="italic-wonk text-red-glow">{done.firstName}</em>
          </p>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Your order for {new Date(`${done.date}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })} is with our kitchen.
            Estimated total {formatPeso(done.total)}. {done.receive}.
          </p>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              go(0);
            }}
            className="micro mt-10 inline-flex h-12 items-center rounded-full border border-rice px-6 transition-colors hover:bg-rice hover:text-ink"
          >
            Start a new order
          </button>
        </div>
        <div className="lg:col-span-5">
          <p className="micro text-muted">What happens next</p>
          <ol className="mt-4">
            {NEXT_STEPS.map((s, i) => (
              <li key={s} className="flex gap-5 border-t border-line py-5">
                <span className="micro w-8 shrink-0 text-red-glow">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className={cn(step === 1 && count > 0 && "pb-28")}>
      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => {
          const reachable = i < step || (i === 2 && count > 0 && step >= 1) || (i === 3 && count > 0 && step >= 2);
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => (reachable || i === 0 ? go(i) : undefined)}
                disabled={i > step && !reachable}
                aria-current={i === step ? "step" : undefined}
                className={cn("micro w-full border-t pt-3 text-left transition-colors", i <= step ? "border-red-glow text-rice" : "border-line text-muted")}
              >
                <span className="hidden sm:inline">({String(i + 1).padStart(2, "0")}) </span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-14">
        {step === 0 && <ServicePicker catalog={catalog} onPick={start} count={count} total={total} onReview={() => go(2)} />}

        {step === 1 && (
          <>
            <StepHead
              kicker="Step 2 of 4 · Build your order"
              title={{ tray: "Party trays", buffet: "Buffet package", kiddie: "Kiddie party" }[service]}
              back={() => go(0)}
              backLabel="All services"
            />
            {service === "tray" && <TrayBuilder catalog={catalog} onAdd={add} />}
            {service === "buffet" && <BuffetBuilder catalog={catalog} onAdd={add} />}
            {service === "kiddie" && <KiddieBuilder catalog={catalog} sets={kiddieSets} onAdd={add} />}
          </>
        )}

        {step === 2 && (
          <>
            <StepHead kicker="Step 3 of 4 · Review your order" title="Your order" back={() => go(count ? 1 : 0)} backLabel="Keep building" />
            {count === 0 ? (
              <div className="border-t border-line py-16">
                <p className="text-lg text-muted">Nothing chosen yet.</p>
                <button type="button" onClick={() => go(0)} className="micro mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-red px-6 text-rice hover:bg-red-glow">
                  Choose a service <ArrowRightIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="grid gap-12 lg:grid-cols-12">
                <ul className="lg:col-span-8">
                  {priced.map(({ line, p }) => (
                    <li key={line.key} className="flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <p className="font-serif text-2xl leading-tight tracking-tight">{p.title}</p>
                        <ul className="mt-2 space-y-0.5 text-sm text-muted">
                          {p.details.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-4">
                        {line.kind === "tray" && <Stepper value={line.qty} onChange={(n) => setQty(line.key, n)} min={1} max={50} label={`trays of ${line.dish}`} />}
                        <p className="w-28 text-right text-lg tabular-nums">{formatPeso(p.total)}</p>
                        <button type="button" onClick={() => remove(line.key)} aria-label={`Remove ${p.title}`} className="grid size-10 place-items-center text-muted transition-colors hover:text-red-glow">
                          <TrashIcon size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                  <li className="border-t border-line pt-6">
                    <button type="button" onClick={() => go(0)} className="micro inline-flex items-center gap-2 text-muted transition-colors hover:text-rice">
                      <PlusIcon size={16} /> Add something else
                    </button>
                  </li>
                </ul>
                <aside className="lg:col-span-4">
                  <div className="border border-line bg-charcoal p-6 lg:sticky lg:top-28">
                    <p className="micro text-muted">
                      {count} item{count === 1 ? "" : "s"} · feeds about {priced.reduce((n, x) => n + x.p.pax, 0)}
                    </p>
                    <p className="display mt-4 text-5xl tabular-nums">{formatPeso(total)}</p>
                    <p className="mt-3 text-sm text-muted">Delivery and any rush fee are added on the next step.</p>
                    <button type="button" onClick={() => go(3)} className="micro mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-red text-rice transition-colors hover:bg-red-glow">
                      Continue to details <ArrowRightIcon size={18} />
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <StepHead kicker="Step 4 of 4 · Almost done" title="Your details" back={() => go(2)} backLabel="Your order" />
            <Checkout
              lines={lines}
              foodTotal={total}
              onBack={() => go(2)}
              onDone={(r) => {
                setLines([]);
                setDone(r);
                requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth" }));
              }}
            />
          </>
        )}
      </div>

      {/* Running total while building */}
      {step === 1 && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[110] border-t border-line bg-ink/95 backdrop-blur">
          <div className="container-site flex h-20 items-center justify-between gap-4">
            <p>
              <span className="micro block whitespace-nowrap text-muted">
                <span className="max-sm:hidden">Running total · </span>
                {count} item{count === 1 ? "" : "s"}
              </span>
              <span className="text-2xl tabular-nums">{formatPeso(total)}</span>
            </p>
            <button type="button" onClick={() => go(2)} className="micro inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-red px-6 whitespace-nowrap text-rice transition-colors hover:bg-red-glow">
              Review order <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepHead({ kicker, title, back, backLabel }: { kicker: string; title: string; back: () => void; backLabel: string }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="micro text-muted">{kicker}</p>
        <h2 className="display mt-4 text-[clamp(2.75rem,6vw,5.5rem)]">{title}</h2>
      </div>
      <button type="button" onClick={back} className="micro inline-flex items-center gap-2 text-muted transition-colors hover:text-rice">
        <ArrowLeftIcon size={16} /> {backLabel}
      </button>
    </div>
  );
}

function ServicePicker({ catalog, onPick, count, total, onReview }: { catalog: Catalog; onPick: (s: Service) => void; count: number; total: number; onReview: () => void }) {
  const cheapestTray = Math.min(...catalog.menu.filter((s) => s.items.length).map((s) => trayPrices(s.id).small));
  const cheapestPkg = catalog.packages.length ? Math.min(...catalog.packages.map((p) => p.price)) : 0;
  const services: { id: Service; title: string; desc: string; photo: Photo; meta: [string, string][]; from: number; hidden?: boolean }[] = [
    {
      id: "tray",
      title: "Party trays",
      desc: `Order à la carte from all ${catalog.menu.reduce((n, s) => n + s.items.length, 0)} dishes on the menu, by the tray.`,
      photo: photos.buffet,
      meta: [["Sizes", TRAY_SIZES.map((s) => s.label).join(" · ")], ["Serves", "8 to 35 per tray"]],
      from: Number.isFinite(cheapestTray) ? cheapestTray : 0,
    },
    {
      id: "buffet",
      title: "Buffet package",
      desc: "Pick a package, then choose its mains, desserts and rice yourself.",
      photo: photos.redHall,
      meta: [["Packages", catalog.packages.map((p) => p.name).join(" · ")], ["Choices", catalog.packages.map((p) => packagePicks(p).mains).join(" / ") + " mains"]],
      from: cheapestPkg,
      hidden: !catalog.packages.length,
    },
    {
      id: "kiddie",
      title: "Kiddie party",
      desc: "A fixed-price set for children: noodles, mains, sweets and drinks.",
      photo: photos.kidsParty,
      meta: [["Sets", "A · B · C"], ["Minimum", `${catalog.kiddie.minimum} children`]],
      from: catalog.kiddie.price,
    },
  ];

  return (
    <>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="micro text-muted">Step 1 of 4</p>
          <h2 className="display mt-4 text-[clamp(2.75rem,6vw,5.5rem)]">
            Choose a <em className="italic-wonk text-red-glow">service</em>
          </h2>
        </div>
        {count > 0 && (
          <button type="button" onClick={onReview} className="micro inline-flex h-12 items-center gap-2 rounded-full border border-rice px-6 transition-colors hover:bg-rice hover:text-ink">
            Your order · {count} · {formatPeso(total)} <ArrowRightIcon size={16} />
          </button>
        )}
      </div>
      <div className="grid gap-px border border-line bg-line md:grid-cols-3">
        {services
          .filter((s) => !s.hidden)
          .map((s, i) => (
            <button key={s.id} type="button" onClick={() => onPick(s.id)} data-cursor="Build" className="group flex flex-col bg-ink text-left">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <p className="micro text-muted">({String(i + 1).padStart(2, "0")})</p>
                <h3 className="display mt-4 text-[clamp(2.25rem,3.5vw,3.25rem)] transition-colors group-hover:text-red-glow">{s.title}</h3>
                <p className="mt-3 text-muted">{s.desc}</p>
                <dl className="mt-6 mb-8 space-y-1.5 text-sm">
                  {s.meta.map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <dt className="micro w-20 shrink-0 pt-0.5 text-muted">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-6">
                  <p>
                    <span className="micro block text-muted">From</span>
                    <span className="text-2xl tabular-nums">{formatPeso(s.from)}</span>
                  </p>
                  <span className="micro inline-flex items-center gap-2 text-rice">
                    Start building <ArrowRightIcon size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </>
  );
}
