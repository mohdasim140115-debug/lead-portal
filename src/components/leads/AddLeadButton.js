"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Field } from "@/components/ui/Input";

const empty = {
  name: "", phone: "", email: "", whatsapp: "",
  city: "", state: "", pincode: "",
  category: "", subcategory: "", requirement: "", budget: "",
  source: "manual",
};

export function AddLeadButton({ categories = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) {
      setError(body.message || "Could not create the lead");
      return;
    }
    setOpen(false);
    setForm(empty);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add lead
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add a lead">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input value={form.name} onChange={set("name")} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={set("phone")} placeholder="10-digit or +country" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} /></Field>
            <Field label="WhatsApp"><Input value={form.whatsapp} onChange={set("whatsapp")} /></Field>
            <Field label="City"><Input value={form.city} onChange={set("city")} /></Field>
            <Field label="State"><Input value={form.state} onChange={set("state")} /></Field>
            <Field label="Category">
              <Input list="lead-categories" value={form.category} onChange={set("category")} />
              <datalist id="lead-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label="Budget (₹)"><Input type="number" min="0" value={form.budget} onChange={set("budget")} /></Field>
          </div>
          <Field label="Requirement">
            <textarea
              className="min-h-[70px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-ring"
              value={form.requirement}
              onChange={set("requirement")}
            />
          </Field>
          <Field label="Source">
            <Select value={form.source} onChange={set("source")}>
              <option value="manual">Manual</option>
              <option value="website">Website</option>
              <option value="landing_page">Landing Page</option>
              <option value="api">API</option>
            </Select>
          </Field>
          <p className="text-xs text-muted-foreground">
            A phone or email is required. The lead is scored and duplicate-checked automatically.
          </p>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create lead"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
