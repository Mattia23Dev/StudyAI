"use client"
import { signIn } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type FormData = {
    nomeCompleto: String;
    email: string;
    password: string;
    confirmPassword: string;
    cellulare: String;
};

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const router = useRouter();

    const onSubmit: SubmitHandler<FormData> = async data => {
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
            email: data.email,
            password: data.password,
            nomeCompleto: data.nomeCompleto,
            cellulare: data.cellulare
          });
          router.push("/login");
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
            <h2 className="text-2xl font-bold mb-2 text-center">Iscriviti</h2>
            <p className="text-center text-gray-600 mb-4">
                Possiedi un account? <Link href="/login" legacyBehavior>Accedi ora</Link>
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700">Nome</label>
                    <input 
                        id="name" 
                        type="text" 
                        {...register('nomeCompleto', { required: 'Name is required' })} 
                        className="mt-1 p-2 w-full border rounded" 
                    />
                    {errors.nomeCompleto && <p className="text-red-500 text-sm">{errors.nomeCompleto.message}</p>}
                </div>
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
                    <label htmlFor="phone" className="block text-gray-700">Cellulare</label>
                    <input 
                        id="phone" 
                        type="phone" 
                        {...register('cellulare', { required: 'Phone is required' })} 
                        className="mt-1 p-2 w-full border rounded" 
                    />
                    {errors.cellulare && <p className="text-red-500 text-sm">{errors.cellulare.message}</p>}
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
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700">Ripeti Password</label>
                    <input 
                        id="confirmPassword" 
                        type="password" 
                        {...register('confirmPassword', { required: 'Please confirm your password' })} 
                        className="mt-1 p-2 w-full border rounded" 
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
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
            <p className="text-center text-gray-500 text-sm mt-4">
                Con la registrazione confermi di aver letto e compreso la nostra <Link href="/privacy" legacyBehavior>termini e condizioni</Link>.
            </p>
        </div>
    </div>
	);
}