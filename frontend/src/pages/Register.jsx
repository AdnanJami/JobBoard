import React from 'react'
import Form_User from '../components/Form-User'
function Register() {
  return (
    <Form_User route={'/api/v1/auth/register/'} method={"register"}/>
  )
}

export default Register