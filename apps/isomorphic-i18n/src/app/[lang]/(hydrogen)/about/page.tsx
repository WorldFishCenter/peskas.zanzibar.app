"use client";

import { Title, Text } from 'rizzui';
import { useTranslation } from '@/app/i18n/client';
import PageHeader from '@/app/shared/page-header';
import cn from '@utils/class-names';

const pageHeader = (t: (key: string) => string) => ({
  title: t('about-title'),
  breadcrumb: [
    {
      href: '/',
      name: t('text-home'),
    },
    {
      name: t('nav-about'),
    },
  ],
});

function SectionBlock({
  title,
  children,
  className,
}: React.PropsWithChildren<{
  title: string;
  className?: string;
}>) {
  return (
    <section className={cn('mb-6 sm:mb-8 last:mb-0', className)}>
      <Title as="h3" className="mb-3 text-lg sm:mb-4 sm:text-xl font-semibold lg:text-2xl">
        {title}
      </Title>
      {children}
    </section>
  );
}

export default function AboutPage({
  params: { lang = 'en' },
}: {
  params: { lang?: string };
}) {
  const { t } = useTranslation(lang, 'common');
  const header = pageHeader(t);

  return (
    <>
      <PageHeader title={header.title} breadcrumb={header.breadcrumb} />
      <div className="@container px-4 sm:px-6">
        <div className="mx-auto max-w-[1200px] space-y-6 py-4 sm:space-y-8 md:space-y-10 md:py-6">
          <div className="prose mx-auto max-w-full dark:prose-invert sm:prose-lg lg:prose-lg">
            <Text className="mb-6 text-base sm:mb-8 sm:text-lg leading-loose text-gray-600 lg:text-xl">
              {t('about-intro')}
            </Text>

            <SectionBlock title={t('about-purpose-title')}>
              <Text className="text-gray-600">
                {t('about-purpose-body')}
              </Text>
            </SectionBlock>

            <SectionBlock title={t('about-data-title')}>
              <div className="space-y-6">
                <div>
                  <Title as="h4" className="mb-2 text-lg font-medium">
                    {t('about-data-catch-title')}
                  </Title>
                  <Text className="text-gray-600">
                    {t('about-data-catch-body')}
                  </Text>
                </div>

                <div>
                  <Title as="h4" className="mb-2 text-lg font-medium">
                    {t('about-data-economic-title')}
                  </Title>
                  <Text className="text-gray-600">
                    {t('about-data-economic-body')}
                  </Text>
                  <ul className="mt-2 list-inside list-disc text-gray-600">
                    <li>{t('about-data-economic-item-revenue')}</li>
                    <li>{t('about-data-economic-item-costs')}</li>
                    <li>{t('about-data-economic-item-market')}</li>
                    <li>{t('about-data-economic-item-indicators')}</li>
                  </ul>
                </div>

                <div>
                  <Title as="h4" className="mb-2 text-lg font-medium">
                    {t('about-data-community-title')}
                  </Title>
                  <Text className="text-gray-600">
                    {t('about-data-community-body')}
                  </Text>
                  <ul className="mt-2 list-inside list-disc text-gray-600">
                    <li>{t('about-data-community-item-performance')}</li>
                    <li>{t('about-data-community-item-patterns')}</li>
                    <li>{t('about-data-community-item-strategies')}</li>
                    <li>{t('about-data-community-item-compare')}</li>
                  </ul>
                </div>

                <div>
                  <Title as="h4" className="mb-2 text-lg font-medium">
                    {t('about-data-sustainability-title')}
                  </Title>
                  <Text className="text-gray-600">
                    {t('about-data-sustainability-body')}
                  </Text>
                  <ul className="mt-2 list-inside list-disc text-gray-600">
                    <li>{t('about-data-sustainability-item-thresholds')}</li>
                    <li>{t('about-data-sustainability-item-trends')}</li>
                    <li>{t('about-data-sustainability-item-ecosystem')}</li>
                    <li>{t('about-data-sustainability-item-practices')}</li>
                  </ul>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title={t('about-implementation-title')}>
              <Text className="text-gray-600">
                {t('about-implementation-body')}
              </Text>
            </SectionBlock>

            <SectionBlock title={t('about-knowledge-title')}>
              <Text className="text-gray-600">
                {t('about-knowledge-body')}
              </Text>
            </SectionBlock>

            <SectionBlock title={t('about-vision-title')}>
              <Text className="text-gray-600">
                {t('about-vision-body')}
              </Text>
              <ul className="mt-2 list-inside list-disc text-gray-600">
                <li>{t('about-vision-item-decisions')}</li>
                <li>{t('about-vision-item-economy')}</li>
                <li>{t('about-vision-item-ecosystems')}</li>
                <li>{t('about-vision-item-transparency')}</li>
                <li>{t('about-vision-item-capacity')}</li>
              </ul>
              <Text className="mt-4 text-gray-600">
                {t('about-vision-conclusion')}
              </Text>
            </SectionBlock>
          </div>
        </div>
      </div>
    </>
  );
} 