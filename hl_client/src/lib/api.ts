// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // Optional: If you want to use API key in future (recommended for production)
    // 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
  },
});

// Optional: Add API Key globally (uncomment if you use X-API-Key in backend)
// api.defaults.headers.common['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;

// Response interceptor – let components handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// ================================
// BLOG ENDPOINTS
// ================================
export const getBlogPosts = async () => {
  const { data } = await api.get("/blogs");
  return Array.isArray(data) ? data : [];
};

export const getBlogPostBySlug = async (slug: string) => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data || null;
};

// ================================
// PROPERTY ENDPOINTS
// ================================
export const getProperties = async (params?: {
  location?: string;
  project_status?: string;
  from_homepage?: boolean;
}) => {
  const query = new URLSearchParams();
  if (params?.location && params.location !== 'default') query.append('location', params.location);
  if (params?.project_status && params.project_status !== 'default') query.append('project_status', params.project_status);
  if (params?.from_homepage) query.append('from_homepage', 'true');

  const { data } = await api.get(`/properties${query.toString() ? `?${query}` : ''}`);
  return Array.isArray(data) ? data : [];
};

export const getPropertyBySlug = async (slug: string) => {
  if (!slug) return null;
  const { data } = await api.get(`/sproperties?slug=${slug}`);
  return Array.isArray(data) && data[0] ? data[0] : null;
};

export const getSimilarProperties = async (slug: string, flat_size: string) => {
  if (!slug || !flat_size) return [];
  const { data } = await api.get(`/similar?slug=${slug}&flat_size=${flat_size}`);
  return Array.isArray(data) ? data : [];
};

// ================================
// REVIEW ENDPOINT
// ================================
export const getReviews = async () => {
  const { data } = await api.get("/review");
  return Array.isArray(data) ? data : [];
};

// ================================
// FORM ENDPOINTS
// ================================
export const submitContact = async (formData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) => {
  const { data } = await api.post("/contact", formData);
  return data;
};

export const submitVisitBooking = async (formData: {
  name: string;
  property_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
}) => {
  const { data } = await api.post("/visit", formData);
  return data;
};

export const subscribeNewsletter = async (email: string, name?: string) => {
  const { data } = await api.post("/newsletter", { email, name });
  return data;
};

// Export default for direct axios usage if needed
export default api;