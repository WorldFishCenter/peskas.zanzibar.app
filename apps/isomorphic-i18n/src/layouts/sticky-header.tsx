'use client';

import cn from '@utils/class-names';
import { useIsMounted } from '@hooks/use-is-mounted';
import { useWindowScroll } from '@hooks/use-window-scroll';

type StickyHeaderProps = {
  className?: string;
  offset?: number;
};

export default function StickyHeader({
  offset = 2,
  className,
  children,
}: React.PropsWithChildren<StickyHeaderProps>) {
  const isMounted = useIsMounted();
  const windowScroll = useWindowScroll();
  return (
    <header
      className={cn(
        'sticky top-0 z-[9999] flex items-center bg-gray-0/80 p-4 backdrop-blur-md md:px-5 lg:px-6 transition-all duration-300',
        ((isMounted && windowScroll.y) as number) > offset ? 'shadow-sm border-b border-gray-200' : 'border-b border-transparent',
        className
      )}
    >
      {children}
    </header>
  );
}
