'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FcIdea } from 'react-icons/fc';
import Tesseract from 'tesseract.js';
import { MdAddCircleOutline, MdTextFields, MdPhotoCamera, MdFileUpload } from 'react-icons/md';
import AuthWrapper from '@/components/Providers/AuthWrapper';
import TextCardPopup from '@/components/Layout/AppLayout/TextCardPopup';
import QrCodePopup from '@/components/Layout/AppLayout/QrCodePopup';
import axios from 'axios';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { Cross2Icon, EyeOpenIcon, DownloadIcon } from '@radix-ui/react-icons';
import { Document, Page, pdfjs } from 'react-pdf';
import FilePopup from "@/components/Layout/AppLayout/FilePopup";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


  const ListPage: React.FC = () => {
    const [isPopupOpenText, setIsPopupOpenText] = useState(false);
    const [isPopupOpenQr, setIsPopupOpenQr] = useState(false);
    const [isPopupOpenPdf, setIsPopupOpenPdf] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [activeMap, setActiveMap] = useState(true);
    const [activeFolder, setActiveFolder] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<string[]>([]);
    const [chapters, setChapters] = useState<{ [key: string]: string[] }>({});
    const [extractedTexts, setExtractedTexts] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [imageUrlArray, setImageUrlArray] = useState<string[] | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [selectedPDFFile, setSelectedPDFFile] = useState<File | null>(null);
  
    const handleOpenPopup = (open: string) => {
      if (open === "zero") {
        console.log(open);
      } else if (open === "text") {
        setIsPopupOpenText(true);
      } else if (open === "qr") {
        setIsPopupOpenQr(true);
      } else if (open === "file"){
        setIsPopupOpenPdf(true);
      } else {
        console.log(open);
      }
    };
  
    const handleClosePopup = () => {
      setIsPopupOpenText(false);
      setIsPopupOpenQr(false);
      setIsPopupOpenPdf(false);
    };
  
    const handleImage = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrlArray([]);
        const file = event.target.files?.[0];
  
        if (file && file.type === 'application/pdf') {
          setIsLoading(true);
          setSelectedPDFFile(file);
        } else if (file) {
          setFileType('image');
          setImageUrlArray([URL.createObjectURL(file)]);
        }
      },
      []
    );
  
    const onLoadSuccess = useCallback(
      ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
      },
      []
    );
  
    const onRenderSuccess = useCallback(
      (pageIndex: number) => {
        if (numPages) {
          Array.from(new Array(numPages), (el, index) => {
            const importPDFCanvas = document.querySelector<HTMLCanvasElement>(
              `.import-pdf-page-${index + 1} canvas`
            );
  
            if (pageIndex === index && importPDFCanvas) {
              importPDFCanvas.toBlob((blob) => {
                if (blob) {
                  setImageUrlArray((prev) => [
                    ...(prev || []),
                    URL.createObjectURL(blob),
                  ]);
                }
              });
            }
          });
        }
      },
      [numPages]
    );
  
    const uploadImagesToWordPress = async (images: string[]) => {
      const uploadedImages: string[] = [];
      for (const image of images) {
        const response = await uploadImage(image);
        if (response) {
          uploadedImages.push(response);
        }
      }
      return uploadedImages;
    };
  
    const uploadImage = async (image: string) => {
      try {
        const formData = new FormData();
        const blob = dataURItoBlob(image);
        formData.append('file', blob, 'image.jpg');
  
        const response = await axios.post('https://studdyedu.com/wp-json/wp/v2/media', formData, {
          headers: {
            'Content-Disposition': 'attachment; filename="image.jpg"',
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WTOKEN}`, // Sostituisci con il token di autenticazione WordPress
          },
        });
  
        return response.data.source_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    };
  
    const dataURItoBlob = (dataURI: string) => {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };
  
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Crea!</h1>
          <div className="flex justify-center space-x-4 mb-8">
            <Button onClick={() => handleOpenPopup("zero")} icon={<MdAddCircleOutline size={24} />} text="Crea da zero" />
            <Button onClick={() => handleOpenPopup("text")} icon={<MdTextFields size={24} />} text="Crea da Testo" />
            <Button onClick={() => handleOpenPopup("qr")} icon={<MdPhotoCamera size={24} />} text="Crea da Foto" />
            <Button onClick={() => handleOpenPopup("file")} icon={<MdPhotoCamera size={24} />} text="Crea da File" />
            <Button onClick={() => handleOpenPopup("ideas")} icon={<FcIdea size={24} />} text="Genera idee" />
          </div>
          <div className="border-b mb-4">
            <nav className="flex space-x-4">
              <Tab onClick={() => { setActiveMap(true); setActiveFolder(false); }} text="Materiale" active={activeMap} />
              <Tab onClick={() => { setActiveMap(false); setActiveFolder(true); }} text="Cartelle" active={activeFolder} />
            </nav>
          </div>
          <div className="text-center text-gray-600">
            Qui troverai tutte le mappe che hai creato. Crea una mappa per iniziare!
          </div>
        </div>
        <TextCardPopup isOpen={isPopupOpenText} onClose={handleClosePopup} />
        <QrCodePopup isOpen={isPopupOpenQr} onClose={handleClosePopup} />
        <FilePopup isOpen={isPopupOpenPdf} onClose={handleClosePopup} />
        {isLoading && <div />}
  
        {selectedPDFFile && (
          <div>
            <Document
              file={selectedPDFFile}
              onLoadSuccess={onLoadSuccess}
              error={<div>An error occurred!</div>}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <React.Fragment key={`page_${index + 1}`}>
                  <Page
                    pageNumber={index + 1}
                    className={`import-pdf-page-${index + 1} ${fileType === 'image'}`}
                    onRenderSuccess={() => onRenderSuccess(index)}
                    width={1024}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    error={<div>An error occurred!</div>}
                  />
                  {imageUrlArray && imageUrlArray[index] && (
                    <a href={imageUrlArray[index]} download>
                      download file
                    </a>
                  )}
                </React.Fragment>
              ))}
            </Document>
          </div>
        )}
  
        {!!imageUrlArray?.length &&
          fileType === 'image' &&
          imageUrlArray.map((image: string, index: number) => (
            <div key={`page_${index + 1}`}>
              <img src={image} />
              <a href={image} download>
                download file
              </a>
            </div>
          ))}
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
