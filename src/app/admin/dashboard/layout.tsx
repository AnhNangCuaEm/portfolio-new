import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-session';

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin');
  }

  return children;
}