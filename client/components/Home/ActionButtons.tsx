'use client';
import { Button } from '@/components/ui/Button';
import useMapStore from '@/stores/mapStore';
import { uploadPdfApi } from '@/utils/api/scrapeText';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ActionButtons() {
	const [file, setFile] = useState<File | null>(null);
	const router = useRouter();
	const setElements = useMapStore((state) => state.setElements);
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	  const file = event.target.files ? event.target.files[0] : null;
	  setFile(file);
	};
	const goToMap = () => {
		window.open('/map', '_self');
	};

	function parseJsonResponse(response:String) {
		const jsonIndicator = '```json';
		if (response.includes(jsonIndicator)) {
		  const cleanedResponse = response.replace(/```json|```/g, '');
		  try {
			const parsedData = JSON.parse(cleanedResponse);
			const nodes = parsedData.nodes || [];
			const edges = parsedData.edges || [];
			return { nodes, edges };
		  } catch (error) {
			console.error('Failed to parse JSON:', error);
			return { nodes: [], edges: [] };
		  }
		} else {
		  console.error('Response does not contain valid JSON format.');
		  return { nodes: [], edges: [] };
		}
	  }

	const handleUpload = async () => {
		if (file) {
		  try {
			const result = await uploadPdfApi({ file });
			//const { nodes, edges } = parseJsonResponse(result);
			setElements(result.nodes, result.edges);
			const randomId = Math.random().toString(36).substring(2, 15);
        	router.push(`/map/${randomId}`);
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
