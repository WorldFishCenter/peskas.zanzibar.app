import TeamSettingsView from '@/app/shared/account-settings/team-settings';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Team'),
};

export default async function ProfileSettingsFormPage(
  props: {
    params: Promise<{
      lang: string;
    }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  return <TeamSettingsView />;
}
