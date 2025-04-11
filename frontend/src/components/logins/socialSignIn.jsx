import React from 'react'
import GoogleSignIn from './GoogleSignIn'
import AppleSignIn from './Apple'
import GitHubSignIn from './Github'


const socialSignIn = () => {
  return (
    <div>
    <h2>Sign in with:</h2>
    <GoogleSignIn />
    </div>
  )
}

export default socialSignIn
