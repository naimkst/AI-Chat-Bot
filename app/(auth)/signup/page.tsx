// NO 'use client' here!
import SignupForm from './SignupForm';

export const metadata = {
  title: 'Signup | Caddie AI',
  description: 'Create an account with your email and password',
};

export default function SignupPage() {
  return <SignupForm />;
}