import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';  // Add to .env.local: NEXT_PUBLIC_API_URL=https://api.dreamwayhl.com
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;  // If your backend requires it

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: API_KEY ? { "x-api-key": API_KEY } : {}
});

export const getBlogPosts = async () => {
  const { data } = await client.get("/blogs");
  return data;
};

export const getBlogPostBySlug = async (slug: string) => {
  const { data } = await client.get(`/blogs/${slug}`);
  return data;
};

// Create a configured instance of axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
  },
});

export default api; 