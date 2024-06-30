import axios from 'axios';

const host = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/extract`;
interface User {
  current: {
    _id: string;
  };
}
let user;
if (typeof window !== 'undefined') {
  user = localStorage.getItem("user");
}
let parsedUser: User | null = null;
if (user) {
  try {
    parsedUser = JSON.parse(user);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }
}
interface UploadPdfProps {
  file: File;
}

interface UploadImagesProps {
  images: File[];
}

interface ChapterTexts {
  [chapter: string]: string;
}
interface TextRequestProps {
  chapterTexts: ChapterTexts;
}

export const uploadPdfApi = async ({ file }: UploadPdfProps) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${host}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        //"Access-Control-Allow-Origin": "*",
      },
    });
    console.log(response)
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

export const sendTextToApi = async ({ chapterTexts }: TextRequestProps) => {
  try {
    const response = await axios.post(`${host}/analyze-text`, { chapterTexts, userId: parsedUser?._id });
    return response.data;
  } catch (error) {
    console.error('Error sending text to API:', error);
    throw error;
  }
};
