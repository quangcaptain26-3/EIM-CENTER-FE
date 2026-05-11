import { useMemo } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import {
  SIDEBAR_GROUP_LABELS,
  SIDEBAR_GROUP_ORDER,
  SIDEBAR_MENU_ITEMS,
  type SidebarGroupId,
  type SidebarMenuItem,
} from '@/presentation/layouts/sidebar-menu.config';

export type SidebarMenuEntry = SidebarMenuItem;

export function useSidebarMenu(): SidebarMenuEntry[] {
  const role = useAppSelector((s) => s.auth.user?.role);

  return useMemo(() => {
    if (!role) return [];
    return SIDEBAR_MENU_ITEMS.filter((item) => item.requiredRoles.includes(role));
  }, [role]);
}

export interface SidebarMenuGroup {
  id: SidebarGroupId;
  label: string;
  items: SidebarMenuItem[];
}

/** Menu đã lọc RBAC, gom theo nhóm (bỏ nhóm rỗng). */
export function useSidebarMenuGrouped(): SidebarMenuGroup[] {
  const flat = useSidebarMenu();

  return useMemo(() => {
    return SIDEBAR_GROUP_ORDER.map((id) => ({
      id,
      label: SIDEBAR_GROUP_LABELS[id],
      items: flat.filter((item) => item.group === id),
    })).filter((g) => g.items.length > 0);
  }, [flat]);
}
