import { cn } from "@/lib/utils";

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
      {children}
    </thead>
  );
}

export function Th({ children, className }) {
  return <th className={cn("whitespace-nowrap px-4 py-2.5 font-medium", className)}>{children}</th>;
}

export function Td({ children, className }) {
  return <td className={cn("whitespace-nowrap px-4 py-3", className)}>{children}</td>;
}

export function Tr({ children, className }) {
  return <tr className={cn("border-b border-border last:border-0 hover:bg-muted/30", className)}>{children}</tr>;
}
