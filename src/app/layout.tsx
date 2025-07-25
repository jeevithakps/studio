import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ListTodo, Users, History, Sparkles, Bell, CalendarClock, CheckSquare } from 'lucide-react';

import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { HomeKeepLogo } from '@/components/icons';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'HomeKeep',
  description: 'Track and find your household items with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <HomeKeepLogo className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-semibold font-headline">HomeKeep</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" passHref>
                    <SidebarMenuButton tooltip="Dashboard">
                      <Home />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/todo" passHref>
                    <SidebarMenuButton tooltip="To-Do">
                      <CalendarClock />
                      <span>To-Do</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/checklists" passHref>
                    <SidebarMenuButton tooltip="Checklists">
                      <CheckSquare />
                      <span>Checklists</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/profiles" passHref>
                    <SidebarMenuButton tooltip="Profiles">
                      <Users />
                      <span>Profiles</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/history" passHref>
                    <SidebarMenuButton tooltip="History">
                      <History />
                      <span>History</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/predict-location" passHref>
                    <SidebarMenuButton tooltip="Predict Location">
                      <Sparkles />
                      <span>Predict Location</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/reminders" passHref>
                    <SidebarMenuButton tooltip="Reminders">
                      <Bell />
                      <span>Reminders</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
