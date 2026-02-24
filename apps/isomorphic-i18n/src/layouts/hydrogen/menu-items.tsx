import { routes } from '@/config/routes';
import {
  PiFishDuotone,
  PiInfoDuotone,
  PiHouseLineDuotone,
  PiCurrencyDollarDuotone,
  PiChartPieDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  {
    name: 'Home',
    href: routes.home,
    icon: <PiHouseLineDuotone />,
  },
  {
    name: 'Catch',
    href: routes.catch,
    icon: <PiFishDuotone />,
  },
  {
    name: 'Revenue',
    href: routes.revenue,
    icon: <PiCurrencyDollarDuotone />,
  },
  {
    name: 'Catch Composition',
    href: routes.catch_composition,
    icon: <PiChartPieDuotone />,
  },
  {
    name: 'About',
    href: routes.about,
    icon: <PiInfoDuotone />,
  },
];
