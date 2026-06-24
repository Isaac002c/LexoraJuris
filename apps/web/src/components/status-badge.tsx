import { Badge } from "./ui/badge";

const danger = ["VENCIDO", "DARK_RED", "RECUSADO", "REJECTED"];
const warning = ["AGUARDANDO_DOCUMENTOS", "AGUARDANDO_CONTRATO", "AGUARDANDO_PAGAMENTO", "YELLOW", "PENDING", "PENDENTE", "A_VENCER"];
const success = ["ACTIVE", "PAGO", "PAID", "COMPLETED", "FINALIZADO", "RECEBIDO", "ANALISADO", "GREEN", "APPROVED"];
const orange = ["INADIMPLENTE_15_DIAS"];

// Rótulos legíveis para os códigos de cor de prazo (produzidos por `deadlineColor`).
// A regra do MVP exige que o vencido apareça claramente como "Vencido", e não
// apenas pela cor. Estes códigos são exclusivos do indicador de prazo, então o
// mapeamento não altera os demais badges de status.
const deadlineColorLabels: Record<string, string> = {
  GREEN: "No prazo",
  YELLOW: "Atenção",
  RED: "Crítico",
  DARK_RED: "Vencido",
  GRAY: "Encerrado",
};

export function StatusBadge({ value }: { value: string }) {
  const variant = danger.includes(value) || value === "RED" ? "danger" : orange.includes(value) ? "orange" : warning.includes(value) ? "warning" : success.includes(value) ? "success" : ["GRAY", "ARCHIVED", "ARQUIVADO", "CANCELLED"].includes(value) ? "muted" : "default";
  return <Badge variant={variant}>{deadlineColorLabels[value] ?? value.replaceAll("_", " ")}</Badge>;
}
