"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { parseCsv, autoMap, IMPORT_FIELDS } from "@/lib/leads/csv";
import { formatNumber } from "@/lib/utils";

const FIELD_LABELS = {
  "": "— ignore —",
  name: "Name", phone: "Phone", email: "Email", whatsapp: "WhatsApp",
  city: "City", state: "State", country: "Country", pincode: "Pincode",
  category: "Category", subcategory: "Subcategory", requirement: "Requirement",
  budget: "Budget", utmSource: "UTM source", utmMedium: "UTM medium",
  utmCampaign: "UTM campaign", campaign: "Campaign",
};

export function CsvImporter() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState([]);
  const [sample, setSample] = useState([]);
  const [mapping, setMapping] = useState({});
  const [dryRun, setDryRun] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setDryRun(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const { headers, rows } = parseCsv(text);
      if (!headers.length) {
        setError("Couldn't read a header row from that file.");
        return;
      }
      setCsvText(text);
      setHeaders(headers);
      setSample(rows.slice(0, 5));
      setMapping(autoMap(headers));
    };
    reader.readAsText(file);
  }

  const mappedFields = Object.values(mapping);
  const hasContact = mappedFields.includes("phone") || mappedFields.includes("email");

  async function run(mode) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvText, mapping: stringKeys(mapping), mode }),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.success) {
      setError(body.message || "Import failed");
      return;
    }
    if (mode === "dry_run") setDryRun(body.data);
    else {
      setResult(body.data);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center hover:bg-muted/40">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">{headers.length ? "Choose a different CSV" : "Choose a CSV file"}</span>
            <span className="text-xs text-muted-foreground">Up to 5,000 rows. First row must be column headers.</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          </label>
        </CardBody>
      </Card>

      {headers.length > 0 && !result ? (
        <Card>
          <CardHeader><CardTitle>Map columns</CardTitle></CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr><Th>CSV column</Th><Th>Sample</Th><Th>Maps to</Th></Tr>
                </Thead>
                <tbody>
                  {headers.map((h, idx) => (
                    <Tr key={idx}>
                      <Td className="font-medium">{h || <span className="text-muted-foreground">column {idx + 1}</span>}</Td>
                      <Td className="max-w-[220px] truncate text-muted-foreground">{sample.map((r) => r[idx]).find(Boolean) || "—"}</Td>
                      <Td>
                        <Select
                          value={mapping[idx] || ""}
                          onChange={(e) => setMapping((m) => ({ ...m, [idx]: e.target.value }))}
                          className="w-48"
                        >
                          {["", ...IMPORT_FIELDS].map((f) => (
                            <option key={f} value={f}>{FIELD_LABELS[f] || f}</option>
                          ))}
                        </Select>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {!hasContact ? (
              <p className="mt-3 text-sm text-warning">Map at least a <b>Phone</b> or <b>Email</b> column to continue.</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button onClick={() => run("dry_run")} disabled={!hasContact || busy} variant="outline">
                {busy ? "Checking…" : "Preview import"}
              </Button>
              {dryRun ? (
                <Button onClick={() => run("commit")} disabled={busy}>
                  {busy ? "Importing…" : `Import ${formatNumber(dryRun.valid)} leads`}
                </Button>
              ) : null}
            </div>
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          </CardBody>
        </Card>
      ) : null}

      {dryRun && !result ? (
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardBody>
            <div className="mb-4 flex gap-6 text-sm">
              <Stat label="Total rows" value={dryRun.totalRows} />
              <Stat label="Will import" value={dryRun.valid} tone="success" />
              <Stat label="Duplicates (flagged)" value={dryRun.duplicates} tone="warning" />
              <Stat label="Skipped (no contact)" value={dryRun.invalid} tone="danger" />
            </div>
            <Table>
              <Thead>
                <Tr><Th>Row</Th><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>City</Th><Th>Category</Th><Th>Flags</Th></Tr>
              </Thead>
              <tbody>
                {dryRun.preview.map((r) => (
                  <Tr key={r.row}>
                    <Td className="text-muted-foreground">{r.row}</Td>
                    <Td>{r.name || "—"}</Td>
                    <Td>{r.phone || "—"}</Td>
                    <Td>{r.email || "—"}</Td>
                    <Td>{r.city || "—"}</Td>
                    <Td>{r.category || "—"}</Td>
                    <Td>
                      {r.issues.length ? <Badge tone="danger">{r.issues.join(", ")}</Badge> : r.duplicate ? <Badge tone="warning">duplicate</Badge> : <Badge tone="success">ok</Badge>}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {dryRun.totalRows > dryRun.preview.length ? (
              <p className="mt-2 text-xs text-muted-foreground">Showing first {dryRun.preview.length} rows.</p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Import complete</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Stat label="Created" value={result.created} tone="success" />
              <Stat label="Duplicates flagged" value={result.duplicates} tone="warning" />
              <Stat label="Skipped" value={result.skipped} />
              <Stat label="Errors" value={result.errors.length} tone={result.errors.length ? "danger" : "neutral"} />
            </div>
            {result.errors.length ? (
              <div className="rounded-md bg-danger/5 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 font-medium text-danger">
                  <AlertTriangle className="h-4 w-4" /> Some rows failed
                </p>
                <ul className="text-muted-foreground">
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => { setHeaders([]); setCsvText(""); setDryRun(null); setResult(null); }}>
              Import another file
            </Button>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone = "neutral" }) {
  const c = { neutral: "", success: "text-success", warning: "text-warning", danger: "text-danger" }[tone];
  return (
    <div>
      <p className={`text-lg font-semibold ${c}`}>{formatNumber(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function stringKeys(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v) out[String(k)] = v;
  return out;
}
