import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if current route is an auth route
  const isAuthRoute = location.pathname.startsWith('/auth/');
  
  if (isAuthRoute) {
    // Render auth layout without sidebar
    return (
      <div className="min-h-screen">
        <PageTransition>
          <div className="page-content">
            {children}
          </div>
        </PageTransition>
      </div>
    );
  }
  
  // Render main app layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 px-4 py-6 md:px-6">
            <div className="mx-auto w-full max-w-7xl">
              <PageTransition>
                <div className="page-content">
                  {children}
                </div>
              </PageTransition>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
