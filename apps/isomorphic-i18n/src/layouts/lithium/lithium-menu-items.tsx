import { routes } from '@/config/routes';

export type SubMenuItemType = {
  name: string;
  href: string;
};

export type DropdownItemType = {
  name: string;
  icon: string;
  description?: string;
  href?: string;
  subMenuItems?: SubMenuItemType[];
  badge?: 'beta' | 'soon';
};

export type LithiumMenuItem = {
  [key: string]: {
    name: string;
    type: string;
    dropdownItems: DropdownItemType[];
  };
};

export const lithiumMenuItems: LithiumMenuItem = {
  about: {
    name: 'nav-about',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-about',
        href: '/about',
        icon: 'InfoIcon',
      },
    ],
  },
  catch: {
    name: 'nav-catch',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-catch-overview',
        href: routes.catch,
        icon: 'FishIcon',
      },
    ],
  },
  revenue: {
    name: 'nav-revenue',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-revenue',
        href: routes.revenue,
        icon: 'CurrencyDollar',
      },
    ],
  },
  catch_composition: {
    name: 'nav-catch-composition',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-catch-composition',
        href: routes.catch_composition,
        icon: 'ChartPie',
        badge: 'beta' as const,
      },
    ],
  },
  ask_data: {
    name: 'nav-ask-data',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-ask-data',
        href: routes.askData,
        icon: 'ZoomQuestion',
      },
    ],
  },
  map: {
    name: 'nav-map',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-map',
        href: routes.map,
        icon: 'MapIcon',
      },
    ],
  },
  settings: {
    name: 'nav-settings',
    type: 'link',
    dropdownItems: [
      {
        name: 'nav-account-settings',
        href: routes.forms.profileSettings,
        icon: 'UserSettingsIcon',
      },
      {
        name: 'nav-notification-preference',
        href: routes.forms.notificationPreference,
        icon: 'NotificationSettingsIcon',
      },
      {
        name: 'nav-personal-information',
        href: routes.forms.personalInformation,
        icon: 'UserInfoIcon',
      },
    ],
  },
};

export type LithiumMenuItemsKeys = keyof typeof lithiumMenuItems;
