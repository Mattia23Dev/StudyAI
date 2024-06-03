"use client"
import axios from 'axios';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';

type FormData = {
    email: string;
    password: string;
};

export default function Login() {
    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                email: data.email,
                password: data.password,
              });
        
              const { token, user } = response.data;
        
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('token', token);
              router.push("/list");

          } catch (error) {
            console.error("Error registering user:", error);
          }
    };
	return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-center mb-4">
                <FcGoogle className="mr-2" size={20} /> {/* Modifica il percorso dell'immagine del logo */}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">Accedi</h2>
            <p className="text-center text-gray-600 mb-4">
                Non hai un account? <Link href="/registration" legacyBehavior>Registrati ora</Link>
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700">Email</label>
                    <input 
                        id="email" 
                        type="email" 
                        {...register('email', { required: 'Email is required' })} 
                        className="mt-1 p-2 w-full border rounded" 
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700">Password</label>
                    <input 
                        id="password" 
                        type="password" 
                        {...register('password', { required: 'Password is required' })} 
                        className="mt-1 p-2 w-full border rounded" 
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                <button type="submit" className="bg-orange-500 text-white w-full py-2 rounded">Procedi</button>
            </form>
            <div className="text-center mt-4">
                <button 
                    onClick={() => signIn('google')} 
                    className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded flex items-center justify-center w-full"
                >
                    <FcGoogle className="mr-2" size={20} /> {/* Modifica il percorso dell'icona di Google */}
                    Accedi con Google
                </button>
            </div>
        </div>
    </div>
	);
}