import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
import { LayoutDashboard, Stethoscope, Users, CalendarDays, Shield, Wallet, ShieldCheck } from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Doctores', path: '/doctors', icon: Stethoscope },
  { title: 'Pacientes', path: '/patients', icon: Users },
  { title: 'Agenda', path: '/appointments', icon: CalendarDays },
  { title: 'Obras Sociales', path: '/insurance', icon: Shield },
  { title: 'Pagos', path: '/payments', icon: Wallet },
];

const adminItem = { title: 'Admin', path: '/admin', icon: ShieldCheck };

const ADMIN_ROLES = ['SUPER_ADMIN', 'OWNER', 'SECRETARY'];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open, toggleSidebar, isMobile } = useSidebar();

  const visibleMenuItems = user && ADMIN_ROLES.includes(user.role)
    ? [...menuItems, adminItem]
    : menuItems;

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
                <SidebarMenu>
                  {visibleMenuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          onClick={handleNavClick}
                          className={active ? '!bg-primary/10 !text-primary hover:!bg-primary/15' : ''}
                        >
                          <Link to={item.path}>
                            <item.icon className="size-4" />
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
              {user && (
                <p className="text-xs text-sidebar-foreground/60 mb-2 truncate">
                  {user.first_name} {user.last_name}
                </p>
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
