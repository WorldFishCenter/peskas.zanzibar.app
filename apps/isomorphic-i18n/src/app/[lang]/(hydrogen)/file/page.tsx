'use client';
import { use } from "react";

import FileDashboard from '@/app/shared/file/dashboard';

export default function File(
  props: {
    params: Promise<{
      lang: string;
    }>;
  }
) {
  const params = use(props.params);

  const {
    lang
  } = params;

  return <FileDashboard lang={lang} />;
}
