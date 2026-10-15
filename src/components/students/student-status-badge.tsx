import { Badge } from "@/components/ui/badge";
import type { StudentStatus } from "@/lib/contracts/students";

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "outline"}>
      {status === "ACTIVE" ? "Ativo" : "Inativo"}
    </Badge>
  );
}
