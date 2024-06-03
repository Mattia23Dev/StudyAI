'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FcIdea } from 'react-icons/fc';
import { MdAddCircleOutline, MdTextFields, MdPhotoCamera, MdFileUpload } from 'react-icons/md';
import AuthWrapper from '@/components/Providers/AuthWrapper';
import TextCardPopup from '@/components/Layout/AppLayout/TextCardPopup';
import QrCodePopup from '@/components/Layout/AppLayout/QrCodePopup';

const ListPage: React.FC = () => {
    const [isPopupOpenText, setIsPopupOpenText] = useState(false);
    const [isPopupOpenQr, setIsPopupOpenQr] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [activeMap, setActiveMap] = useState(true);
    const [activeFolder, setActiveFolder] = useState(false);

    const handleOpenPopup = (open: String) => {
        if (open === "zero"){
            console.log(open)
        } else if (open === "text"){
            setIsPopupOpenText(true);
        } else if (open === "qr"){
            setIsPopupOpenQr(true);
        } else {
            console.log(open)
        }
    };
  
    const handleClosePopup = () => {
      setIsPopupOpenText(false);
      setIsPopupOpenQr(false);
    };

	const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
	  const file = event.target.files ? event.target.files[0] : null;
	  setFile(file);
	};

  return (
    <AuthWrapper>
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Crea!</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <Button onClick={() => handleOpenPopup("zero")} icon={<MdAddCircleOutline size={24} />} text="Crea da zero" />
        <Button onClick={() => handleOpenPopup("text")} icon={<MdTextFields size={24} />} text="Crea da Testo" />
        <Button onClick={() => handleOpenPopup("qr")} icon={<MdPhotoCamera size={24} />} text="Crea da Foto" />
        <StyledFileInput onChange={handleUploadFile} />
        <Button onClick={() => handleOpenPopup("ideas")} icon={<FcIdea size={24} />} text="Genera idee" />
      </div>
      <div className="border-b mb-4">
        <nav className="flex space-x-4">
          <Tab onClick={() => {setActiveMap(true); setActiveFolder(false)}} text="Materiale" active={activeMap} />
          <Tab onClick={() => {setActiveMap(false); setActiveFolder(true)}} text="Cartelle" active={activeFolder} />
        </nav>
      </div>
      <div className="text-center text-gray-600">
        Qui troverai tutte le mappe che hai creato. Crea una mappa per iniziare!
      </div>
    </div>
    <TextCardPopup isOpen={isPopupOpenText} onClose={handleClosePopup} />
    <QrCodePopup isOpen={isPopupOpenQr} onClose={handleClosePopup} />
    </AuthWrapper>
  );
};

interface StyledFileInputProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
  
  const StyledFileInput: React.FC<StyledFileInputProps> = ({ onChange }) => {
    return (
      <div className="relative">
        <input
          type="file"
          onChange={onChange}
          accept=".pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center space-x-2 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <MdFileUpload size={24} className='mb-2' />
          <span className="text-gray-700 font-medium">Carica File</span>
        </div>
      </div>
    );
  };

const Button: React.FC<{ icon: React.ReactNode; text: string, onClick: () => void }> = ({ icon, text, onClick }) => {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="text-gray-700 mb-2">{icon}</div>
      <div className="text-gray-700 font-medium">{text}</div>
    </button>
  );
};

const Tab: React.FC<{ text: string; active?: boolean; onClick: () => void }> = ({ text, active, onClick }) => {
  return (
    <button
      className={`p-2 text-gray-700 ${active ? 'border-b-2 border-black' : 'hover:border-b-2 hover:border-gray-400'}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default ListPage;
