"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Label } from "@/components/ui/Input";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";

const EMPTY = {
  name: "", phone: "", email: "", whatsapp: "",
  city: "", state: "", country: "India", pincode: "",
  category: "", subcategory: "", requirement: "", budget: "",
  source: "manual",
};

const MANUAL_SOURCES = ["manual", "website", "landing_page", "api"];

function FieldRow({ label, required, hint, error, children }) {
  return (
    <div>
      <Label>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function AddLeadButton({ categories = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function reset() {
    setForm(EMPTY);
    setError(null);
    setFieldErrors({});
    setDone(null);
  }

  function close() {
    setOpen(false);
    // let the modal animate out before clearing
    setTimeout(reset, 150);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    setBusy(false);

    if (!body.success) {
      if (res.status === 422 && body.error?.fieldErrors) {
        const fe = {};
        for (const [k, v] of Object.entries(body.error.fieldErrors)) fe[k] = v[0];
        setFieldErrors(fe);
        setError("Please fix the highlighted fields.");
      } else {
        setError(body.message || "Could not create the lead");
      }
      return;
    }

    setDone(body.data);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add lead
      </Button>

      <Modal
        open={open}
        onClose={close}
        size="lg"
        title="Add a lead"
        description={done ? undefined : "Manually enter a lead. It is scored and duplicate-checked automatically."}
        footer={
          done ? (
            <>
              <Button variant="outline" onClick={close}>Close</Button>
              <Button onClick={reset}>Add another</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={busy}>Cancel</Button>
              <Button type="submit" form="add-lead-form" disabled={busy}>
                {busy ? "Saving…" : "Create lead"}
              </Button>
            </>
          )
        }
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <div>
              <p className="font-medium">
                {done.duplicate ? "Lead saved — flagged as a possible duplicate" : "Lead created"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: <span className="capitalize">{done.status}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/leads/${done.id}`)}
            >
              Open lead
            </Button>
          </div>
        ) : (
          <form id="add-lead-form" onSubmit={submit} className="space-y-5">
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FieldRow label="Name" error={fieldErrors.name}>
                  <Input value={form.name} onChange={set("name")} autoFocus placeholder="Full name" />
                </FieldRow>
                <FieldRow label="Phone" required hint="10-digit or +country code" error={fieldErrors.phone}>
                  <Input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="98765 43210" />
                </FieldRow>
                <FieldRow label="Email" error={fieldErrors.email}>
                  <Input type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" />
                </FieldRow>
                <FieldRow label="WhatsApp" hint="Leave blank to reuse the phone number" error={fieldErrors.whatsapp}>
                  <Input value={form.whatsapp} onChange={set("whatsapp")} inputMode="tel" />
                </FieldRow>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FieldRow label="City"><Input value={form.city} onChange={set("city")} /></FieldRow>
                <FieldRow label="State"><Input value={form.state} onChange={set("state")} /></FieldRow>
                <FieldRow label="Country"><Input value={form.country} onChange={set("country")} /></FieldRow>
                <FieldRow label="Pincode"><Input value={form.pincode} onChange={set("pincode")} inputMode="numeric" /></FieldRow>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requirement</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FieldRow label="Category">
                  <Input list="lead-categories" value={form.category} onChange={set("category")} placeholder="e.g. Interior Design" />
                  <datalist id="lead-categories">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </FieldRow>
                <FieldRow label="Subcategory">
                  <Input value={form.subcategory} onChange={set("subcategory")} />
                </FieldRow>
                <FieldRow label="Budget (₹)" error={fieldErrors.budget}>
                  <Input type="number" min="0" value={form.budget} onChange={set("budget")} placeholder="250000" />
                </FieldRow>
              </div>
              <FieldRow label="Details" error={fieldErrors.requirement}>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-ring"
                  value={form.requirement}
                  onChange={set("requirement")}
                  placeholder="What does the lead need?"
                />
              </FieldRow>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</p>
              <FieldRow label="Where did this lead come from?">
                <Select value={form.source} onChange={set("source")} className="sm:w-56">
                  {MANUAL_SOURCES.map((s) => (
                    <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
                  ))}
                </Select>
              </FieldRow>
            </section>

            {error ? (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              A phone number or email is required.
            </p>
          </form>
        )}
      </Modal>
    </>
  );
}
