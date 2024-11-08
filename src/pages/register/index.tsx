import { Head } from '@/components/layouts/head';
import { MainLayout } from '@/components/layouts/main-layout';

import { PageHeader } from '@/components/UI/PageHeader';

import {
  requestGenerateOtpAndSendSms,
  requestValidateOtp,
} from '@/services/client/otp-request-service';

import OtpStep from '@/components/register/OtpStep';
import PhoneStep from '@/components/register/PhoneStep';
import SimpleSignupFormStep from '@/components/register/SimpleSignupFormStep';
import { SimpleSignupForm } from '@/components/register/SimpleSignupFormStep/simple-signup.schema';
import SuccessfulSignUpStep from '@/components/register/SuccessfulSignUpStep';
import Snackbar, { useSnackbar } from '@/components/UI/Snackbar';
import { Container } from '@mui/material';
import { When } from '@verifiedinc-public/shared-ui-elements';
import { useRouter } from 'next/router';
import { useState } from 'react';

// Has all the steps for the registration process
// The components will be rendered according the step state
enum Steps {
  PHONE = 1,
  OTP = 2,
  FORM = 3,
  SUCCESS = 4,
}
function Register() {
  // First step is the phone number form
  const [step, setStep] = useState(Steps.PHONE);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');

  // Snackbar hook to manage snackbar messages
  const { disclosure, snackbarOptions, updateSnackbar } = useSnackbar();

  const router = useRouter();

  // Function to handle the generation of the otp code and send the sms
  // It is called when the user finishes typing the phone number
  const handleGenerateOtpAndSendSms = async (phone: string) => {
    const response = await requestGenerateOtpAndSendSms({ phone });

    if (response?.error) {
      updateSnackbar({ message: response.error, severity: 'error' });
    } else {
      const otp = response?.otp || '111111';
      updateSnackbar({
        message: `OTP code: ${otp}`,
        severity: 'info',
        position: 'right',
        onCopyClick: () => {
          navigator.clipboard.writeText(otp);
          updateSnackbar({ message: 'OTP code copied to clipboard' });
        },
      });
      setPhone(phone);
      setStep(Steps.OTP);
    }
  };

  // Function to handle the validation of the otp code
  // It is called when the user finishes typing the otp code
  const handleValidateOtp = async (otpCode: string) => {
    setIsLoading(true);
    const otpResponse = await requestValidateOtp({ otpCode, phone });
    if (otpResponse?.error) {
      updateSnackbar({
        message: `${otpResponse.error}: ${otpCode}`,
        severity: 'error',
      });
    } else {
      setStep(Steps.FORM);
    }
    setIsLoading(false);
  };

  // Function to handle the retry resend otp
  // It is called when the user clicks on the resend otp button
  const handleRetryResendOtp = (phone: string) => {
    handleGenerateOtpAndSendSms(phone);
    updateSnackbar({
      message: `SMS sent successfully`,
    });
  };

  // Function to handle the register form submit
  const handleFormSubmit = (data: SimpleSignupForm) => {
    console.log(data);
    setStep(Steps.SUCCESS);
  };

  // Function to reload the page
  const reset = () => {
    router.reload();
  };

  // This will render the components according to the step state
  return (
    <>
      <Head page='Register' />
      <PageHeader
        title='Register without 1-click'
        description='This might be Slooow'
      />
      <Container maxWidth='xs' sx={{ py: 3 }}>
        {/* This 'When' component conditionally renders it's children  */}
        <When value={step === Steps.PHONE}>
          <PhoneStep onValidPhone={handleGenerateOtpAndSendSms} />
        </When>

        <When value={step === Steps.OTP}>
          <OtpStep
            phone={phone}
            onRetryResendOtp={handleRetryResendOtp}
            onValidate={handleValidateOtp}
            isLoading={isLoading}
          />
        </When>
        <When value={step === Steps.FORM}>
          <SimpleSignupFormStep onSubmit={handleFormSubmit} />
        </When>
        <When value={step === Steps.SUCCESS}>
          <SuccessfulSignUpStep onSignOut={reset} />
        </When>
      </Container>
      <Snackbar disclosure={disclosure} snackbarOptions={snackbarOptions} />
    </>
  );
}
// This will add the layout to the page
Register.getLayout = MainLayout;

export default Register;
