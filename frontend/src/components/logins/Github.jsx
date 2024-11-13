import React from 'react';
import GitHubLogin from 'react-github-login';

const GitHubSignIn = () => {
  const handleGitHubSuccess = (response) => {
    console.log('GitHub login successful', response);
    // Send the response credential to your backend server for verification
  };

  const handleGitHubFailure = (error) => {
    console.error('GitHub login failed', error);
  };

  return (
    <GitHubLogin 
      clientId="YOUR_GITHUB_CLIENT_ID" 
      onSuccess={handleGitHubSuccess} 
      onFailure={handleGitHubFailure}
      redirectUri="YOUR_REDIRECT_URI" 
    />
  );
};

export default GitHubSignIn;
