import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcGoogle } from 'react-icons/fc';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignIn = () => {
  const navigate = useNavigate();

  const onSuccess = async (result) => {
    console.log('Google Sign-In Success:', result);
    toast.success("Login successful!");
  
    setTimeout(() => {
      navigate('/home');
    }, 1000); 
  };
  

  const onFailure = async (result) => {
    console.error('Google Sign-In Failed:', result);
    toast.error("Login failed. Please try again.");
  };

  return (
    <div className="flex justify-center mt-4 w-full ">
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          isSignedIn={true}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              className="flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition duration-200"
            >
              <FcGoogle className="text-xl" /> Sign in with Google
            </button>
          )}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleSignIn;
