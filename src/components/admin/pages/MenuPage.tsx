"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, ForkKnifeIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { MenuItemModal } from "@/components/admin/forms/ContentModals";
import { PageHeader, SearchBox, td, th, useDeepLink } from "@/components/admin/page-kit";
import { Button, EmptyState, ErrorState, Field, inputCls, LoadingRows, Modal, Pager, Panel, Toggle, useConfirm, useToast } from "@/components/admin/ui";
import { api, peso, useApi } from "@/lib/admin/api";
import { cn } from "@/lib/format";
import type { MenuCategory, MenuItemRecord, SiteSettings } from "@/types/admin";

const PAGE_SIZE = 25;

export function MenuPage() {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const deep = useDeepLink();
  const cats = useApi<MenuCategory[]>("/api/admin/menu/categories");
  const [category, setCategory] = useState<number | 0>(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const items = useApi<MenuItemRecord[]>(`/api/admin/menu/items?categoryId=${category || ""}&q=${encodeURIComponent(q)}&page=${page}&pageSize=${PAGE_SIZE}`);
  const [itemModal, setItemModal] = useState<{ id: number | null } | null>(null);
  const [catModal, setCatModal] = useState<{ id: number | null; name: string } | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [kiddie, setKiddie] = useState({ price: 350, minimum: 30 });

  useEffect(() => {
    if (deep.open) setItemModal({ id: deep.open });
    else if (deep.isNew) setItemModal({ id: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deep.open, deep.isNew]);

  useEffect(() => {
    api.get<SiteSettings>("/api/admin/settings").then((s) => setKiddie(s.kiddie)).catch(() => {});
  }, []);

  const refresh = useCallback(() => {
    items.reload();
    cats.reload();
  }, [items, cats]);

  const act = async (run: () => Promise<unknown>, message: string) => {
    try {
      await run();
      toast("success", message);
      refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  const saveCategory = async () => {
    if (!catModal) return;
    setCatSaving(true);
    try {
      if (catModal.id) await api.patch(`/api/admin/menu/categories/${catModal.id}`, { name: catModal.name });
      else await api.post("/api/admin/menu/categories", { name: catModal.name });
      toast("success", catModal.id ? "Course renamed." : "Course added.");
      setCatModal(null);
      cats.reload();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setCatSaving(false);
    }
  };

  const total = (cats.data ?? []).reduce((n, c) => n + (c.itemCount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Menu Management"
        subtitle={`${total} dishes in ${cats.data?.length ?? 0} courses. Changes show on the website's Menu page immediately.`}
        actions={
          <Button onClick={() => setItemModal({ id: null })}>
            <PlusIcon size={16} /> Add menu item
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Courses */}
        <div className="space-y-4">
          <Panel
            title="Courses"
            action={
              <button type="button" onClick={() => setCatModal({ id: null, name: "" })} className="text-xs font-medium text-adm-red hover:text-adm-red-hover">
                + Add
              </button>
            }
          >
            {cats.error ? (
              <ErrorState message={cats.error} onRetry={cats.reload} />
            ) : !cats.data ? (
              <LoadingRows />
            ) : (
              <ul className="p-2">
                <li>
                  <button type="button" onClick={() => (setCategory(0), setPage(1))} className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-sm", category === 0 ? "bg-adm-red text-white" : "text-adm-muted hover:bg-adm-card2 hover:text-adm-text")}>
                    All dishes <span className="text-xs opacity-80">{total}</span>
                  </button>
                </li>
                {cats.data.map((c, i) => (
                  <li key={c.id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => (setCategory(c.id), setPage(1))}
                      className={cn("flex min-w-0 flex-1 items-center justify-between rounded-md px-3 py-2 text-sm", category === c.id ? "bg-adm-red text-white" : "text-adm-muted hover:bg-adm-card2 hover:text-adm-text")}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-xs opacity-80">{c.itemCount}</span>
                    </button>
                    <div className="flex opacity-60 group-hover:opacity-100">
                      <button type="button" disabled={i === 0} onClick={() => act(() => api.patch(`/api/admin/menu/categories/${c.id}`, { move: -1 }), "Course moved.")} aria-label={`Move ${c.name} up`} className="grid size-7 place-items-center rounded text-adm-muted hover:text-adm-text disabled:opacity-30">
                        <ArrowUpIcon size={13} />
                      </button>
                      <button type="button" disabled={i === cats.data!.length - 1} onClick={() => act(() => api.patch(`/api/admin/menu/categories/${c.id}`, { move: 1 }), "Course moved.")} aria-label={`Move ${c.name} down`} className="grid size-7 place-items-center rounded text-adm-muted hover:text-adm-text disabled:opacity-30">
                        <ArrowDownIcon size={13} />
                      </button>
                      <button type="button" onClick={() => setCatModal({ id: c.id, name: c.name })} aria-label={`Rename ${c.name}`} className="grid size-7 place-items-center rounded text-adm-muted hover:text-adm-text">
                        <PencilSimpleIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (await confirm(`Delete the course "${c.name}" and its ${c.itemCount} dishes?`)) {
                            act(() => api.del(`/api/admin/menu/categories/${c.id}`), "Course deleted.");
                            if (category === c.id) setCategory(0);
                          }
                        }}
                        aria-label={`Delete ${c.name}`}
                        className="grid size-7 place-items-center rounded text-adm-muted hover:text-adm-red"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Kiddie menu */}
          <Panel title="Kiddie menu" bodyClassName="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price per child (₱)">{(id) => <input id={id} type="number" min={0} className={inputCls} value={kiddie.price} onChange={(e) => setKiddie({ ...kiddie, price: Number(e.target.value) })} />}</Field>
              <Field label="Minimum children">{(id) => <input id={id} type="number" min={0} className={inputCls} value={kiddie.minimum} onChange={(e) => setKiddie({ ...kiddie, minimum: Number(e.target.value) })} />}</Field>
            </div>
            <Button size="sm" variant="secondary" onClick={() => act(() => api.put("/api/admin/settings/kiddie", kiddie), "Kiddie menu updated.")}>
              Save
            </Button>
          </Panel>
        </div>

        {/* Dishes */}
        <Panel
          title={category ? cats.data?.find((c) => c.id === category)?.name : "All dishes"}
          action={<SearchBox value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search dishes…" />}
        >
          {items.error ? (
            <ErrorState message={items.error} onRetry={items.reload} />
          ) : !items.data ? (
            <LoadingRows rows={10} />
          ) : items.data.length === 0 ? (
            <EmptyState>{q ? `No dishes match “${q}”.` : "No dishes in this course yet."}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className={cn("w-full min-w-[720px]", items.loading && "opacity-60")}>
                <thead className="border-b border-adm-border">
                  <tr>
                    <th className={th}>Dish</th>
                    <th className={th}>Course</th>
                    <th className={th}>Price</th>
                    <th className={th}>Sold</th>
                    <th className={th}>On website</th>
                    <th className={`${th} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.data.map((m, i) => (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 12) * 0.02 }} className="border-b border-adm-border/60 last:border-0 hover:bg-adm-card2/60">
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-adm-card2 text-adm-muted">
                            {m.image ? <Image src={m.image} alt="" fill sizes="40px" className="object-cover" /> : <ForkKnifeIcon size={16} weight="light" />}
                          </span>
                          <span>
                            <span className="block font-medium">{m.name}</span>
                            {m.note && <span className="text-[11px] text-adm-muted">{m.note}</span>}
                          </span>
                        </div>
                      </td>
                      <td className={`${td} text-adm-muted`}>{m.categoryName}</td>
                      <td className={`${td} tabular-nums`}>{peso(m.price)}</td>
                      <td className={`${td} tabular-nums`}>{m.sold}</td>
                      <td className={td}>
                        <Toggle checked={m.isAvailable} onChange={(v) => act(() => api.patch(`/api/admin/menu/items/${m.id}`, { isAvailable: v }), v ? "Dish shown on the website." : "Dish hidden from the website.")} label="" />
                      </td>
                      <td className={`${td} text-right whitespace-nowrap`}>
                        {category !== 0 && (
                          <>
                            <button type="button" onClick={() => act(() => api.patch(`/api/admin/menu/items/${m.id}`, { move: -1 }), "Moved.")} aria-label={`Move ${m.name} up`} className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:text-adm-text">
                              <ArrowUpIcon size={14} />
                            </button>
                            <button type="button" onClick={() => act(() => api.patch(`/api/admin/menu/items/${m.id}`, { move: 1 }), "Moved.")} aria-label={`Move ${m.name} down`} className="inline-grid size-8 place-items-center rounded-md text-adm-muted hover:text-adm-text">
                              <ArrowDownIcon size={14} />
                            </button>
                          </>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => setItemModal({ id: m.id })}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={async () => (await confirm(`Remove "${m.name}" from the menu?`)) && act(() => api.del(`/api/admin/menu/items/${m.id}`), "Dish removed.")}
                          aria-label={`Delete ${m.name}`}
                          className="ml-1 inline-grid size-8 place-items-center rounded-md text-adm-muted hover:bg-adm-red/10 hover:text-adm-red"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pager page={page} pageSize={PAGE_SIZE} total={Number(items.meta.total ?? 0)} onPage={setPage} />
        </Panel>
      </div>

      <MenuItemModal
        id={itemModal?.id ?? null}
        open={!!itemModal}
        defaultCategoryId={category || undefined}
        onClose={() => {
          setItemModal(null);
          if (deep.open || deep.isNew) deep.clear();
        }}
        onSaved={refresh}
      />
      <Modal
        open={!!catModal}
        onClose={() => setCatModal(null)}
        title={catModal?.id ? "Rename course" : "New course"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatModal(null)}>Cancel</Button>
            <Button onClick={saveCategory} loading={catSaving} disabled={!catModal?.name.trim()}>Save</Button>
          </>
        }
      >
        <Field label="Course name">{(id) => <input id={id} autoFocus className={inputCls} value={catModal?.name ?? ""} onChange={(e) => setCatModal((c) => (c ? { ...c, name: e.target.value } : c))} placeholder="e.g. Drinks" />}</Field>
      </Modal>
      {dialog}
    </>
  );
}
