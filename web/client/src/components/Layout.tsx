import { Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useApiStatus } from '@/hooks/useApiStatus';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV: readonly { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Download', end: true },
  { to: '/formats', label: 'Formats' },
  { to: '/subtitles', label: 'Subtitles' },
  { to: '/audio', label: 'Audio' },
  { to: '/network', label: 'Network' },
  { to: '/advanced', label: 'Advanced' },
  { to: '/jobs', label: 'Jobs' },
];

function ApiBadge({ reachable }: { reachable: boolean | null }) {
  if (reachable === null) {
    return (
      <Badge variant="outline" className="shrink-0 font-normal">
        API …
      </Badge>
    );
  }
  if (reachable) {
    return (
      <Badge variant="success" className="shrink-0 font-normal" title="GET /api/health">
        API connected
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="shrink-0 font-normal" title="GET /api/health">
      API offline
    </Badge>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              buttonVariants({ variant: isActive ? 'secondary' : 'ghost' }),
              'w-full justify-start no-underline hover:no-underline',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout() {
  const api = useApiStatus();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Features</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                <nav className="flex flex-col gap-1" aria-label="Sections">
                  <NavItems onNavigate={() => setMobileOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>

            <NavLink to="/" className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-bold tracking-tight">yt-dlp</span>
              <span className="text-muted-foreground truncate text-xs">Web UI</span>
            </NavLink>
          </div>
          <ApiBadge reachable={api} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r bg-card md:flex md:flex-col">
          <div className="p-3">
            <p className="text-muted-foreground px-2 pb-2 text-[0.65rem] font-medium uppercase tracking-wider">
              Features
            </p>
            <ScrollArea className="h-[calc(100dvh-8.5rem)]">
              <nav className="flex flex-col gap-1 pr-3" aria-label="Sections">
                <NavItems />
              </nav>
            </ScrollArea>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="border-t py-3 text-center text-muted-foreground text-xs md:py-4">
        Maps to yt-dlp options. Run the Python API server for previews and downloads.
      </footer>
    </div>
  );
}
