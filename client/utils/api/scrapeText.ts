import axios from 'axios';

const host = 'https://api.yourdomain.com';

interface UploadPdfProps {
  file: File;
}

interface UploadImagesProps {
  images: File[];
}

interface TextRequestProps {
  text: string;
}

export const uploadPdfApi = async ({ file }: UploadPdfProps) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${host}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export const uploadImages = async ({ images }: UploadImagesProps) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });

  try {
    const response = await axios.post(`${host}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const sendTextToApi = async ({ text }: TextRequestProps) => {
  try {
    const response = await axios.post(`${host}/api1`, { text });
    return response.data;
  } catch (error) {
    console.error('Error sending text to API 1:', error);
    throw error;
  }
};
