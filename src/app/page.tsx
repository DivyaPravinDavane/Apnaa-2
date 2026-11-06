'use client';

import React, { useState, useEffect } from 'react';
import { SocietyProvider, useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { NotificationDrawer } from '@/components/common/NotificationDrawer';
import { ToastContainer } from '@/components/common/ToastContainer';

// Resident Screens
import { ResidentDashboard } from '@/components/resident/ResidentDashboard';
import { CommunityPollModule } from '@/components/resident/CommunityPollModule';
import { VisitorsModule } from '@/components/resident/VisitorsModule';
import { AmenitiesModule } from '@/components/resident/AmenitiesModule';
import { MyBookingsModule } from '@/components/resident/MyBookingsModule';
import { NoticesModule } from '@/components/resident/NoticesModule';
import { EventsModule } from '@/components/resident/EventsModule';
import { MembersModule } from '@/components/resident/MembersModule';
import { GalleryModule } from '@/components/resident/GalleryModule';
import { ProfileSettingsModule } from '@/components/resident/ProfileSettingsModule';

// Admin Screens
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminResidentsModule } from '@/components/admin/AdminResidentsModule';
import { AdminAmenityManagement } from '@/components/admin/AdminAmenityManagement';
import { AdminGalleryModeration } from '@/components/admin/AdminGalleryModeration';
import { AdminAuditReports } from '@/components/admin/AdminAuditReports';

// Security & Facility Screens
import { SecurityGateTerminal } from '@/components/security/SecurityGateTerminal';
import { FacilityDashboard } from '@/components/facility/FacilityDashboard';

// Public Landing & Login Page
import { LandingLoginPage } from '@/components/public/LandingLoginPage';

function MainAppShell() {
  const { currentRole, setRole, isAuthenticated, authReady, logout } = useSociety();
  const [currentTab, setCurrentTab] = useState<string>('resident_home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Derive the visible tab so switching roles never leaves a stale screen.
  const defaultTab: Record<UserRole, string> = {
    resident: 'resident_home',
    admin: 'admin_dashboard',
    security: 'security_gate',
    facility: 'facility_dashboard',
  };
  const rolePrefix = `${currentRole}_`;
  const activeTab = currentTab.startsWith(rolePrefix) ? currentTab : defaultTab[currentRole];

  const handleSelectTab = (tab: string) => {
    if (tab === 'resident_notifications') {
      setNotificationDrawerOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  // Global Cmd+K / Ctrl+K keyboard shortcut listener for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render active tab in portal
  const renderActiveTabContent = () => {
    switch (activeTab) {
      // Resident
      case 'resident_home':
        return <ResidentDashboard onNavigate={(tab) => handleSelectTab(tab)} />;
      case 'resident_poll':
        return <CommunityPollModule onBack={() => handleSelectTab('resident_home')} />;
      case 'resident_visitors':
        return <VisitorsModule />;
      case 'resident_amenities':
        return <AmenitiesModule />;
      case 'resident_bookings':
        return (
          <MyBookingsModule
            onNavigateToAmenities={() => handleSelectTab('resident_amenities')}
          />
        );
      case 'resident_notices':
        return <NoticesModule />;
      case 'resident_events':
        return <EventsModule />;
      case 'resident_members':
        return <MembersModule />;
      case 'resident_gallery':
        return <GalleryModule />;
      case 'resident_profile':
      case 'resident_settings':
        return <ProfileSettingsModule />;

      // Admin
      case 'admin_dashboard':
        return <AdminDashboard onNavigateTab={(tab) => handleSelectTab(tab)} />;
      case 'admin_residents':
        return <AdminResidentsModule />;
      case 'admin_visitors':
        return <VisitorsModule />;
      case 'admin_amenities':
        return <AdminAmenityManagement />;
      case 'admin_bookings':
        return <MyBookingsModule />;
      case 'admin_notices':
        return <NoticesModule />;
      case 'admin_events':
        return <EventsModule />;
      case 'admin_gallery':
        return <AdminGalleryModeration />;
      case 'admin_audit':
        return <AdminAuditReports />;
      case 'admin_settings':
        return <ProfileSettingsModule />;

      // Security
      case 'security_gate':
      case 'security_scan':
      case 'security_register':
      case 'security_lookup':
      case 'security_logs':
        return <SecurityGateTerminal />;

      // Facility
      case 'facility_dashboard':
      case 'facility_schedule':
      case 'facility_verify':
      case 'facility_closures':
        return <FacilityDashboard />;

      default:
        return <ResidentDashboard onNavigate={(tab) => handleSelectTab(tab)} />;
    }
  };

  // Hide the purple curved Home banner when viewing screens with their own custom top bars
  const hideBannerHeader = activeTab === 'resident_poll' || activeTab === 'resident_profile';

  return (
    <div className="min-h-dvh w-full bg-[#F8F9FA] flex flex-col items-center">
      {/* Mobile-layout column */}
      <div className="w-full max-w-[480px] h-dvh bg-white overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="mobile-viewport relative flex-1 flex flex-col overflow-hidden bg-white">
          {!authReady ? (
            <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-9 h-9 rounded-full border-4 border-purple-200 border-t-[#0D5C63] animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Loading Apnaa Society…</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="flex-1 overflow-y-auto relative">
              <LandingLoginPage onLoginSuccess={(role) => handleSelectTab(defaultTab[role] || 'resident_home')} />
              <ToastContainer />
            </div>
          ) : (
            <>
              {/* Slide-over Mobile App Drawer */}
              <Sidebar
                currentTab={activeTab}
                onSelectTab={(tab) => handleSelectTab(tab)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />

              {/* Top Purple Curved Banner Header (shown on Home & main screens) */}
              {!hideBannerHeader && (
                <Header
                  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                  onOpenNotifications={() => setNotificationDrawerOpen(true)}
                  onOpenSearch={() => setSearchOpen(true)}
                  onNavigate={(tab) => handleSelectTab(tab)}
                  onLogout={() => void logout()}
                />
              )}

              {/* Scrollable Mobile Screen Content */}
              <main className="flex-1 overflow-y-auto bg-white px-3.5 pb-6 pt-1">
                {renderActiveTabContent()}
              </main>

              {/* Sticky Bottom Tab Bar (hidden on full-screen poll view, which has its own Filter bar) */}
              {activeTab !== 'resident_poll' && (
                <MobileBottomNav
                  currentTab={activeTab}
                  onSelectTab={(tab) => handleSelectTab(tab)}
                  onOpenMenu={() => setSidebarOpen(true)}
                  onOpenSearch={() => setSearchOpen(true)}
                  onOpenNotifications={() => setNotificationDrawerOpen(true)}
                />
              )}

              {/* Scoped Overlays inside the Mobile Screen */}
              <DemoRoleSwitcher onOpenLanding={() => void logout()} />
              <ToastContainer />
              <GlobalSearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onNavigate={(tab) => handleSelectTab(tab)}
              />
              <NotificationDrawer
                isOpen={notificationDrawerOpen}
                onClose={() => setNotificationDrawerOpen(false)}
                onNavigate={(tab) => handleSelectTab(tab)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SocietyProvider>
      <MainAppShell />
    </SocietyProvider>
  );
}
