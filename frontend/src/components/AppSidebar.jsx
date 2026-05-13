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

const menuItems = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Doctores', path: '/doctors' },
  { title: 'Pacientes', path: '/patients' },
  { title: 'Turnos', path: '/appointments' },
  { title: 'Obras Sociales', path: '/insurance' },
  { title: 'Pagos', path: '/payments' },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open, toggleSidebar, isMobile } = useSidebar();

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
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        tooltip={item.title}
                        onClick={handleNavClick}
                      >
                        <Link to={item.path}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
