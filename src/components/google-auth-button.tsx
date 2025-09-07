// src front/components/google-auth-button.tsx
"use client";

import { Button } from "./ui/button";

// Un componente simple para la imagen de Google
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.93H12V14.4H18.2C17.96 15.93 17.23 17.25 16.07 18.09V20.6H19.66C21.56 18.83 22.56 15.83 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C15.24 23 17.95 21.92 19.66 20.6L16.07 18.09C14.99 18.83 13.62 19.25 12 19.25C8.87 19.25 6.22 17.14 5.27 14.29H1.58V16.9C3.29 20.43 7.32 23 12 23Z" fill="#34A853"/>
    <path d="M5.27 14.29C5.04 13.59 4.92 12.83 4.92 12C4.92 11.17 5.04 10.41 5.27 9.71V7.1H1.58C0.87 8.53 0.42 10.2 0.42 12C0.42 13.8 0.87 15.47 1.58 16.9L5.27 14.29Z" fill="#FBBC05"/>
    <path d="M12 4.75C13.75 4.75 15.24 5.36 16.45 6.5L19.74 3.2C17.95 1.53 15.24 0.5 12 0.5C7.32 0.5 3.29 3.57 1.58 7.1L5.27 9.71C6.22 6.86 8.87 4.75 12 4.75Z" fill="#EA4335"/>
  </svg>
);

export function GoogleAuthButton({ text }: { text: string }) {
  const handleGoogleLogin = () => {
    // Redirigimos al endpoint de login del backend. Auth0 interceptará esto.
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/login`;
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogleLogin}
      className="w-full bg-white text-gray-700 hover:bg-gray-100"
    >
      <GoogleIcon />
      <span className="ml-2">{text}</span>
    </Button>
  );
}