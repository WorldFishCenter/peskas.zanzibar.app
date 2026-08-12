import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import ProfileSettingsNav from '@/app/shared/account-settings/navigation';

const pageHeader = {
  title: 'text-account-settings',
  breadcrumb: [
    {
      href: '/',
      name: 'text-home',
    },
    {
      href: routes.forms.profileSettings,
      name: 'text-form',
    },
    {
      name: 'text-account-settings',
    },
  ],
};

export default async function ProfileSettingsLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{
      lang: string;
    }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    children
  } = props;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ProfileSettingsNav />
      {children}
    </>
  );
}
