import React from 'react';
import {
  Eraser,
  RotateCcw,
  Trash2,
  Download,
  Camera,
  CloudUpload,
  Eye,
  EyeOff,
  FlipHorizontal,
  PenTool,
} from 'lucide-react';

const COLORS = [
  { name: 'Neon Cyan', value: '#06b6d4' },
  { name: 'Bright Lime', value: '#84cc16' },
  { name: 'Coral Pink', value: '#f43f5e' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'White', value: '#ffffff' },
];

const BRUSH_SIZES = [
  { label: 'Fine', value: 3 },
  { label: 'Medium', value: 7 },
  { label: 'Bold', value: 14 },
  { label: 'Chunky', value: 24 },
];

export default function DrawingToolbar({
  drawMode,
  setDrawMode,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
  onClear,
  onUndo,
  onDownload,
  onCapture,
  onSaveCloud,
  showLandmarks,
  setShowLandmarks,
  isMirrored,
  setIsMirrored,
  drawingTrigger,
  setDrawingTrigger,
  isSaving,
}) {
  const isMulticolor = brushColor === 'multicolor';

  return (
    <div className="w-full rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-violet-100 bg-violet-50/60 p-1">
            <button
              type="button"
              onClick={() => setDrawMode('draw')}
              className={`flex min-w-[130px] cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                drawMode === 'draw'
                  ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
                  : 'text-stone-500 hover:bg-white hover:text-violet-700'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>Air Draw ON</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawMode('view')}
              className={`flex min-w-[125px] cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                drawMode === 'view'
                  ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
                  : 'text-stone-500 hover:bg-white hover:text-violet-700'
              }`}
            >
              Tracking Only
            </button>
          </div>

          {drawMode === 'draw' && (
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2.5">
              <span className="text-xs font-medium text-stone-500">
                Trigger
              </span>

              <select
                value={drawingTrigger}
                onChange={(e) => setDrawingTrigger(e.target.value)}
                className="max-w-full cursor-pointer bg-transparent text-xs font-semibold text-violet-700 outline-none focus:ring-1 focus:ring-violet-300"
              >
                <option value="point">☝️ Point to Draw (Index finger)</option>
                <option value="pinch">👌 Pinch to Draw (Thumb + Index)</option>
                <option value="always">✍️ Continuous Trail</option>
              </select>
            </div>
          )}
        </div>

        {drawMode === 'draw' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2.5">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setBrushColor(color.value);
                    setIsEraser(false);
                  }}
                  className={`h-7 w-7 shrink-0 cursor-pointer rounded-full border transition-all ${
                    !isEraser && brushColor === color.value
                      ? 'scale-110 border-white ring-2 ring-violet-500 ring-offset-1'
                      : 'border-stone-200 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}

              <button
                type="button"
                onClick={() => {
                  setBrushColor('multicolor');
                  setIsEraser(false);
                }}
                className={`h-7 w-7 shrink-0 cursor-pointer rounded-full border border-white transition-all ${
                  !isEraser && isMulticolor
                    ? 'scale-110 ring-2 ring-violet-500 ring-offset-1'
                    : 'hover:scale-110'
                }`}
                style={{
                  background:
                    'conic-gradient(from 0deg, #f43f5e, #eab308, #84cc16, #06b6d4, #3b82f6, #a855f7, #f43f5e)',
                }}
                title="Multicolor"
                aria-label="Multicolor"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                isEraser
                  ? 'border-violet-300 bg-violet-100 text-violet-700'
                  : 'border-violet-100 bg-white text-stone-500 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700'
              }`}
              title="Eraser Tool"
              aria-label="Eraser Tool"
            >
              <Eraser className="h-4 w-4" />
            </button>

            <div
              className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2.5"
              title={`Brush size: ${brushSize}px`}
            >
              <span className="text-xs font-medium text-stone-500">
                Size
              </span>

              <input
                aria-label="Brush size"
                type="range"
                min="2"
                max="32"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 cursor-pointer accent-violet-600"
              />

              <span className="w-5 text-right text-xs font-semibold text-violet-700">
                {brushSize}
              </span>
            </div>

            <div className="hidden items-center gap-1 rounded-xl border border-violet-100 bg-violet-50/60 p-1 sm:flex">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setBrushSize(size.value)}
                  className={`min-w-[58px] cursor-pointer rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${
                    brushSize === size.value
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-stone-500 hover:bg-white hover:text-violet-700'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
              showLandmarks
                ? 'border-violet-200 bg-violet-100 text-violet-700'
                : 'border-violet-100 bg-white text-stone-500 hover:bg-violet-50 hover:text-violet-700'
            }`}
            title={showLandmarks ? 'Landmarks visible' : 'Landmarks hidden'}
            aria-label="Toggle landmarks"
          >
            {showLandmarks ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
              isMirrored
                ? 'border-violet-200 bg-violet-100 text-violet-700'
                : 'border-violet-100 bg-white text-stone-500 hover:bg-violet-50 hover:text-violet-700'
            }`}
            title={isMirrored ? 'Camera Mirrored (Selfie)' : 'Camera Normal'}
            aria-label="Toggle camera mirror"
          >
            <FlipHorizontal className="h-4 w-4" />
          </button>

          {drawMode === 'draw' && (
            <>
              <button
                type="button"
                onClick={onUndo}
                className="cursor-pointer rounded-xl border border-violet-100 bg-white p-2.5 text-stone-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                title="Undo last stroke"
                aria-label="Undo last stroke"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClear}
                className="cursor-pointer rounded-xl border border-violet-100 bg-white p-2.5 text-stone-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                title="Clear Canvas"
                aria-label="Clear canvas"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onCapture}
            className="flex min-w-[105px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            title="Capture current camera frame as PNG"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            title="Download drawing as PNG"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>

          <button
            type="button"
            onClick={onSaveCloud}
            disabled={isSaving}
            className="flex min-w-[125px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            title="Save drawing to MongoDB Cloud Account"
          >
            <CloudUpload className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Cloud'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}