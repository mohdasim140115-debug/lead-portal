"use client";

import { Pagination } from "@/components/ui/Pagination";
import { useQueryParams } from "@/lib/hooks/useQueryParams";

export function LeadPagination(props) {
  const { setParams } = useQueryParams();
  return <Pagination {...props} onPage={(p) => setParams({ page: p })} />;
}
