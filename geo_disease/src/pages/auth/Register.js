import React, { useState } from 'react';
import logoGeoDisease from '../../assets/GeoDisease.png'; 
import API_BASE_URL from '../../config/api'; 

const Register = ({ onBackToLogin }) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // TAMBAHAN STATE BARU: Menyimpan pilihan role dari user
  const [role, setRole] = useState('user'); 

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validasi Password
    if (password !== confirmPassword) {
      alert("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama: nama,
          email: email, 
          password: password,
          role: role // TAMBAHAN: Mengirimkan field role pilihan ke backend Flask
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Registrasi Berhasil! Selamat datang ${nama}. Akun Anda terdaftar sebagai ${role}. Silakan login.`);
        onBackToLogin(); // Kembali ke halaman login setelah sukses
      } else {
        alert("Registrasi Gagal: " + data.message);
      }
    } catch (err) {
      alert("Gagal terhubung ke Backend Python!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-8">
          <img 
            src={logoGeoDisease} 
            alt="GeoDisease Logo" 
            className="h-32 mx-auto mb-4 object-contain"
            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=GeoDisease"; }}
          />
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-sm">Sign up to get started with GeoDisease</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </span>
              <input 
                type="text" placeholder="Enter your full name" required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium"
                value={nama} onChange={(e) => setNama(e.target.value)}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </span>
              <input 
                type="email" placeholder="Enter your email" required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium" 
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* TAMBAHAN BARU: Pilihan Opsi Akun / Hak Akses (Role) */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Account Type (Role)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </span>
              <select 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium bg-white appearance-none"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User (Dinas Kesehatan)</option>
                <option value="tim kesehatan">Tim Kesehatan (CKG Gratis)</option>
                <option value="admin">Admin (Rumah Sakit)</option>
              </select>
              {/* Custom Arrow Icon untuk Dropdown Tailwind */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </span>
              <input 
                type="password" placeholder="Create a password" required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium" 
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </span>
              <input 
                type="password" placeholder="Confirm your password" required 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium" 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start">
            <input type="checkbox" required className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label className="ml-2 text-[12px] text-slate-600 font-medium">
              I agree to the <span className="text-blue-500 font-bold">Terms of Service</span> and <span className="text-blue-500 font-bold">Privacy Policy</span>
            </label>
          </div>

          <button type="submit" className="w-full bg-[#121629] hover:bg-[#1c223d] text-white py-3 rounded-xl font-bold transition-colors uppercase tracking-wide text-sm shadow-md">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
            <span className="text-slate-400 text-xs font-bold">or</span>
        </div>

        <button onClick={onBackToLogin} className="w-full mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
          Already have an account? <span className="text-blue-500">Login</span>
        </button>
      </div>
    </div>
  );
};

export default Register;