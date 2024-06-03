'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import jwt from 'jsonwebtoken';
import Lottie from 'lottie-react';
import loaderAnimation from '@/public/imgs/loader.json'

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      //jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string);
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="loader-container">
        <Lottie width={200} animationData={loaderAnimation} loop={true} />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
