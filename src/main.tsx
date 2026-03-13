import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { router } from '@/routes';
import '@/services/api'; // Initialize axios interceptors
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>,
);
