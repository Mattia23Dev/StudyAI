import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

interface QrCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const QrCodePopup: React.FC<QrCodePopupProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  if (!isOpen) {
    return null;
  }

  const qrUrl = `${window.location.origin}/map/upload-photo?token=${token}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Inquadra il QR code</h2>
        <p className="mb-4">Inquadra il qr code con il tuo telefono, scatta le foto al tuo libro e segui le istruzioni!</p>
        <div className="flex justify-center mb-4">
          {token ? <QRCode value={qrUrl} /> : <p>Loading...</p>}
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          oppure{' '}
          <a href="#" className="underline">
            carica delle foto dal tuo dispositivo
          </a>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-orange-500 border border-orange-500 rounded-lg px-4 py-2 hover:bg-orange-500 hover:text-white transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCodePopup;