"use client";

// Catering packages, gallery, testimonials and venues management pages.
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, PencilSimpleIcon, PlusIcon, TrashIcon, UsersIcon } from "@phosphor-icons/react";
import { UploadPhotoModal } from "@/components/admin/forms/ContentModals";
import { useForm } from "@/components/admin/forms/useForm";
import { PageHeader, useDeepLink } from "@/components/admin/page-kit";
import { Button, EmptyState, ErrorState, Field, inputCls, LoadingRows, Modal, Panel, StatusBadge, Toggle, useConfirm, useToast } from "@/components/admin/ui";
import { api, peso, useApi } from "@/lib/admin/api";
import type { GalleryRecord, PackageRecord, TestimonialRecord, VenueAreaRecord, VenueRecord } from "@/types/admin";

function useActions(reload: () => void) {
  const toast = useToast();
  return async (run: () => Promise<unknown>, message: string) => {
    try {
      await run();
      toast("success", message);
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };
}

const iconBtn = "inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-card2 hover:text-adm-text disabled:opacity-30";

// ---------- packages ----------

const EMPTY_PKG = { name: "", guests: 50 as number, price: 0 as number, forWho: "", inclusions: "", sampleMenu: "", popular: false };

function PackageModal({ pkg, open, onClose, onSaved }: { pkg: PackageRecord | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const form = useForm<typeof EMPTY_PKG>(EMPTY_PKG);
  useEffect(() => {
    if (!open) return;
    form.setValues(pkg ? { ...pkg, inclusions: pkg.inclusions.join("\n"), sampleMenu: pkg.sampleMenu.join("\n") } : EMPTY_PKG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pkg]);
  const save = async () => {
    const ok = await form.submit((v) => (pkg ? api.patch(`/api/admin/packages/${pkg.id}`, v) : api.post("/api/admin/packages", v)), pkg ? "Package saved." : "Package created.");
    if (ok) {
      onSaved();
      onClose();
    }
  };
  const v = form.values;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={pkg ? `Edit ${pkg.name}` : "Create package"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={form.saving}>Save</Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Package name" error={form.errors.name}>{(id) => <input id={id} className={inputCls} value={v.name} onChange={(e) => form.set("name", e.target.value)} placeholder="e.g. Diamond" />}</Field>
        <Field label="Guests" error={form.errors.guests}>{(id) => <input id={id} type="number" min={1} className={inputCls} value={v.guests} onChange={(e) => form.set("guests", Number(e.target.value))} />}</Field>
        <Field label="Price (₱)" error={form.errors.price}>{(id) => <input id={id} type="number" min={0} className={inputCls} value={v.price} onChange={(e) => form.set("price", Number(e.target.value))} />}</Field>
        <Field label="Who it's for" error={form.errors.forWho} className="md:col-span-3">{(id) => <input id={id} className={inputCls} value={v.forWho} onChange={(e) => form.set("forWho", e.target.value)} placeholder="One sentence" />}</Field>
        <Field label="What's included (one per line)" error={form.errors.inclusions} className="md:col-span-3 lg:col-span-1">{(id) => <textarea id={id} rows={7} className={inputCls} value={v.inclusions} onChange={(e) => form.set("inclusions", e.target.value)} />}</Field>
        <Field label="Sample menu (one dish per line)" error={form.errors.sampleMenu} className="md:col-span-3 lg:col-span-2">{(id) => <textarea id={id} rows={7} className={inputCls} value={v.sampleMenu} onChange={(e) => form.set("sampleMenu", e.target.value)} />}</Field>
        <div className="md:col-span-3">
          <Toggle checked={v.popular} onChange={(x) => form.set("popular", x)} label="Most chosen (shown in red on the website)" />
        </div>
      </div>
    </Modal>
  );
}

export function PackagesPage() {
  const { data, error, reload } = useApi<PackageRecord[]>("/api/admin/packages");
  const deep = useDeepLink();
  const [modal, setModal] = useState<{ pkg: PackageRecord | null } | null>(null);
  const { confirm, dialog } = useConfirm();
  const act = useActions(reload);
  useEffect(() => {
    if (deep.isNew) setModal({ pkg: null });
  }, [deep.isNew]);

  return (
    <>
      <PageHeader
        title="Catering Packages"
        subtitle="The package cards on the website, in this order."
        actions={<Button onClick={() => setModal({ pkg: null })}><PlusIcon size={16} /> Create package</Button>}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingRows rows={3} />
      ) : data.length === 0 ? (
        <EmptyState>No packages yet.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col rounded-lg border bg-adm-card p-5 ${p.popular ? "border-adm-red" : "border-adm-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-adm-text">{p.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-adm-muted"><UsersIcon size={13} /> {p.guests} guests</p>
                </div>
                {p.popular && <span className="rounded-full bg-adm-red px-2.5 py-0.5 text-[11px] font-medium text-white">Most chosen</span>}
              </div>
              <p className="mt-4 text-2xl font-semibold text-adm-text tabular-nums">{peso(p.price)}</p>
              <p className="mt-2 text-sm text-adm-muted">{p.forWho}</p>
              <ul className="mt-4 flex-1 space-y-1 text-[13px] text-adm-text">
                {p.inclusions.slice(0, 5).map((x) => <li key={x}>• {x}</li>)}
                {p.inclusions.length > 5 && <li className="text-adm-muted">+{p.inclusions.length - 5} more</li>}
              </ul>
              <div className="mt-5 flex items-center gap-1 border-t border-adm-border pt-3">
                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => act(() => api.patch(`/api/admin/packages/${p.id}`, { move: -1 }), "Moved.")} aria-label="Move earlier"><ArrowUpIcon size={14} /></button>
                <button type="button" className={iconBtn} disabled={i === data.length - 1} onClick={() => act(() => api.patch(`/api/admin/packages/${p.id}`, { move: 1 }), "Moved.")} aria-label="Move later"><ArrowDownIcon size={14} /></button>
                <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setModal({ pkg: p })}>Edit</Button>
                <button type="button" onClick={async () => (await confirm(`Delete the ${p.name} package?`)) && act(() => api.del(`/api/admin/packages/${p.id}`), "Package deleted.")} className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red" aria-label={`Delete ${p.name}`}><TrashIcon size={15} /></button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      <PackageModal pkg={modal?.pkg ?? null} open={!!modal} onClose={() => (setModal(null), deep.isNew && deep.clear())} onSaved={reload} />
      {dialog}
    </>
  );
}

// ---------- gallery ----------

export function GalleryPage() {
  const { data, error, reload } = useApi<GalleryRecord[]>("/api/admin/gallery");
  const [upload, setUpload] = useState(false);
  const [edit, setEdit] = useState<GalleryRecord | null>(null);
  const [preview, setPreview] = useState<GalleryRecord | null>(null);
  const [text, setText] = useState({ alt: "", caption: "" });
  const { confirm, dialog } = useConfirm();
  const act = useActions(reload);

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle={`${data?.length ?? 0} photos on the website. The first nine also appear on the home page.`}
        actions={<Button onClick={() => setUpload(true)}><PlusIcon size={16} /> Upload photo</Button>}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingRows rows={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {data.map((p, i) => (
            <motion.figure key={p.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(i, 12) * 0.03 }} className="overflow-hidden rounded-lg border border-adm-border bg-adm-card">
              <button type="button" onClick={() => setPreview(p)} className="group relative block aspect-square w-full overflow-hidden" aria-label={`Preview ${p.caption ?? p.alt}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 text-[10px] text-white">{i + 1}{i < 9 ? " · home" : ""}</span>
              </button>
              <figcaption className="flex items-center gap-1 p-2">
                <span className="min-w-0 flex-1 truncate px-1 text-xs text-adm-muted">{p.caption ?? "No caption"}</span>
                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => act(() => api.patch(`/api/admin/gallery/${p.id}`, { move: -1 }), "Moved.")} aria-label="Move earlier"><ArrowUpIcon size={13} /></button>
                <button type="button" className={iconBtn} disabled={i === data.length - 1} onClick={() => act(() => api.patch(`/api/admin/gallery/${p.id}`, { move: 1 }), "Moved.")} aria-label="Move later"><ArrowDownIcon size={13} /></button>
                <button type="button" className={iconBtn} onClick={() => (setEdit(p), setText({ alt: p.alt, caption: p.caption ?? "" }))} aria-label="Edit text"><PencilSimpleIcon size={13} /></button>
                <button type="button" className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red" onClick={async () => (await confirm("Remove this photo from the gallery?")) && act(() => api.del(`/api/admin/gallery/${p.id}`), "Photo removed.")} aria-label="Remove photo"><TrashIcon size={13} /></button>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      )}
      <UploadPhotoModal open={upload} onClose={() => setUpload(false)} onSaved={reload} />
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Edit photo text"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={() => edit && act(() => api.patch(`/api/admin/gallery/${edit.id}`, text), "Photo updated.").then(() => setEdit(null))}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Caption">{(id) => <input id={id} className={inputCls} value={text.caption} onChange={(e) => setText({ ...text, caption: e.target.value })} />}</Field>
          <Field label="Description (alt text)">{(id) => <textarea id={id} rows={3} className={inputCls} value={text.alt} onChange={(e) => setText({ ...text, alt: e.target.value })} />}</Field>
        </div>
      </Modal>
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.caption ?? "Photo"} size="lg">
        {preview && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-adm-bg">
            <Image src={preview.src} alt={preview.alt} fill sizes="768px" className="object-contain" />
          </div>
        )}
      </Modal>
      {dialog}
    </>
  );
}

// ---------- testimonials ----------

const EMPTY_T = { quote: "", author: "", event: "", published: true, isSample: false };

export function TestimonialsPage() {
  const { data, error, reload } = useApi<TestimonialRecord[]>("/api/admin/testimonials");
  const [modal, setModal] = useState<{ t: TestimonialRecord | null } | null>(null);
  const form = useForm<typeof EMPTY_T>(EMPTY_T);
  const { confirm, dialog } = useConfirm();
  const act = useActions(reload);
  const samples = (data ?? []).filter((t) => t.isSample && t.published).length;

  const openModal = (t: TestimonialRecord | null) => {
    form.setValues(t ? { quote: t.quote, author: t.author, event: t.event, published: t.published, isSample: t.isSample } : EMPTY_T);
    setModal({ t });
  };
  const save = async () => {
    const t = modal?.t;
    if (await form.submit((v) => (t ? api.patch(`/api/admin/testimonials/${t.id}`, v) : api.post("/api/admin/testimonials", v)), t ? "Testimonial saved." : "Testimonial added.")) {
      setModal(null);
      reload();
    }
  };

  return (
    <>
      <PageHeader title="Testimonials" subtitle="Quotes in the “Kind words” section of the home page. Only use real clients' words, with permission." actions={<Button onClick={() => openModal(null)}><PlusIcon size={16} /> Add testimonial</Button>} />
      {samples > 0 && <p className="mb-4 rounded-lg border border-adm-yellow/40 bg-adm-yellow/10 px-4 py-3 text-sm text-adm-yellow">{samples} sample {samples === 1 ? "quote is" : "quotes are"} live on the website. Replace them with real client quotes or hide them.</p>}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingRows />
      ) : data.length === 0 ? (
        <EmptyState>No testimonials yet.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((t, i) => (
            <motion.article key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex flex-col rounded-lg border border-adm-border bg-adm-card p-5">
              <div className="flex items-center gap-2">
                <StatusBadge status={t.published ? "live" : "hidden"} />
                {t.isSample && <span className="rounded-full bg-adm-yellow/12 px-2.5 py-0.5 text-[11px] text-adm-yellow">Sample</span>}
              </div>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-adm-text">&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="mt-3 text-sm text-adm-muted">{t.author}{t.event ? ` · ${t.event}` : ""}</p>
              <div className="mt-4 flex items-center gap-3 border-t border-adm-border pt-3">
                <Toggle checked={t.published} onChange={(v) => act(() => api.patch(`/api/admin/testimonials/${t.id}`, { published: v }), v ? "Shown on the website." : "Hidden from the website.")} label="Show on site" />
                <Button size="sm" variant="secondary" className="ml-auto" onClick={() => openModal(t)}>Edit</Button>
                <button type="button" onClick={async () => (await confirm("Delete this testimonial?")) && act(() => api.del(`/api/admin/testimonials/${t.id}`), "Deleted.")} className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red" aria-label="Delete"><TrashIcon size={15} /></button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.t ? "Edit testimonial" : "Add testimonial"} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={save} loading={form.saving}>Save</Button></>}>
        <div className="space-y-4">
          <Field label="Quote" error={form.errors.quote}>{(id) => <textarea id={id} rows={4} className={inputCls} value={form.values.quote} onChange={(e) => form.set("quote", e.target.value)} />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name" error={form.errors.author}>{(id) => <input id={id} className={inputCls} value={form.values.author} onChange={(e) => form.set("author", e.target.value)} placeholder="e.g. Maria S." />}</Field>
            <Field label="Event" error={form.errors.event}>{(id) => <input id={id} className={inputCls} value={form.values.event} onChange={(e) => form.set("event", e.target.value)} placeholder="e.g. Debut · 150 guests" />}</Field>
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle checked={form.values.published} onChange={(v) => form.set("published", v)} label="Show on the website" />
            <Toggle checked={form.values.isSample} onChange={(v) => form.set("isSample", v)} label="Sample (shows a tag)" />
          </div>
        </div>
      </Modal>
      {dialog}
    </>
  );
}

// ---------- venues ----------

type VenueEdit = { id: number | null; areaId: number | null; name: string; address: string; min: number; max: number };

export function VenuesPage() {
  const { data, error, reload } = useApi<{ ownHalls: VenueRecord[]; areas: VenueAreaRecord[] }>("/api/admin/venues");
  const [venue, setVenue] = useState<VenueEdit | null>(null);
  const [area, setArea] = useState<{ id: number | null; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const act = useActions(reload);

  const saveVenue = async () => {
    if (!venue) return;
    setSaving(true);
    try {
      if (venue.id) await api.patch(`/api/admin/venues/${venue.id}`, venue);
      else await api.post("/api/admin/venues", venue);
      toast("success", "Venue saved.");
      setVenue(null);
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const saveArea = async () => {
    if (!area) return;
    setSaving(true);
    try {
      if (area.id) await api.patch(`/api/admin/venues/${area.id}?kind=area`, { name: area.name });
      else await api.post("/api/admin/venues", { kind: "area", name: area.name });
      toast("success", "Area saved.");
      setArea(null);
      reload();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const table = (venues: VenueRecord[], areaId: number | null) => (
    <>
      {venues.length === 0 ? (
        <EmptyState className="py-6">No venues here yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-adm-border/60">
          {venues.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13px]">
              <span className="min-w-40 flex-1">
                <span className="block font-medium text-adm-text">{v.name}</span>
                {v.address && <span className="block text-[11px] text-adm-muted">{v.address}</span>}
              </span>
              <span className="text-adm-muted tabular-nums">{v.min}–{v.max} guests</span>
              <Button size="sm" variant="secondary" onClick={() => setVenue({ id: v.id, areaId: v.areaId, name: v.name, address: v.address ?? "", min: v.min, max: v.max })}>Edit</Button>
              <button type="button" onClick={async () => (await confirm(`Remove ${v.name}?`)) && act(() => api.del(`/api/admin/venues/${v.id}`), "Venue removed.")} className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red" aria-label={`Remove ${v.name}`}><TrashIcon size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-adm-border px-4 py-2.5">
        <button type="button" onClick={() => setVenue({ id: null, areaId, name: "", address: "", min: 50, max: 200 })} className="text-xs font-medium text-adm-red hover:text-adm-red-hover">+ Add venue</button>
      </div>
    </>
  );

  return (
    <>
      <PageHeader title="Venues" subtitle="Your own halls and the partner venues where you cater. Capacities feed the website's venue pages and numbers." actions={<Button onClick={() => setArea({ id: null, name: "" })}><PlusIcon size={16} /> Add area</Button>} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingRows rows={6} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Our halls (UE Caloocan)">{table(data.ownHalls, null)}</Panel>
          {data.areas.map((a) => (
            <Panel
              key={a.id}
              title={`${a.name} · ${a.venues.length}`}
              action={
                <div className="flex gap-1">
                  <button type="button" className={iconBtn} onClick={() => setArea({ id: a.id, name: a.name })} aria-label={`Rename ${a.name}`}><PencilSimpleIcon size={14} /></button>
                  <button type="button" className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red" onClick={async () => (await confirm(`Delete the area "${a.name}" and its ${a.venues.length} venues?`)) && act(() => api.del(`/api/admin/venues/${a.id}?kind=area`), "Area deleted.")} aria-label={`Delete ${a.name}`}><TrashIcon size={14} /></button>
                </div>
              }
            >
              {table(a.venues, a.id)}
            </Panel>
          ))}
        </div>
      )}
      <Modal open={!!venue} onClose={() => setVenue(null)} title={venue?.id ? "Edit venue" : "Add venue"} footer={<><Button variant="secondary" onClick={() => setVenue(null)}>Cancel</Button><Button onClick={saveVenue} loading={saving}>Save</Button></>}>
        {venue && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} value={venue.name} onChange={(e) => setVenue({ ...venue, name: e.target.value })} />}</Field>
            <Field label="Address (optional)" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} value={venue.address} onChange={(e) => setVenue({ ...venue, address: e.target.value })} />}</Field>
            <Field label="Minimum guests">{(id) => <input id={id} type="number" min={0} className={inputCls} value={venue.min} onChange={(e) => setVenue({ ...venue, min: Number(e.target.value) })} />}</Field>
            <Field label="Maximum guests">{(id) => <input id={id} type="number" min={1} className={inputCls} value={venue.max} onChange={(e) => setVenue({ ...venue, max: Number(e.target.value) })} />}</Field>
          </div>
        )}
      </Modal>
      <Modal open={!!area} onClose={() => setArea(null)} title={area?.id ? "Rename area" : "Add area"} size="sm" footer={<><Button variant="secondary" onClick={() => setArea(null)}>Cancel</Button><Button onClick={saveArea} loading={saving} disabled={!area?.name.trim()}>Save</Button></>}>
        <Field label="Area name">{(id) => <input id={id} autoFocus className={inputCls} value={area?.name ?? ""} onChange={(e) => setArea((a) => (a ? { ...a, name: e.target.value } : a))} placeholder="e.g. Bulacan" />}</Field>
      </Modal>
      {dialog}
    </>
  );
}
