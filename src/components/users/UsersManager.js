"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Field } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { STAFF_ROLES, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const empty = { name: "", email: "", password: "", role: "lead_manager" };

export function UsersManager({ initial, currentUserId }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial.items);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function openCreate() {
    setForm(empty);
    setError(null);
    setCreating(true);
  }
  function openEdit(u) {
    setForm({ name: u.name, role: u.role, status: u.status, password: "" });
    setError(null);
    setEditing(u);
  }

  async function submitCreate(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) return setError(body.message || "Failed to create user");
    setCreating(false);
    router.refresh();
  }

  async function submitEdit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = { name: form.name, role: form.role, status: form.status };
    if (form.password) payload.password = form.password;
    const res = await fetch(`/api/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) return setError(body.message || "Failed to update user");
    setRows((r) => r.map((u) => (u.id === editing.id ? { ...u, ...body.data.user } : u)));
    setEditing(null);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No staff users yet" description="Add your first team member to get started." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last login</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <tbody>
            {rows.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium">
                  {u.name}
                  {u.id === currentUserId ? (
                    <Badge tone="info" className="ml-2">You</Badge>
                  ) : null}
                </Td>
                <Td className="text-muted-foreground">{u.email}</Td>
                <Td>{ROLE_LABELS[u.role] || u.role}</Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td className="text-muted-foreground">{u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}</Td>
                <Td className="text-right">
                  <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Add user">
        <form onSubmit={submitCreate} className="space-y-3">
          <Field label="Full name">
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Temporary password" hint="At least 10 characters. The user should change it after signing in.">
            <Input type="text" required minLength={10} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create user"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name || ""}`}>
        <form onSubmit={submitEdit} className="space-y-3">
          <Field label="Full name">
            <Input required value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Role">
            <Select
              value={form.role}
              disabled={editing?.id === currentUserId}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              disabled={editing?.id === currentUserId}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
          </Field>
          <Field label="Reset password" hint="Leave blank to keep the current password. Setting it signs the user out everywhere.">
            <Input type="text" minLength={10} value={form.password || ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
