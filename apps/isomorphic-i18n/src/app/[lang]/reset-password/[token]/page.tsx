import AuthWrapperFour from '@/app/shared/auth-layout/auth-wrapper-four';
import ResetPasswordForm from './reset-password-form';

export default async function ForgotPassword(
  props: {
    params: Promise<{ lang?: string, token: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    token
  } = params;

  return (
    <AuthWrapperFour
      title={
        <>
          Reset your password.
        </>
      }
      lang={lang}
    >
      <ResetPasswordForm lang={lang} token={token}/>
    </AuthWrapperFour>
  );
}
