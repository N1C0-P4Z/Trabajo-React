import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchAvatarObjectUrl, revokeAvatarObjectUrl } from '../services/avatarService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Stethoscope, Users, CalendarDays, Shield, Wallet, ShieldCheck, User, Contact } from 'lucide-react';
import DevRoleSwitcher from './DevRoleSwitcher';

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Dentistas', path: '/dentists', icon: Stethoscope },
  { title: 'Secretarias', path: '/secretaries', icon: Contact },
  { title: 'Pacientes', path: '/patients', icon: Users },
  { title: 'Agenda', path: '/appointments', icon: CalendarDays },
  { title: 'Obras Sociales', path: '/insurance', icon: Shield },
  { title: 'Pagos', path: '/payments', icon: Wallet },
];

const adminItem = { title: 'Admin', path: '/admin', icon: ShieldCheck };

const ROLE_MENU_ITEMS = {
  PATIENT: ['/dashboard', '/appointments', '/profile'],
  DENTIST: ['/dashboard', '/patients', '/appointments', '/profile'],
  SECRETARY: ['/dashboard', '/dentists', '/patients', '/appointments', '/insurance', '/payments', '/profile'],
  OWNER: ['/dashboard', '/dentists', '/secretaries', '/patients', '/appointments', '/insurance', '/payments', '/admin', '/profile'],
  SUPER_ADMIN: null,
};

const iconMap = {
  '/dashboard': LayoutDashboard,
  '/dentists': Stethoscope,
  '/secretaries': Contact,
  '/patients': Users,
  '/appointments': CalendarDays,
  '/insurance': Shield,
  '/payments': Wallet,
  '/admin': ShieldCheck,
  '/profile': User,
};

const titleMap = {
  '/dashboard': 'Dashboard',
  '/dentists': 'Dentistas',
  '/secretaries': 'Secretarias',
  '/patients': 'Pacientes',
  '/appointments': 'Agenda',
  '/insurance': 'Obras Sociales',
  '/payments': 'Pagos',
  '/admin': 'Admin',
  '/profile': 'Mi Perfil',
};

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, realUser, logout } = useAuth();
  const { open, toggleSidebar, isMobile } = useSidebar();
  const [footerAvatarUrl, setFooterAvatarUrl] = useState(null);

  const displayUser = user || realUser;

  useEffect(() => {
    let cancelled = false;
    let loadedUrl = null;

    async function loadFooterAvatar() {
      if (!displayUser?.id || !displayUser?.avatar_url) {
        setFooterAvatarUrl((prev) => {
          revokeAvatarObjectUrl(prev);
          return null;
        });
        return;
      }

      const objectUrl = await fetchAvatarObjectUrl(displayUser.id);
      if (cancelled) {
        revokeAvatarObjectUrl(objectUrl);
        return;
      }

      loadedUrl = objectUrl;
      setFooterAvatarUrl((prev) => {
        revokeAvatarObjectUrl(prev);
        return objectUrl;
      });
    }

    loadFooterAvatar();

    return () => {
      cancelled = true;
      revokeAvatarObjectUrl(loadedUrl);
    };
  }, [displayUser?.id, displayUser?.avatar_url]);

  const footerInitials = displayUser
    ? `${(displayUser.first_name || '')[0] || ''}${(displayUser.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  const visibleMenuItems = (() => {
    if (!user) return [];

    const allowedPaths = ROLE_MENU_ITEMS[user.role];
    if (allowedPaths) {
      return allowedPaths.map((path) => ({
        title: titleMap[path],
        path,
        icon: iconMap[path],
      }));
    }

    return [...menuItems, adminItem];
  })();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 h-screen
          bg-sidebar text-sidebar-foreground
          border-r border-sidebar-border
          transition-all duration-200 ease-linear
          overflow-hidden
          ${open ? 'w-72' : 'w-0'}
          ${isMobile
            ? `fixed top-0 left-0 z-50 ${open ? 'translate-x-0' : '-translate-x-full'}`
            : 'sticky top-0'
          }
        `}
      >
        <div className="flex h-full w-72 flex-col overflow-hidden">
          {/* Header */}
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Clínica Dental
              </span>
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {visibleMenuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          onClick={handleNavClick}
                          className={`py-6 text-base ${active ? '!bg-primary/10 !text-primary hover:!bg-primary/15' : ''}`}
                        >
                          <Link to={item.path}>
                            <item.icon className="size-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter>
            <div className="border-t border-sidebar-border px-4 py-3">
              <DevRoleSwitcher />
              {displayUser && (
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    {footerAvatarUrl ? (
                      <AvatarImage src={footerAvatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {footerInitials || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-sidebar-foreground truncate">
                    {displayUser.first_name} {displayUser.last_name}
                    {realUser && user?.role !== realUser.role ? ` · simulando ${user.role}` : ''}
                  </p>
                </div>
              )}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Cerrar sesión"
                  >
                    <button
                      onClick={handleLogout}
                      className="text-destructive w-full text-left"
                    >
                      Cerrar sesión
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarFooter>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;