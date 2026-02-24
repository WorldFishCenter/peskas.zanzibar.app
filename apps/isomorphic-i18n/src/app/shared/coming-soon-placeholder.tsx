"use client";

import { useTranslation } from "@/app/i18n/client";

export default function ComingSoonPlaceholder({ lang }: { lang?: string }) {
  const { t } = useTranslation(lang ?? "en", "common");

  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/30">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {t("text-coming-soon")}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("text-feature-under-development")}
        </p>
      </div>
    </div>
  );
}
