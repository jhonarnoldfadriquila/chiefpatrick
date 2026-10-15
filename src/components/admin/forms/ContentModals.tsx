"use client";

// Menu item, photo upload and website-settings modals.
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, PlusIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useForm } from "@/components/admin/forms/useForm";
import { Button, Field, inputCls, Modal, Spinner, Toggle, useToast } from "@/components/admin/ui";
import { api, ApiClientError } from "@/lib/admin/api";
import type { Branch, MenuCategory, MenuItemRecord, SettingsKey, SiteSettings } from "@/types/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Client-side check before uploading; the server checks again. */
export function checkImage(file: File): string | null {
  if (!TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or AVIF photo.";
  if (file.size > MAX_BYTES) return "That photo is over 8 MB.";
  return null;
}

async function imageSize(file: File) {
  try {
    const bmp = await createImageBitmap(file);
    return { width: bmp.width, height: bmp.height };
  } catch {
    return { width: 0, height: 0 };
  }
}

// ---------- menu item ----------

const EMPTY_ITEM = { categoryId: 0 as number, name: "", note: "", price: "" as string | number, sold: 0 as number, image: "", isAvailable: true };

export function MenuItemModal({ id, open, onClose, onSaved, defaultCategoryId }: { id: number | null; open: boolean; onClose: () => void; onSaved?: () => void; defaultCategoryId?: number }) {
  const isNew = id === null;
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const form = useForm<typeof EMPTY_ITEM>(EMPTY_ITEM);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([api.get<MenuCategory[]>("/api/admin/menu/categories"), isNew ? null : api.get<MenuItemRecord>(`/api/admin/menu/items/${id}`)])
      .then(([cats, item]) => {
        setCategories(cats);
        form.setValues(
          item
            ? { categoryId: item.categoryId, name: item.name, note: item.note ?? "", price: item.price ?? "", sold: item.sold, image: item.image ?? "", isAvailable: item.isAvailable }
            : { ...EMPTY_ITEM, categoryId: defaultCategoryId ?? cats[0]?.id ?? 0 },
        );
      })
      .catch((e) => toast("error", e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  const upload = async (f: File) => {
    const problem = checkImage(f);
    if (problem) return toast("error", problem);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const { src } = await api.post<{ src: string }>("/api/admin/uploads", fd);
      form.set("image", src);
    } catch (e) {
      toast("error", (e as ApiClientError).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const body = { ...form.values, price: form.values.price === "" ? null : Number(form.values.price) };
    const ok = await form.submit((_) => (isNew ? api.post("/api/admin/menu/items", body) : api.patch(`/api/admin/menu/items/${id}`, body)), isNew ? "Dish added to the menu." : "Dish updated.");
    if (ok) {
      onSaved?.();
      onClose();
    }
  };

  const v = form.values;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? "Add menu item" : "Edit menu item"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={form.saving} disabled={loading || uploading}>Save</Button>
        </>
      }
    >
      {loading ? (
        <div className="grid place-items-center py-10"><Spinner /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <div>
            <button
              type="button"
              onClick={() => file.current?.click()}
              className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg border border-dashed border-adm-border bg-adm-bg text-adm-muted hover:border-adm-red"
              aria-label="Upload a photo of the dish"
            >
              {uploading ? <Spinner /> : v.image ? <Image src={v.image} alt="" fill sizes="128px" className="object-cover" /> : <ImageIcon size={28} weight="light" />}
            </button>
            <input ref={file} type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {v.image && (
              <button type="button" onClick={() => form.set("image", "")} className="mt-2 w-full text-xs text-adm-muted hover:text-adm-red">
                Remove photo
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dish name" error={form.errors.name} className="sm:col-span-2">{(fid) => <input id={fid} className={inputCls} value={v.name} onChange={(e) => form.set("name", e.target.value)} />}</Field>
            <Field label="Course" error={form.errors.categoryId}>
              {(fid) => (
                <select id={fid} className={inputCls} value={v.categoryId} onChange={(e) => form.set("categoryId", Number(e.target.value))}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </Field>
            <Field label="Note on the menu" error={form.errors.note} hint="e.g. +₱25">{(fid) => <input id={fid} className={inputCls} value={v.note} onChange={(e) => form.set("note", e.target.value)} />}</Field>
            <Field label="Price (₱, internal)" error={form.errors.price} hint="Not shown on the website.">{(fid) => <input id={fid} type="number" min={0} step="0.01" className={inputCls} value={v.price} onChange={(e) => form.set("price", e.target.value)} />}</Field>
            <Field label="Sold" error={form.errors.sold} hint="Used for “Popular menu items”.">{(fid) => <input id={fid} type="number" min={0} className={inputCls} value={v.sold} onChange={(e) => form.set("sold", Number(e.target.value))} />}</Field>
            <div className="sm:col-span-2">
              <Toggle checked={v.isAvailable} onChange={(x) => form.set("isAvailable", x)} label="Show on the website menu" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- photo upload ----------

export function UploadPhotoModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setAlt("");
      setCaption("");
      setErrors({});
    }
  }, [open]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const problem = checkImage(f);
    if (problem) return setErrors({ file: problem });
    setErrors({});
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!file) return setErrors({ file: "Choose a photo." });
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt);
      fd.append("caption", caption);
      const { width, height } = await imageSize(file);
      fd.append("width", String(width));
      fd.append("height", String(height));
      await api.post("/api/admin/gallery", fd);
      toast("success", "Photo uploaded. It's first in the gallery.");
      onSaved?.();
      onClose();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload photo"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Upload</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <label
          className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-adm-border bg-adm-bg text-adm-muted hover:border-adm-red"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-xs"><UploadSimpleIcon size={26} weight="light" />Choose or drop</span>}
          <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <div className="space-y-4">
          {errors.file && <p className="text-xs text-adm-red">{errors.file}</p>}
          <Field label="Description (alt text)" error={errors.alt} hint="Describe the photo for people using screen readers.">
            {(fid) => <input id={fid} className={inputCls} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Round tables under a ceiling of white flowers" />}
          </Field>
          <Field label="Caption (optional)" error={errors.caption}>{(fid) => <input id={fid} className={inputCls} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Wedding at CPK Main Hall" />}</Field>
          <p className="text-xs text-adm-muted">JPG, PNG, WebP or AVIF, up to 8 MB.</p>
        </div>
      </div>
    </Modal>
  );
}

// ---------- settings ----------

export const SETTINGS_TITLES: Record<Exclude<SettingsKey, "kiddie">, string> = {
  restaurant: "Restaurant Information",
  contact: "Contact Information",
  social: "Social Media Links",
  seo: "SEO Settings",
  appearance: "Site Appearance",
};

export function SettingsModal({ group, open, onClose, onSaved }: { group: Exclude<SettingsKey, "kiddie"> | null; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !group) return;
    setErrors({});
    api
      .get<SiteSettings>("/api/admin/settings")
      .then((s) => {
        setSettings(s);
        setDraft(structuredClone(s[group]) as unknown as Record<string, unknown>);
      })
      .catch((e) => toast("error", e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);

  const set = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));
  const text = (key: string, label: string, opts: { area?: boolean; hint?: string; type?: string } = {}) => (
    <Field key={key} label={label} error={errors[key]} hint={opts.hint}>
      {(fid) =>
        opts.area ? (
          <textarea id={fid} rows={3} className={inputCls} value={String(draft[key] ?? "")} onChange={(e) => set(key, e.target.value)} aria-invalid={!!errors[key]} />
        ) : (
          <input id={fid} type={opts.type ?? "text"} className={inputCls} value={String(draft[key] ?? "")} onChange={(e) => set(key, opts.type === "number" ? Number(e.target.value) : e.target.value)} aria-invalid={!!errors[key]} />
        )
      }
    </Field>
  );

  const branches = (draft.branches as Branch[] | undefined) ?? [];
  const setBranch = (i: number, patch: Partial<Branch>) => set("branches", branches.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const save = async () => {
    if (!group) return;
    setSaving(true);
    setErrors({});
    try {
      await api.put(`/api/admin/settings/${group}`, draft);
      toast("success", `${SETTINGS_TITLES[group]} saved. The website is updated.`);
      onSaved?.();
      onClose();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={group ? SETTINGS_TITLES[group] : ""}
      size={group === "contact" ? "lg" : "md"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!settings}>Save</Button>
        </>
      }
    >
      {!settings || !group ? (
        <div className="grid place-items-center py-10"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {group === "restaurant" && (
            <>
              {text("name", "Restaurant name")}
              {text("tagline", "Tagline")}
              {text("description", "Short description", { area: true })}
              {text("founded", "Year founded", { type: "number" })}
            </>
          )}
          {group === "social" && (
            <>
              {text("facebook", "Facebook page", { hint: "Full link, e.g. https://www.facebook.com/…" })}
              {text("instagram", "Instagram")}
              {text("tiktok", "TikTok (optional)")}
              {text("youtube", "YouTube (optional)")}
            </>
          )}
          {group === "seo" && (
            <>
              {text("title", "Page title", { hint: "Shown in Google results and browser tabs (about 60 characters)." })}
              {text("description", "Meta description", { area: true, hint: "About 150 characters." })}
              {text("keywords", "Keywords", { hint: "Comma-separated." })}
            </>
          )}
          {group === "appearance" && (
            <>
              <Field label="Accent colour" error={errors.accentColor} hint="Used for buttons and highlights on the website.">
                {(fid) => (
                  <div className="flex items-center gap-3">
                    <input id={fid} type="color" value={String(draft.accentColor ?? "#c8102e")} onChange={(e) => set("accentColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-adm-border bg-adm-bg" />
                    <input aria-label="Hex colour" className={inputCls} value={String(draft.accentColor ?? "")} onChange={(e) => set("accentColor", e.target.value)} />
                  </div>
                )}
              </Field>
              <Toggle checked={!!draft.showPreloader} onChange={(x) => set("showPreloader", x)} label="Show the 0–100 loading screen on first visit" />
              <Toggle checked={!!draft.showGrain} onChange={(x) => set("showGrain", x)} label="Film-grain texture over the website" />
            </>
          )}
          {group === "contact" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {text("hours", "Opening hours")}
                {text("primaryPhone", "Main phone")}
                {text("email", "Email (optional)", { type: "email" })}
              </div>
              {errors.branches && <p className="text-xs text-adm-red">{errors.branches}</p>}
              {branches.map((b, i) => (
                <fieldset key={i} className="space-y-3 rounded-lg border border-adm-border p-4">
                  <div className="flex items-center justify-between">
                    <legend className="text-sm font-semibold text-adm-text">Branch {i + 1}</legend>
                    {branches.length > 1 && (
                      <button type="button" onClick={() => set("branches", branches.filter((_, j) => j !== i))} className="text-adm-muted hover:text-adm-red" aria-label={`Remove branch ${i + 1}`}>
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input aria-label="Branch name" placeholder="Name" className={inputCls} value={b.name} onChange={(e) => setBranch(i, { name: e.target.value })} />
                    <input aria-label="Role" placeholder="e.g. Main office, kitchen and halls" className={inputCls} value={b.role} onChange={(e) => setBranch(i, { role: e.target.value })} />
                    <input aria-label="Address" placeholder="Address" className={`${inputCls} sm:col-span-2`} value={b.address} onChange={(e) => setBranch(i, { address: e.target.value })} />
                    <input aria-label="Map link" placeholder="Google Maps link" className={inputCls} value={b.mapHref} onChange={(e) => setBranch(i, { mapHref: e.target.value })} />
                    <input aria-label="Since" placeholder="Since (e.g. 2009)" className={inputCls} value={b.since} onChange={(e) => setBranch(i, { since: e.target.value })} />
                    <textarea aria-label="Phone numbers, one per line" placeholder="Phone numbers, one per line" rows={3} className={`${inputCls} sm:col-span-2`} value={b.phones.join("\n")} onChange={(e) => setBranch(i, { phones: e.target.value.split("\n") })} />
                  </div>
                </fieldset>
              ))}
              {branches.length < 6 && (
                <Button variant="secondary" size="sm" onClick={() => set("branches", [...branches, { id: `branch-${Date.now()}`, name: "", role: "", address: "", mapHref: "", phones: [], since: "" }])}>
                  <PlusIcon size={14} /> Add branch
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
