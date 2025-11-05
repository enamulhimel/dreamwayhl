import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token if exists
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Remove global redirect, just pass the error to the component
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error) // Let component handle 401
);

export const getBlogPosts = async () => {
  const { data } = await api.get("/blogs");
  return Array.isArray(data) ? data : [];
};

export const getBlogPostBySlug = async (slug: string) => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data || null;
};

export const getProperties = async () => {
  const { data } = await api.get("/properties");
  return Array.isArray(data) ? data : [];
};

export const getPropertyBySlug = async (slug: string) => {
  const { data } = await api.get(`/sproperties?slug=${slug}`);
  return Array.isArray(data) && data[0] ? data[0] : null;
};

export const getSimilarProperties = async (slug: string, size: string) => {
  const { data } = await api.get(`/similer?slug=${slug}&flat_size=${size}`);
  return Array.isArray(data) ? data : [];
};

export default api;