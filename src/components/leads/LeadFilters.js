"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useQueryParams } from "@/lib/hooks/useQueryParams";
import { useDebounced } from "@/lib/hooks/useDebounced";
import {
  LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, LEAD_QUALITY,
} from "@/lib/constants";

export function LeadFilters({ categories }) {
  const { searchParams, setParams } = useQueryParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const debouncedQ = useDebounced(q, 350);

  useEffect(() => {
    if ((debouncedQ || "") !== (searchParams.get("q") || "")) {
      setParams({ q: debouncedQ || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const get = (k) => searchParams.get(k) || "";
  const activeCount = ["status", "source", "category", "quality", "from", "to"].filter((k) =>
    searchParams.get(k)
  ).length;

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3">
      <div className="min-w-[200px] flex-1">
        <Input
          placeholder="Search name, phone, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Select value={get("status")} onChange={(e) => setParams({ status: e.target.value || null })} className="w-auto">
        <option value="">All statuses</option>
        {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </Select>

      <Select value={get("source")} onChange={(e) => setParams({ source: e.target.value || null })} className="w-auto">
        <option value="">All sources</option>
        {Object.entries(LEAD_SOURCE_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </Select>

      <Select value={get("category")} onChange={(e) => setParams({ category: e.target.value || null })} className="w-auto">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>

      <Select value={get("quality")} onChange={(e) => setParams({ quality: e.target.value || null })} className="w-auto">
        <option value="">Any quality</option>
        {Object.values(LEAD_QUALITY).map((v) => (
          <option key={v} value={v} className="capitalize">{v}</option>
        ))}
      </Select>

      <Input type="date" value={get("from")} onChange={(e) => setParams({ from: e.target.value || null })} className="w-auto" aria-label="From date" />
      <Input type="date" value={get("to")} onChange={(e) => setParams({ to: e.target.value || null })} className="w-auto" aria-label="To date" />

      {activeCount > 0 || q ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ("");
            setParams({ status: null, source: null, category: null, quality: null, from: null, to: null, q: null });
          }}
        >
          <X className="h-4 w-4" /> Clear
        </Button>
      ) : null}
    </div>
  );
}
