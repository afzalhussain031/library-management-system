import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import { CheckCircle, XCircle, Loader2, BookOpen, Mail } from 'lucide-react';
import loginImage from "../../assets/signup-image.jpg";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid activation link. No token found in the URL.');
      return;
    }

    const verify = async () => {
      try {
        const data = await auth.verifyEmail(token);
        setStatus('success');
        setMessage(data.detail || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.detail || 
          err.response?.data?.message || 
          'Verification failed. The activation link might be invalid or expired.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[600px]">
        
        {/* LEFT PANEL: Image with decorations matching Login page style */}
        <div className="relative w-full lg:w-[52%] overflow-hidden min-h-[300px] lg:min-h-[600px]">
          <img
            src={loginImage}
            alt="Library"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />

          {/* Brand pill */}
          <div className="absolute top-6 left-6 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium px-5 py-2 rounded-full">
            LibraryHub
          </div>

          {/* Floating card */}
          <div className="absolute top-6 right-6 bg-white rounded-2xl p-3 w-48 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-gray-800">Email Verification</p>
            </div>
            <p className="text-[11px] text-gray-400">One step to access library</p>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-12 left-8 right-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
            <p className="text-sm text-gray-200/80 leading-relaxed">
              Activate your account to explore thousands of titles, manage loans, and track reservations.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Verification Status UI */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 text-center bg-white">
          <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
            
            {status === 'verifying' && (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-100 shadow-sm relative">
                  <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verifying your email</h2>
                  <p className="text-gray-500 text-sm mt-2">Connecting to auth servers to activate your account...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                  <CheckCircle className="h-9 w-9 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-green-600">Verification Successful!</h2>
                  <p className="text-gray-500 text-sm mt-3 px-2 leading-relaxed">{message}</p>
                </div>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 hover:shadow-lg transition-all duration-200 cursor-pointer shadow-md"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
                  <XCircle className="h-9 w-9 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-red-500">Activation Failed</h2>
                  <p className="text-gray-500 text-sm mt-3 px-2 leading-relaxed">{message}</p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    Go back to Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
