import {
  PiSquaresFourDuotone,
  PiChartLineUpDuotone,
  PiEnvelopeSimpleOpenDuotone,
  PiFolders,
} from 'react-icons/pi';
import { routes } from '@/config/routes';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'sidebar-menu-overview',
  },
  // label end
  {
    name: 'sidebar-menu-file-manager',
    href: '/',
    icon: PiFolders,
    shortcut: {
      modifiers: 'alt',
      key: '1',
    },
  },

  // label start
  {
    name: 'sidebar-menu-widgets',
  },
  // label end
  {
    name: 'sidebar-menu-cards',
    href: routes.widgets.cards,
    icon: PiSquaresFourDuotone,
  },
  {
    name: 'sidebar-menu-charts',
    href: routes.widgets.charts,
    icon: PiChartLineUpDuotone,
  },
  // label start
  {
    name: 'sidebar-menu-forms',
  },
  // label end
  {
    name: 'sidebar-menu-newsletter',
    href: routes.forms.newsletter,
    icon: PiEnvelopeSimpleOpenDuotone,
  },
];
