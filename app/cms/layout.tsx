import AppShell from '@/components/app-shell';

export default function CMSLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell title="Tango CMS">{children}</AppShell>;
}
