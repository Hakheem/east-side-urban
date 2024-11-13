import React from 'react';
import { GoogleOAuthProvider, GoogleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLogOut } from 'react-icons/fi';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GoogleSignOut = () => {
  const navigate = useNavigate();

  const onLogoutSuccess = () => {
    console.log('Google Sign-Out Successful');
    toast.success("Logout successful!");
    navigate('/auth/login'); 
  };

  return (
    <div className="flex justify-center mt-4">
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogout
          onLogoutSuccess={onLogoutSuccess}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              className="flex items-center justify-center gap-2 bg-red-500 text-white border border-red-600 rounded-md px-4 py-2 hover:bg-red-600 transition duration-200"
            >
              <FiLogOut className="text-xl" /> Logout
            </button>
          )}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleSignOut;
