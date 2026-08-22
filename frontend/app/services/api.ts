import axios from 'axios';

// URL relativa - custom server.js faz proxy /api -> backend:3333
export const api = axios.create({
  baseURL: '/api',
});
