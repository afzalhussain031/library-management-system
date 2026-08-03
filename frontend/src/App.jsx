import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EntityModalProvider } from './context/EntityModalContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EntityModalProvider>
          <Toaster position="top-right" />
          <AppRouter />
        </EntityModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}