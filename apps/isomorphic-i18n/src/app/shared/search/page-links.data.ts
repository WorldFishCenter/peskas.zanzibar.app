import { routes } from '@/config/routes';

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  // label start
  {
    name: 'Dashboard',
  },
  // label end
  {
    name: 'Home',
    href: routes.home,
  },
  {
    name: 'Catch',
    href: routes.catch,
  },
  {
    name: 'Revenue',
    href: routes.revenue,
  },
  {
    name: 'Catch Composition',
    href: routes.catch_composition,
  },
  {
    name: 'About',
    href: routes.about,
  },
];
