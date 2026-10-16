"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { Choice, Stepper } from "@/components/meal-builder/parts";
import { mainSections, packagePicks, priceLine, section, surchargePerHead, TRAY_SIZES, trayPrices, type Catalog, type OrderLine, type TraySize } from "@/lib/data/meal-builder";
import { photos, type Photo } from "@/lib/data/photos";
import { cn, formatPeso } from "@/lib/format";

export type AddLine = (line: OrderLine) => void;

const newKey = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** The "Add to order" button, which confirms for a moment after each add. */
function AddButton({ disabled, onAdd, total, hint }: { disabled: boolean; onAdd: () => void; total: number; hint?: string }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onAdd();
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
        }}
        className="micro inline-flex h-14 items-center gap-3 rounded-full bg-red px-7 text-rice transition-colors hover:bg-red-glow disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? <CheckIcon size={18} weight="bold" /> : <PlusIcon size={18} />}
        {added ? "Added to order" : `Add to order${total > 0 ? ` · ${formatPeso(total)}` : ""}`}
      </button>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

function SidePhoto({ photo, label, title, meta }: { photo: Photo; label: string; title: string; meta: string }) {
  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface lg:aspect-[4/5]">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
      </div>
      <p className="micro mt-6 text-muted">{label}</p>
      <p className="display mt-3 text-[clamp(2.25rem,4vw,3.5rem)]">{title}</p>
      <p className="mt-3 text-muted">{meta}</p>
    </div>
  );
}

// ---------- Party trays ----------

export function TrayBuilder({ catalog, onAdd }: { catalog: Catalog; onAdd: AddLine }) {
  const sections = catalog.menu.filter((s) => s.items.length);
  const [tab, setTab] = useState(sections[0]?.id ?? "");
  const [dish, setDish] = useState<string | null>(null);
  const [size, setSize] = useState<TraySize>("medium");
  const [qty, setQty] = useState(1);
  const current = section(sections, tab) ?? sections[0];
  if (!current) return <p className="text-muted">The menu is empty right now.</p>;
  const prices = trayPrices(current.id);

  const pick = (name: string) => {
    setDish(dish === name ? null : name);
    setQty(1);
  };

  return (
    <div>
      <div role="tablist" aria-label="Courses" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
        {sections.map((s) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={s.id === current.id}
            onClick={() => {
              setTab(s.id);
              setDish(null);
            }}
            className={cn(
              "micro h-11 shrink-0 rounded-full border px-5 transition-colors",
              s.id === current.id ? "border-red bg-red text-rice" : "border-line text-muted hover:border-rice hover:text-rice",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SidePhoto photo={photos.buffet} label={`${current.items.length} dishes`} title={current.name} meta={`Trays from ${formatPeso(prices.small)} · serves 8 to 35`} />
        </div>

        <ul role="tabpanel" aria-label={current.name} className="lg:col-span-8">
          {current.items.map((item) => {
            const open = dish === item.name;
            const extra = surchargePerHead(item.note);
            const unit = (s: (typeof TRAY_SIZES)[number]) => prices[s.id] + extra * s.pax;
            const chosen = TRAY_SIZES.find((s) => s.id === size)!;
            return (
              <li key={item.name} className={cn("border-t border-line transition-colors", open && "bg-charcoal")}>
                <button type="button" aria-expanded={open} onClick={() => pick(item.name)} className="group flex w-full items-baseline gap-4 px-0 py-5 text-left md:px-4">
                  <span className={cn("flex-1 font-serif text-[clamp(1.25rem,2vw,1.75rem)] leading-tight tracking-tight transition-colors", open ? "text-red-glow" : "group-hover:text-red-glow")}>
                    {item.name}
                  </span>
                  {item.note && <span className="micro text-gold">{item.note}/head</span>}
                  <span className="micro shrink-0 text-muted tabular-nums">from {formatPeso(unit(TRAY_SIZES[0]))}</span>
                </button>
                {open && (
                  <div className="space-y-6 px-0 pb-8 md:px-4">
                    <fieldset>
                      <legend className="micro text-muted">Tray size</legend>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {TRAY_SIZES.map((s) => (
                          <Choice key={s.id} active={size === s.id} onClick={() => setSize(s.id)} className="px-4 py-3">
                            <span className="block text-lg">{s.label}</span>
                            <span className={cn("block text-sm", size === s.id ? "text-rice/80" : "text-muted")}>{s.desc}</span>
                            <span className="mt-1 block tabular-nums">{formatPeso(unit(s))}</span>
                          </Choice>
                        ))}
                      </div>
                    </fieldset>
                    <div className="flex flex-wrap items-end gap-6">
                      <div>
                        <p className="micro mb-3 text-muted">Trays</p>
                        <Stepper value={qty} onChange={setQty} min={1} max={50} label="trays" />
                      </div>
                      <AddButton
                        disabled={false}
                        total={unit(chosen) * qty}
                        onAdd={() => onAdd({ kind: "tray", key: newKey(), sectionId: current.id, dish: item.name, size, qty })}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ---------- Buffet packages ----------

export function BuffetBuilder({ catalog, onAdd }: { catalog: Catalog; onAdd: AddLine }) {
  const pkgs = catalog.packages;
  const [pkgId, setPkgId] = useState(pkgs.find((p) => p.popular)?.id ?? pkgs[0]?.id ?? "");
  const pkg = pkgs.find((p) => p.id === pkgId);
  const [guests, setGuests] = useState(pkg?.guests ?? 50);
  const [mains, setMains] = useState<string[]>([]);
  const [desserts, setDesserts] = useState<string[]>([]);
  const rices = section(catalog.menu, "rice")?.items ?? [];
  const [rice, setRice] = useState(rices[0]?.name ?? "");
  if (!pkg) return <p className="text-muted">No buffet packages are offered right now.</p>;

  const picks = packagePicks(pkg);
  const choosePackage = (id: string) => {
    const next = pkgs.find((p) => p.id === id)!;
    setPkgId(id);
    setGuests((g) => Math.max(g, next.guests));
    const n = packagePicks(next);
    setMains((m) => m.slice(0, n.mains));
    setDesserts((d) => d.slice(0, n.desserts));
  };
  const toggle = (list: string[], set: (v: string[]) => void, max: number, name: string) =>
    set(list.includes(name) ? list.filter((x) => x !== name) : list.length < max ? [...list, name] : list);

  const line: OrderLine = { kind: "buffet", key: "", packageId: pkg.id, guests, mains, desserts, rice };
  const priced = priceLine(line, catalog);
  const missing = [
    mains.length < picks.mains && `${picks.mains - mains.length} more main${picks.mains - mains.length === 1 ? "" : "s"}`,
    desserts.length < picks.desserts && `${picks.desserts - desserts.length} more dessert${picks.desserts - desserts.length === 1 ? "" : "s"}`,
  ].filter(Boolean);

  const reset = () => {
    setMains([]);
    setDesserts([]);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <SidePhoto photo={photos.redHall} label={`${pkg.guests} guests included`} title={`${pkg.name} buffet`} meta={pkg.forWho} />
      </div>

      <div className="space-y-14 lg:col-span-8">
        <fieldset>
          <legend className="micro text-muted">(a) Package</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {pkgs.map((p) => {
              const n = packagePicks(p);
              return (
                <Choice key={p.id} active={p.id === pkg.id} onClick={() => choosePackage(p.id)} className="px-5 py-4">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-serif text-2xl">{p.name}</span>
                    {p.popular && <span className="micro text-gold">Popular</span>}
                  </span>
                  <span className="mt-1 block text-xl tabular-nums">{formatPeso(p.price)}</span>
                  <span className={cn("mt-1 block text-sm", p.id === pkg.id ? "text-rice/80" : "text-muted")}>
                    {p.guests} guests · {n.mains} mains · {n.desserts} dessert{n.desserts === 1 ? "" : "s"}
                  </span>
                </Choice>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="micro text-muted">(b) Guests</p>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <Stepper value={guests} onChange={setGuests} min={pkg.guests} max={1000} step={5} label="guests" />
            <p className="text-sm text-muted">
              Includes {pkg.guests}. Each extra guest is {formatPeso(Math.round(pkg.price / pkg.guests))}.
            </p>
          </div>
        </div>

        <fieldset>
          <legend className="flex w-full items-baseline justify-between gap-4">
            <span className="micro text-muted">(c) Main dishes</span>
            <span className={cn("micro tabular-nums", mains.length === picks.mains ? "text-gold" : "text-muted")}>
              {mains.length} of {picks.mains} chosen
            </span>
          </legend>
          <div className="mt-4 space-y-6">
            {mainSections(catalog.menu).map((s) => (
              <div key={s.id}>
                <p className="mb-2 font-serif text-xl">{s.name}</p>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((i) => (
                    <Choice
                      key={i.name}
                      active={mains.includes(i.name)}
                      disabled={!mains.includes(i.name) && mains.length >= picks.mains}
                      onClick={() => toggle(mains, setMains, picks.mains, i.name)}
                      className="rounded-full px-4 py-2 text-sm"
                    >
                      {i.name}
                    </Choice>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="flex w-full items-baseline justify-between gap-4">
            <span className="micro text-muted">(d) Desserts</span>
            <span className={cn("micro tabular-nums", desserts.length === picks.desserts ? "text-gold" : "text-muted")}>
              {desserts.length} of {picks.desserts} chosen
            </span>
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {(section(catalog.menu, "desserts")?.items ?? []).map((i) => (
              <Choice
                key={i.name}
                active={desserts.includes(i.name)}
                disabled={!desserts.includes(i.name) && desserts.length >= picks.desserts}
                onClick={() => toggle(desserts, setDesserts, picks.desserts, i.name)}
                className="rounded-full px-4 py-2 text-sm"
              >
                {i.name}
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="micro text-muted">(e) Rice</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {rices.map((r) => (
              <Choice key={r.name} active={rice === r.name} onClick={() => setRice(r.name)} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>{r.name}</span>
                <span className={cn("micro", rice === r.name ? "text-rice" : "text-gold")}>{r.note ? `${r.note}/head` : "Included"}</span>
              </Choice>
            ))}
          </div>
        </fieldset>

        <div className="border-t border-line pt-8">
          <AddButton
            disabled={"error" in priced}
            total={"error" in priced ? 0 : priced.total}
            hint={missing.length ? `Choose ${missing.join(" and ")}.` : undefined}
            onAdd={() => {
              onAdd({ ...line, key: newKey() });
              reset();
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------- Kiddie menu ----------

export function KiddieBuilder({ catalog, sets, onAdd }: { catalog: Catalog; sets: { name: string; courses: string[][] }[]; onAdd: AddLine }) {
  const { price, minimum } = catalog.kiddie;
  const [set, setSet] = useState(sets[0]?.name ?? "");
  const [children, setChildren] = useState(minimum);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <SidePhoto photo={photos.kidsParty} label={`Minimum ${minimum} children`} title="Kiddie menu" meta={`${formatPeso(price)} per child. Noodles, mains, sweets and drinks, made for little guests.`} />
      </div>
      <div className="space-y-12 lg:col-span-8">
        <fieldset>
          <legend className="micro text-muted">(a) Choose a set</legend>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {sets.map((s) => (
              <Choice key={s.name} active={set === s.name} onClick={() => setSet(s.name)} className="p-5">
                <span className="display block text-3xl italic-wonk">{s.name}</span>
                <dl className="mt-4 space-y-2">
                  {s.courses.map(([course, dishes]) => (
                    <div key={course}>
                      <dt className={cn("micro", set === s.name ? "text-rice/75" : "text-muted")}>{course}</dt>
                      <dd className="text-sm leading-snug">{dishes}</dd>
                    </div>
                  ))}
                </dl>
              </Choice>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="micro text-muted">(b) Children</p>
          <div className="mt-4">
            <Stepper value={children} onChange={setChildren} min={minimum} max={500} step={5} label="children" />
          </div>
        </div>
        <div className="border-t border-line pt-8">
          <AddButton disabled={!set} total={price * children} onAdd={() => onAdd({ kind: "kiddie", key: newKey(), set, children })} />
        </div>
      </div>
    </div>
  );
}
