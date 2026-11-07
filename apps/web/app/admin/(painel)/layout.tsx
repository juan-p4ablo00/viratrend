import { AdminShell } from '@/components/admin/admin-shell';

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
