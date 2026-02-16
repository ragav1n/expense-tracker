'use client'

import { useState } from 'react'
import { Component as SignInCard } from '@/components/sign-in-card'

export default function SignUpPage() {
  return <SignInCard isSignUp={true} />
}
