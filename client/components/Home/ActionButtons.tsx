'use client';
import { Button } from '@/components/ui/Button';
import { uploadPdfApi } from '@/utils/api/scrapeText';
import { useState } from 'react';

export default function ActionButtons() {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	  const file = event.target.files ? event.target.files[0] : null;
	  setFile(file);
	};
	const goToMap = () => {
		window.open('/map', '_self');
	};

	const handleUpload = async () => {
		if (file) {
		  try {
			const result = await uploadPdfApi({ file });
			console.log('Upload successful:', result);
		  } catch (error) {
			console.error('Upload failed:', error);
		  }
		} else {
		  console.error('No file selected');
		}
	  };

	return (
		<div>
			<Button onClick={goToMap}>Go to map</Button>
			<input type="file" onChange={handleFileChange} accept=".pdf" />
			<Button variant='subtle' className='ml-4' onClick={handleUpload}>
				Carica documento
			</Button>
			<Button onClick={goToMap}>Carica immagini</Button>
		</div>
	);
}
