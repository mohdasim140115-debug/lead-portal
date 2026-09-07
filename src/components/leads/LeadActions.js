"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive } from "lucide-react";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Field } from "@/components/ui/Input";
import { ADMIN_SETTABLE_STATUS, LEAD_STATUS_LABELS } from "@/lib/constants";

export function LeadActions({ lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [editing, setEditing] = useState(false);

  const sold = ["purchased", "assigned"].includes(lead.status);

  async function changeStatus() {
    if (status === lead.status) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/leads/${lead.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note || undefined }),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) return setMsg(body.message);
    setNote("");
    router.refresh();
  }

  async function archive() {
    if (!confirm("Archive this lead? It will be hidden from lists.")) return;
    setBusy(true);
    const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    const body = await res.json();
    setBusy(false);
    if (!body.success) return setMsg(body.message);
    router.push("/admin/leads");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={sold} className="w-auto">
          {[...new Set([lead.status, ...ADMIN_SETTABLE_STATUS])].map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s] || s}</option>
          ))}
        </Select>
        <Button size="sm" onClick={changeStatus} disabled={busy || sold || status === lead.status}>
          Update
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)} aria-label="Edit lead">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={archive} disabled={busy || sold} aria-label="Archive lead">
          <Archive className="h-4 w-4" />
        </Button>
      </div>
      {!sold ? (
        <Input
          placeholder="Optional note for status change"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-64"
        />
      ) : (
        <p className="text-xs text-muted-foreground">Sold leads are locked.</p>
      )}
      {msg ? <p className="text-xs text-danger">{msg}</p> : null}

      <EditLeadModal lead={lead} open={editing} onClose={() => setEditing(false)} onSaved={() => router.refresh()} />
    </div>
  );
}

const EDIT_FIELDS = [
  ["name", "Name"], ["email", "Email"], ["whatsapp", "WhatsApp"],
  ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
  ["category", "Category"], ["subcategory", "Subcategory"],
  ["budget", "Budget (₹)"], ["price", "Price (₹)"],
];

function EditLeadModal({ lead, open, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(EDIT_FIELDS.map(([k]) => [k, lead[k] ?? ""]).concat([["requirement", lead.requirement ?? ""]]))
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const payload = {};
    for (const [k, v] of Object.entries(form)) {
      payload[k] = v === "" ? (["budget", "price"].includes(k) ? null : "") : v;
    }
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) return setErr(body.message || "Could not save");
    onClose();
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit lead">
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {EDIT_FIELDS.map(([k, label]) => (
            <Field key={k} label={label}>
              <Input
                type={["budget", "price"].includes(k) ? "number" : "text"}
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            </Field>
          ))}
        </div>
        <Field label="Requirement">
          <textarea
            className="min-h-[70px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-ring"
            value={form.requirement}
            onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
          />
        </Field>
        {err ? <p className="text-sm text-danger">{err}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </Modal>
  );
}
