import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HandCapture from './components/HandCapture.jsx';
import GestureHUD from './components/GestureHUD.jsx';
import SavedGallery from './components/SavedGallery.jsx';
import AuthModal from './components/AuthModal.jsx';
import { api } from './utils/api.js';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [user, setUser] = useState(null);
  const [dbStatus, setDbStatus] = useState('unknown');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [handsData, setHandsData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    async function init() {
      try {
        const health = await api.getHealth();
        if (health && health.database === 'connected') {
          setDbStatus('connected');
        } else {
          setDbStatus('not_connected');
        }
      } catch {
        setDbStatus('not_connected');
      }
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      }
    }

    init();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const handleSaveDrawing = async (drawingPayload) => {
    if (!user) {
      showToast('Please sign in or register to save drawings to your MongoDB Atlas cloud account.', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.saveDrawing(drawingPayload);
      showToast('Artwork saved successfully to your cloud account!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save drawing.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-200 selection:text-slate-900">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-700/80 text-rose-200'
                : 'bg-white/95 border-slate-300 text-sky-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-700" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8">
              <HandCapture
                onHandsDetected={setHandsData}
                onSaveDrawing={handleSaveDrawing}
                isSaving={isSaving}
              />
            </div>

            
            <div className="lg:col-span-4">
              <GestureHUD
                handsData={handsData}
                fps={handsData.length > 0 ? 60 : 0}
                isTracking={handsData.length > 0}
              />
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <SavedGallery
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSwitchToStudio={() => setActiveTab('studio')}
            dbStatus={dbStatus}
          />
        )}




      </main>

      
      <footer className="border-t border-slate-200 bg-white/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500">Hand Capture Studio</span>
            <span>•</span>
            <span>Webcam &amp; MediaPipe Tasks Vision</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Express + MongoDB Atlas + React</span>
          </div>
        </div>
      </footer>

      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          showToast(`Welcome, ${userData.username || 'Creator'}!`, 'success');
        }}
        dbStatus={dbStatus}
      />
    </div>
  );
}
