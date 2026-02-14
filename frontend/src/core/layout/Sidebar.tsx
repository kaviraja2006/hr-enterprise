import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navigation, type NavItem } from '../../config/navigation';
import { useAuthContext } from '../auth/auth-context';
import { cn } from '../../shared/utils/cn';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { hasAnyPermission } = useAuthContext();

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const filterNavByPermissions = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        return hasAnyPermission(item.requiredPermissions);
      }
      return true;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isActive = location.pathname === item.path;
    const isChildActive = item.children?.some((child) =>
      location.pathname.startsWith(child.path)
    );

    return (
      <div key={item.path}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.path)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              (isActive || isChildActive)
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </div>
            {!collapsed && (
              <svg
                className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  )
                }
              >
                {child.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredNav = filterNavByPermissions(navigation);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <span className="text-xl font-bold text-primary">HR Enterprise</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNav.map(renderNavItem)}
        </nav>
      </div>
    </aside>
  );
}