import { signOut } from 'next-auth/react';
import Form from 'next/form';
import { useRouter } from 'next/router';

export const useSignOut = () => {
  const router = useRouter();

  const signOut = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login'); // Redirect to login
  };

  return { signOut };
};

export const SignOutForm = () => {

  
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';
      }}
    >
      <button
        onClick={() => signOut()}
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
