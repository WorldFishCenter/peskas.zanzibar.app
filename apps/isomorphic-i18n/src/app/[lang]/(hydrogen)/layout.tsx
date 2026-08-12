'use client';
import { use } from "react";
import { LAYOUT_OPTIONS } from '@/config/enums';
import { useLayout } from '@/layouts/use-layout';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import LithiumLayout from '@/layouts/lithium/lithium-layout';

import { useIsMounted } from '@hooks/use-is-mounted';

export default function DefaultLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{
      lang: string;
    }>;
  }
) {
  const params = use(props.params);

  const {
    lang
  } = params;

  const {
    children
  } = props;

  const { layout } = useLayout();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  if (layout === LAYOUT_OPTIONS.HYDROGEN) {
    return <HydrogenLayout lang={lang}>{children}</HydrogenLayout>;
  }

  return <LithiumLayout lang={lang}>{children}</LithiumLayout>;
}
