'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FcIdea } from 'react-icons/fc';
import { MdAddCircleOutline, MdTextFields, MdPhotoCamera, MdFileUpload } from 'react-icons/md';

const ListPage: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>You need to be authenticated to view this page.</p>
        <Link href="/api/auth/signin">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Crea!</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <Button icon={<MdAddCircleOutline size={24} />} text="Crea da zero" />
        <Button icon={<MdTextFields size={24} />} text="Crea da Testo" />
        <Button icon={<MdPhotoCamera size={24} />} text="Crea da Foto" />
        <Button icon={<MdFileUpload size={24} />} text="Crea da File" />
        <Button icon={<FcIdea size={24} />} text="Genera idee" />
      </div>
      <div className="border-b mb-4">
        <nav className="flex space-x-4">
          <Tab text="Materiale" active />
          <Tab text="Cartelle" />
        </nav>
      </div>
      <div className="text-center text-gray-600">
        Qui troverai tutte le mappe che hai creato. Crea una mappa per iniziare!
      </div>
    </div>
  );
};

const Button: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
  return (
    <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="text-gray-700 mb-2">{icon}</div>
      <div className="text-gray-700 font-medium">{text}</div>
    </button>
  );
};

const Tab: React.FC<{ text: string; active?: boolean }> = ({ text, active }) => {
  return (
    <button
      className={`p-2 text-gray-700 ${active ? 'border-b-2 border-black' : 'hover:border-b-2 hover:border-gray-400'}`}
    >
      {text}
    </button>
  );
};

export default ListPage;
