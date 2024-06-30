import axios from 'axios';

const host = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/extract`;
interface User {
  current: {
    _id: string;
  };
}
let user = localStorage.getItem("user");

let parsedUser: User | null = null;
if (user) {
  try {
    parsedUser = JSON.parse(user);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }
}

export const fetchUserMaps = async () => {
    try {
      const response = await fetch(`${host}/${parsedUser?.current._id}/maps`);
      const maps = await response.json();
      console.log(maps);
      return maps;
    } catch (error) {
      console.error('Error fetching user maps:', error);
      return [];
    }
  }