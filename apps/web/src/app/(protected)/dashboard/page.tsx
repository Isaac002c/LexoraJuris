import { BriefcaseBusiness, CalendarClock, CircleDollarSign, ClipboardList, FileWarning, Scale, TrendingDown, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchData, type Lookups } from "@/lib/page-data";
import { getCurrentUser } from "@/lib/server-api";
import { formatMoney } from "@/lib/format";

interface Dashboard { clients: number; attendances: number; activeCases: number; upcomingDeadlines: number; pendingDocuments: number; openContracts: number | null; overdueInstallments: number | null; delinquentInstallments: number | null; estimatedRevenue: string | null }

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const suffix = new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString();
  const [data, lookups, user] = await Promise.all([fetchData<Dashboard>(`/v1/dashboard${suffix ? `?${suffix}` : ""}`), fetchData<Lookups>("/v1/lookups"), getCurrentUser()]);
  const can = (permission: string) => user?.permissions.includes(permission) ?? false;
  // Cada card declara a permissão necessária e só é exibido se o usuário a tiver,
  // mantendo o painel coerente com o menu e evitando links que levariam a 403.
  const cards = ([
    ["Clientes cadastrados", data.clients, Users, "/clientes?status=ACTIVE", "client.read"],
    ["Atendimentos no mês", data.attendances, ClipboardList, "/atendimentos", "attendance.read"],
    ["Processos ativos", data.activeCases, BriefcaseBusiness, "/processos", "case.read"],
    ["Prazos próximos", data.upcomingDeadlines, CalendarClock, "/prazos?view=next7", "deadline.read"],
    ["Documentos pendentes", data.pendingDocuments, FileWarning, "/documentos?status=PENDING", "document.read"],
    ["Contratos em aberto", data.openContracts, Scale, "/financeiro/contratos", "finance.read"],
    ["Parcelas vencidas", data.overdueInstallments, CircleDollarSign, "/financeiro/parcelas?view=overdue", "finance.read"],
    ["Inadimplentes +15 dias", data.delinquentInstallments, TrendingDown, "/financeiro/inadimplencia", "finance.read"],
  ] as const).filter(([, , , , permission]) => can(permission));
  return <><PageHeader eyebrow="Visão geral" title="Dashboard" description="Indicadores atualizados dentro do seu escopo de acesso." />
    <SearchForm><select name="branchId" defaultValue={query.branchId} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Todas as filiais</option>{lookups.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select name="legalAreaId" defaultValue={query.legalAreaId} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Todas as áreas</option>{lookups.legalAreas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></SearchForm>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, href]) => <Link key={label} href={href}><Card className="h-full transition-colors hover:border-primary/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="h-4 w-4 text-cyan-500" /></CardHeader><CardContent><p className="text-3xl font-semibold">{value}</p></CardContent></Card></Link>)}</div>
    {can("finance.read") && <Link href="/financeiro"><Card className="mt-4 border-cyan-500/20 bg-cyan-500/[0.04] transition-colors hover:border-primary/50"><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">Honorários contratados</p><p className="mt-1 text-2xl font-semibold">{formatMoney(data.estimatedRevenue)}</p></div><CircleDollarSign className="h-8 w-8 text-cyan-500" /></CardContent></Card></Link>}
  </>;
}
