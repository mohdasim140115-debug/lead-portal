import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/States";

// Temporary landing for sections scheduled in a later build phase.
export function Placeholder({ title, phase }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={Rocket}
        title={`${title} is coming in ${phase}`}
        description="The navigation and access control for this section are wired up. The full workflow lands in an upcoming phase."
      />
    </>
  );
}
