import React, { useState } from 'react';

interface TextCardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextCardPopup: React.FC<TextCardPopupProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const maxLength = 15000;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Card da Testo</h2>
        <textarea
          className="w-full h-64 p-4 border rounded-lg resize-none"
          placeholder="Inserisci qui il testo da cui vuoi creare la Card..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxLength}
        />
        <div className="text-right mt-2 text-gray-600">
          Caratteri: {text.length} / {maxLength}
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
      </div>
    </div>
  );
};

export default TextCardPopup;
