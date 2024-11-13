import { AppleLogin } from '@react-oauth/apple';

const AppleSignIn = () => {
  const handleAppleSuccess = (response) => {
    console.log('Apple login successful', response);
    // Send the response credential to your backend server for verification
  };

  const handleAppleFailure = (error) => {
    console.error('Apple login failed', error);
  };

  return (
    <AppleLogin 
      clientId="YOUR_APPLE_CLIENT_ID" 
      redirectURI="YOUR_REDIRECT_URI" 
      responseMode="form_post"
      onSuccess={handleAppleSuccess} 
      onError={handleAppleFailure} 
    />
  );
};

export default AppleSignIn;
