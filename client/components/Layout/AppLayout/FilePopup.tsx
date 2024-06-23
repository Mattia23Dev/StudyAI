import React from 'react'
import { useCallback, useState } from 'react';
import { MdAddCircleOutline, MdFileUpload } from 'react-icons/md';
import { Document, Page, pdfjs } from 'react-pdf';
import Tesseract from 'tesseract.js';
import '../../../app/page.module.css'
import { sendTextToApi } from '@/utils/api/scrapeText';

interface FilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImagePopupProps {
  isOpen: boolean;
  images: string[];
  onClose: () => void;
}

interface ChapterImages {
  [key: string]: string[];
}

const ImagePopup: React.FC<ImagePopupProps> = ({ isOpen, images, onClose }) => {
  const [chapters, setChapters] = useState<ChapterImages>({ 'Capitolo 1': [] });
  const [activeChapter, setActiveChapter] = useState<string>('Capitolo 1');
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: Set<string> }>({ 'Capitolo 1': new Set() });
  const [ocrResults, setOcrResults] = useState<{ [key: string]: string }>({});
  const [analysisResults, setAnalysisResults] = useState<any>({});

  const addChapter = () => {
    const newChapterNumber = Object.keys(chapters).length + 1;
    const newChapter = `Capitolo ${newChapterNumber}`;
    setChapters(prevChapters => ({ ...prevChapters, [newChapter]: [] }));
    setSelectedImages(prevSelectedImages => ({ ...prevSelectedImages, [newChapter]: new Set() }));
    setActiveChapter(newChapter);
  };

  const handleImageClick = useCallback((image: string) => {
    setSelectedImages(prevSelectedImages => {
      const newSelectedImages = { ...prevSelectedImages };
      const chapterImages = new Set(newSelectedImages[activeChapter]);

      if (chapterImages.has(image)) {
        chapterImages.delete(image);
      } else {
        chapterImages.add(image);
      }

      newSelectedImages[activeChapter] = chapterImages;

      setChapters(prevChapters => ({
        ...prevChapters,
        [activeChapter]: Array.from(chapterImages)
      }));

      return newSelectedImages;
    });
  }, [activeChapter]);
  
  const convertAndAnalyzeText = async () => {
    try {
      const results: { [key: string]: string } = {};

      for (const [chapter, imagesSet] of Object.entries(selectedImages)) {
        const imagesArray = Array.from(imagesSet);
        let chapterText = '';

        for (const image of imagesArray) {
          const { data: { text } } = await Tesseract.recognize(image, 'eng');
          chapterText += text + '\n';
        }

        results[chapter] = chapterText;
      }

      setOcrResults(results);
      console.log('OCR Results:', results);

      // Step 2: Analyze Text
      const response = await sendTextToApi({ chapterTexts: results });
      console.log('Analysis Results:', response);
      setAnalysisResults(response.analyses);
      console.log(response.analyses)
    } catch (error) {
      console.error('Error during conversion and analysis:', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl h-4/5 mx-auto overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Immagini estratte</h2>
        <div className="flex items-center mb-4">
          {Object.keys(chapters).map((chapter, index) => (
            <button
              key={index}
              onClick={() => setActiveChapter(chapter)}
              className={`px-4 py-2 rounded-t-lg ${activeChapter === chapter ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
            >
              {chapter}
            </button>
          ))}
          <button onClick={addChapter} className="ml-4 text-blue-500 flex items-center">
            <MdAddCircleOutline size={24} className="mr-1" /> Aggiungi Capitolo
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-scroll">
          {images.map((image, index) => (
            <div 
            className={`image-container border border-gray-300 rounded-md p-2 ${selectedImages[activeChapter]?.has(image) ? 'border-blue-500' : ''}`}
            key={`page_${index + 1}`}
            onClick={() => handleImageClick(image)}
            >
              <img src={image} alt={`Page ${index + 1}`} className="max-w-none h-auto w-96" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={convertAndAnalyzeText}
            className="bg-green-500 text-white rounded-lg px-4 py-2 flex items-center"
          >
            Converti in Testo
          </button>
          <button
            onClick={onClose}
            className="bg-orange-500 text-white rounded-lg px-4 py-2 flex items-center"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePopup: React.FC<FilePopupProps> = ({ onClose, isOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [imageUrlArray, setImageUrlArray] = useState<string[]>([]);
  const [fileType, setFileType] = useState<string | null>(null);
  const [selectedPDFFile, setSelectedPDFFile] = useState<File | null>(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

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
    [
      setSelectedPDFFile,
      setImageUrlArray,
      imageUrlArray,
      setIsLoading,
      isLoading,
    ]
  );

  const onLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
    },
    [setNumPages, numPages, setIsLoading]
  );

  const renderPageToImage = async (pdf: any, pageNumber: number) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context!,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          resolve(imageUrl);
        }
      });
    });
  };

  const processPdf = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const imageUrls: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const imageUrl = await renderPageToImage(pdf, pageNum);
      imageUrls.push(imageUrl);
    }

    setImageUrlArray(imageUrls);
    setIsLoading(false);
    setIsImagePopupOpen(true);
  }, []);

  React.useEffect(() => {
    if (selectedPDFFile) {
      processPdf(selectedPDFFile);
    }
  }, [selectedPDFFile, processPdf]);

  console.log(numPages)
  console.log(imageUrlArray)

  return (
    <div className={`fixed inset-0 z-50 flex w-100 items-center justify-center bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Card da Pdf</h2>
        <div className="relative">
          <input
            type="file"
            onChange={handleImage}
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center space-x-2 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <MdFileUpload size={24} className='mb-2' />
            <span className="text-gray-700 font-medium">Carica File</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-white text-orange-500 border border-orange-500 rounded-lg px-4 py-2 hover:bg-orange-500 hover:text-white transition"
          >
            Chiudi
          </button>
          <button
            onClick={() => console.log('Creazione card')}
            className="bg-orange-500 text-white rounded-lg px-4 py-2 flex items-center"
          >
            Crea <span className="ml-2 text-yellow-300">🪙 15</span>
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          oppure{' '}
          <a href="#" className="underline">
            carica un file dal tuo dispositivo
          </a>
        </div>
        {isLoading && <div className="mt-4">Caricamento...</div>}

        {/*selectedPDFFile && (
          <div className="imageContainer">
            <Document
              file={selectedPDFFile}
              onLoadSuccess={onLoadSuccess}
              error={<div>An error occurred!</div>}
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <React.Fragment key={`page_${index + 1}`}>
                  <Page
                    pageNumber={index + 1}
                    className={`import-pdf-page-${index + 1} image`}
                    onRenderSuccess={() => onRenderSuccess(index)}
                    width={1024}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    error={<div>An error occurred!</div>}
                  />
                  {imageUrlArray[index] && (
                    <a className='download' href={imageUrlArray[index]} download>
                      download file
                    </a>
                  )}
                </React.Fragment>
              ))}
            </Document>
          </div>
        )*/}

        <ImagePopup isOpen={isImagePopupOpen} images={imageUrlArray} onClose={() => setIsImagePopupOpen(false)} />
      </div>
    </div>
  );
};


export default FilePopup