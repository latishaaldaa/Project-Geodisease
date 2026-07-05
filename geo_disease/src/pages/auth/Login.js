import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import logoGeoDisease from '../../assets/GeoDisease.png'; 
import API_BASE_URL from '../../config/api'; 

const Login = ({ onLoginSuccess, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cek apakah Google Client ID sudah dikonfigurasi
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const isGoogleEnabled = googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && googleClientId.length > 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mengirim data login ke Backend Flask
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Jika sukses, panggil fungsi success dengan role dan nama dari database
        // data.role dan data.userName diambil dari hasil response Flask yang sudah kita perbaiki
        onLoginSuccess(data.role, data.userName);
      } else {
        alert("Login Gagal: " + data.message);
      }
    } catch (err) {
      alert("Gagal terhubung ke Backend Python! Pastikan app.py sudah dijalankan.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Mendapatkan informasi user dari Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();

        // Kirim data ke backend Flask untuk verifikasi/registrasi
        const response = await fetch(`${API_BASE_URL}/api/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            googleId: userInfo.sub,
            picture: userInfo.picture
          })
        });

        const data = await response.json();

        if (data.success) {
          onLoginSuccess(data.role, data.userName);
        } else {
          alert("Login Google Gagal: " + data.message);
        }
      } catch (err) {
        alert("Gagal login dengan Google: " + err.message);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      alert("Gagal login dengan Google");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-6">
          <img 
            src={logoGeoDisease} 
            alt="GeoDisease Logo" 
            className="h-32 mx-auto mb-2 object-contain"
            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=GeoDisease"; }} 
          />
          <h2 className="text-2xl font-bold text-slate-800">Welcome to GeoDisease</h2>
          <p className="text-slate-500 text-sm">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </span>
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </span>
              <input 
                type="password" 
                placeholder="Enter your password" 
                required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="remember" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="remember" className="ml-2 text-sm text-slate-600 font-medium">Remember me</label>
          </div>

          <button type="submit" className="w-full bg-[#121629] hover:bg-[#1c223d] text-white py-3 rounded-xl font-bold transition-colors shadow-md">
            Sign In
          </button>

          {isGoogleEnabled && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                type="button" 
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700"
              >
                <img src="https://www.google.com/favicon.ico" alt="google" className="w-4 h-4 mr-2" />
                Continue with Google
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 font-medium">
          Don't have an account? <button onClick={onShowRegister} className="text-blue-500 font-bold hover:underline">Sign up</button>
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
          <p className="font-bold uppercase tracking-wider mb-1 text-slate-400">Note:</p>
          <p>Login akan diverifikasi melalui <span className="text-slate-700 font-semibold">Backend Flask</span> dan <span className="text-slate-700 font-semibold">Database MySQL</span>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;