import React, { useEffect, useState } from 'react';
import {
  Palette,
  Trash2,
  Download,
  Calendar,
  Lock,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api.js';

export default function SavedGallery({
  user,
  onOpenAuth,
  onSwitchToStudio,
  dbStatus,
}) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchDrawings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getDrawings();
      setDrawings(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve saved drawings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDrawings();
    }
  }, [user]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.deleteDrawing(id);
      setDrawings((prev) => prev.filter((d) => d._id !== id));

      if (selectedDrawing?._id === id) {
        setSelectedDrawing(null);
      }

      setConfirmDeleteId(null);
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (drawing) => {
    const a = document.createElement('a');
    a.href = drawing.dataUrl;
    a.download = `${drawing.title || 'hand-art'}.png`;
    a.click();
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-100 bg-violet-50 text-violet-700 shadow-lg shadow-violet-100/50">
          <Lock className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-black text-stone-800">
          Sign In to View Your Saved Artwork
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
          Hand Capture Studio allows anyone to track hands and draw in the air
          without logging in. Create an account to store and sync your artwork
          in MongoDB Atlas.
        </p>

        <div className="mt-6 flex items-center justify-center space-x-3">
          <button
            onClick={onOpenAuth}
            className="cursor-pointer rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-700"
          >
            Sign In / Register
          </button>

          <button
            onClick={onSwitchToStudio}
            className="cursor-pointer rounded-xl border border-violet-100 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-all hover:bg-violet-50 hover:text-violet-700"
          >
            Open Live Hand Nova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-violet-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-stone-800">
              My Air Drawings
            </h2>

            <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
              {drawings.length} Saved
            </span>
          </div>

          <p className="mt-1 text-xs text-stone-500">
            Persisted securely in MongoDB Atlas database for user{' '}
            <span className="font-semibold text-stone-700">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDrawings}
            disabled={loading}
            className="flex cursor-pointer items-center space-x-1.5 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={onSwitchToStudio}
            className="flex cursor-pointer items-center space-x-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/10 transition-all hover:bg-violet-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create New Art</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>

          <button
            onClick={fetchDrawings}
            className="cursor-pointer font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && drawings.length === 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-2xl border border-violet-100 bg-white p-4"
            />
          ))}
        </div>
      )}

      {!loading && drawings.length === 0 && !error && (
        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-violet-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Palette className="h-8 w-8" />
          </div>

          <h3 className="text-base font-bold text-stone-800">
            No Drawings Saved Yet
          </h3>

          <p className="mt-1 text-xs text-stone-500">
            Head to the Live Nova, wave your hand in the air to draw, then click
            "Save Cloud"!
          </p>

          <button
            onClick={onSwitchToStudio}
            className="mt-6 inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/10 transition-colors hover:bg-violet-700"
          >
            <span>Start Drawing Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {drawings.map((d) => (
          <div
            key={d._id}
            className="group overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40"
          >
            <div
              className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden border-b border-violet-100 bg-stone-50"
              onClick={() => setSelectedDrawing(d)}
            >
              <img
                src={d.dataUrl}
                alt={d.title}
                className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center space-x-2 bg-stone-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center space-x-1.5 rounded-xl border border-violet-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-violet-700 backdrop-blur-md">
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="max-w-[190px] truncate text-sm font-bold text-stone-800">
                    {d.title || 'Hand Air Artwork'}
                  </h4>

                  <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-stone-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{d.strokeCount || 1} strokes</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDownload(d)}
                    className="cursor-pointer rounded-lg p-2 text-stone-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
                    title="Download PNG"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {confirmDeleteId === d._id ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDelete(d._id)}
                        disabled={deletingId === d._id}
                        className="cursor-pointer rounded-md bg-violet-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                      >
                        {deletingId === d._id ? '...' : 'Yes'}
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="cursor-pointer rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(d._id)}
                      className="cursor-pointer rounded-lg p-2 text-stone-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDrawing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-950/10">
            <div className="flex items-center justify-between border-b border-violet-100 pb-4">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-stone-800">
                  {selectedDrawing.title || 'Hand Air Artwork'}
                </h3>

                <p className="text-xs text-stone-500">
                  Created{' '}
                  {new Date(selectedDrawing.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedDrawing(null)}
                className="ml-4 cursor-pointer rounded-xl bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
              >
                Close
              </button>
            </div>

            <div className="my-4 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-stone-50 p-2">
              <img
                src={selectedDrawing.dataUrl}
                alt={selectedDrawing.title}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => handleDownload(selectedDrawing)}
                className="flex cursor-pointer items-center space-x-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}