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

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6FC]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-[#6B21A8] animate-spin" />
          <p className="text-xs font-semibold text-[#6E6280]">Verifying secure session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <LandingLoginPage onLoginSuccess={(role) => setRole(role)} />
        {/* Floating Demo Role Switcher also available on landing */}
        <DemoRoleSwitcher
          onOpenLanding={() => void logout()}
        />
        <ToastContainer />
      </div>
    );
  }

  // Render active tab in portal
  const renderActiveTabContent = () => {
    switch (activeTab) {
      // Resident
      case 'resident_home':
        return <ResidentDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'resident_visitors':
        return <VisitorsModule />;
      case 'resident_amenities':
        return <AmenitiesModule />;
      case 'resident_bookings':
        return (
          <MyBookingsModule
            onNavigateToAmenities={() => setCurrentTab('resident_amenities')}
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
        return <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
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
        return <ResidentDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col">
      {/* Sidebar for Desktop & Mobile Slide-over */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNotifications={() => setNotificationDrawerOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onLogout={() => void logout()}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          {renderActiveTabContent()}
        </main>

        {/* Mobile Bottom Navigation for Residents */}
        <MobileBottomNav
          currentTab={activeTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenMenu={() => setSidebarOpen(true)}
        />
      </div>

      {/* Global Interactive Elements */}
      <DemoRoleSwitcher onOpenLanding={() => void logout()} />
      <ToastContainer />
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
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
