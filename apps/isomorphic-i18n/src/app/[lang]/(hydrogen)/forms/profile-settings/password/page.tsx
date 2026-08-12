import PasswordSettingsView from '@/app/shared/account-settings/password-settings';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Password'),
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

  return (
    <PasswordSettingsView
      settings={{
        currentPassword: '9876543210',
        newPassword: '',
        confirmedPassword: '',
      }}
    />
  );
}
