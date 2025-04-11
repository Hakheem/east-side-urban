// authServices.js
const axios = require('axios'); // We'll use axios to make HTTP requests
const { OAuth2Client } = require('google-auth-library'); // Google OAuth client
const jwt = require('jsonwebtoken'); // For generating JWT tokens

// Replace with your actual credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
const APPLE_CLIENT_ID = 'YOUR_APPLE_CLIENT_ID';
 
// Google OAuth2 Client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// **Google Token Verification**
async function verifyGoogleToken(token) {
  try {
    // Verifying the token sent from the frontend using Google's OAuth API
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID, // Ensure the audience matches your Google Client ID
    });
    
    // Return user info (from the payload) if token is valid
    const payload = ticket.getPayload();
    return payload; // Contains user information like email, name, etc.
  } catch (error) {
    throw new Error('Google token verification failed');
  }
}

// **GitHub Token Verification**
async function verifyGitHubToken(token) {
  try {
    // GitHub uses OAuth tokens that need to be validated via GitHub's API
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Return user info from GitHub's API if token is valid
    return response.data;
  } catch (error) {
    throw new Error('GitHub token verification failed');
  }
}

// **Apple Token Verification**
async function verifyAppleToken(token) {
  try {
    // Apple uses a different approach, so we need to verify the token with their API
    const response = await axios.post(
      'https://appleid.apple.com/auth/token', 
      {
        code: token,  // Token received from frontend (authorization code)
        client_id: APPLE_CLIENT_ID,
        client_secret: 'YOUR_APPLE_CLIENT_SECRET',  // Apple client secret
        grant_type: 'authorization_code',
      }
    );
    
    // Return user info from Apple's API if token is valid
    return response.data;
  } catch (error) {
    throw new Error('Apple token verification failed');
  }
}

// **JWT Token Creation**
function createJwtToken(user) {
  // Create a JWT token for the user (after verifying their OAuth token)
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    'YOUR_SECRET_KEY',  // Secret key to sign the JWT
    { expiresIn: '1h' } // Set an expiration for the token
  );
  return token;
}

// Export functions to be used in the routes or controllers
module.exports = {
  verifyGoogleToken,
  verifyGitHubToken,
  verifyAppleToken,
  createJwtToken,
};
