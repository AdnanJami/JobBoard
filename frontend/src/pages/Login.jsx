import React from 'react'
import Form_User from '../components/Form-User'
function Login() {
  return (
    <Form_User route={'/api/v1/auth/token/'} method={"login"}/>
  )
}

export default Login