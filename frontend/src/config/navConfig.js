export const NAV_CONFIG = {
  user: [
    { group: 'Main', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { group: 'Main', label: 'My Profile', path: '/profile', icon: 'UserCircle' },
    { group: 'Main', label: 'My Orders', path: '/orders', icon: 'ShoppingBag' },
    { group: 'Main', label: 'Reports', path: '/reports', icon: 'BarChart2' },
    { group: 'Support', label: 'Help Center', path: '/help', icon: 'HelpCircle' },
    { group: 'Support', label: 'Settings', path: '/settings', icon: 'Settings' },
  ],

  admin: [
    { group: 'Main', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { group: 'Main', label: 'Users', path: '/admin/users', icon: 'Users' },
    { group: 'Main', label: 'Orders', path: '/admin/orders', icon: 'ShoppingBag' },
    { group: 'Main', label: 'Analytics', path: '/admin/analytics', icon: 'TrendingUp' },
    { group: 'Manage', label: 'Products', path: '/admin/products', icon: 'Package' },
    { group: 'Manage', label: 'Support Tickets', path: '/admin/tickets', icon: 'Ticket' },
    { group: 'Manage', label: 'Roles', path: '/admin/roles', icon: 'Shield', locked: true },
    { group: 'System', label: 'Settings', path: '/settings', icon: 'Settings' },
  ],

  superadmin: [
    { group: 'Global', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { group: 'Global', label: 'All Tenants', path: '/super/tenants', icon: 'Building2' },
    { group: 'Global', label: 'System Logs', path: '/super/logs', icon: 'ScrollText' },
    { group: 'Control', label: 'Admins', path: '/super/admins', icon: 'UserCog' },
    { group: 'Control', label: 'Permissions', path: '/super/permissions', icon: 'KeyRound' },
    { group: 'Control', label: 'Billing', path: '/super/billing', icon: 'CreditCard' },
    { group: 'Control', label: 'Feature Flags', path: '/super/flags', icon: 'Flag' },
    { group: 'System', label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
}
