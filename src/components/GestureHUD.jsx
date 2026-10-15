import React from 'react';
import { Activity, Hand, Check } from 'lucide-react';

export default function GestureHUD({
  handsData = [],
  fps = 0,
  isTracking = false,
}) {
  const totalFingers = handsData.reduce(
    (acc, hand) => acc + (hand.extendedFingers?.count || 0),
    0
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-lg shadow-violet-100/40 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-violet-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity
              className={`h-4 w-4 ${
                isTracking
                  ? 'animate-pulse text-violet-600'
                  : 'text-violet-300'
              }`}
            />

            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Live Detection Status
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500">Rate:</span>
            <span className="font-mono font-bold text-violet-700">
              {fps} FPS
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
            <span className="text-[11px] font-medium text-stone-500">
              Hands In View
            </span>

            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-violet-700">
                {handsData.length}
              </span>

              <span className="text-xs text-stone-500">/ 2 max</span>
            </div>
          </div>

          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
            <span className="text-[11px] font-medium text-stone-500">
              Total Fingers
            </span>

            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-2xl font-black text-transparent">
                {handsData.length > 0 ? totalFingers : 0}
              </span>

              <span className="text-xs text-stone-500">/ 10</span>
            </div>
          </div>
        </div>
      </div>

      {handsData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-white/80 p-6 text-center text-stone-500">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-violet-100 bg-violet-50">
            <Hand className="h-6 w-6 animate-bounce text-violet-600" />
          </div>

          <h4 className="text-sm font-semibold text-stone-700">
            No Hands in Frame
          </h4>

          <p className="mx-auto mt-1 max-w-xs text-xs text-stone-500">
            Place one or two hands within the webcam area with good lighting.
          </p>
        </div>
      ) : (
        handsData.map((hand, idx) => {
          const { handedness, extendedFingers, gesture } = hand;

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-violet-200 bg-white/95 p-4 shadow-lg shadow-violet-100/40 backdrop-blur-sm transition-all hover:border-violet-300"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                    Hand {idx + 1} • {handedness}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-xs text-stone-500">Fingers:</span>

                  <span className="rounded-lg border border-violet-200 bg-violet-600 px-2 py-0.5 text-base font-black text-white">
                    {extendedFingers?.count ?? 0}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="mb-1 block text-[10px] font-semibold uppercase text-stone-500">
                  Detected Gesture
                </span>

                <div
                  className="flex items-center justify-between rounded-xl border p-2.5"
                  style={{
                    backgroundColor: `${gesture?.color || '#7c3aed'}15`,
                    borderColor: `${gesture?.color || '#7c3aed'}40`,
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">
                      {gesture?.emoji || '✋'}
                    </span>

                    <div>
                      <div
                        className="text-sm font-bold tracking-tight"
                        style={{
                          color: gesture?.color || '#6d28d9',
                        }}
                      >
                        {gesture?.name || 'Unknown'}
                      </div>

                      <div className="text-[11px] text-stone-500">
                        {gesture?.description || 'Evaluating hand pose'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-[10px] font-semibold uppercase text-stone-500">
                  Finger States (T / I / M / R / P)
                </span>

                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Thumb', key: 'thumb', letter: 'T' },
                    { label: 'Index', key: 'index', letter: 'I' },
                    { label: 'Middle', key: 'middle', letter: 'M' },
                    { label: 'Ring', key: 'ring', letter: 'R' },
                    { label: 'Pinky', key: 'pinky', letter: 'P' },
                  ].map((finger) => {
                    const isOpen = extendedFingers?.[finger.key];

                    return (
                      <div
                        key={finger.key}
                        className={`flex flex-col items-center rounded-lg border px-1 py-1.5 text-center transition-all ${
                          isOpen
                            ? 'border-violet-200 bg-violet-600 font-bold text-white shadow-sm shadow-violet-200'
                            : 'border-stone-200 bg-stone-50 text-stone-500'
                        }`}
                        title={`${finger.label}: ${
                          isOpen ? 'Extended (Open)' : 'Curled (Closed)'
                        }`}
                      >
                        <span className="font-mono text-xs">
                          {finger.letter}
                        </span>

                        <span className="mt-0.5 text-[9px] opacity-80">
                          {isOpen ? 'UP' : 'DOWN'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-lg shadow-violet-100/40">
        <div className="mb-3 flex items-center space-x-2">
          <Check className="h-4 w-4 text-violet-600" />

          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Required Gestures Reference
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2 rounded-xl border border-violet-100 bg-violet-50/50 p-2">
            <span className="text-xl">✋</span>

            <div>
              <p className="font-semibold text-stone-700">Open Palm</p>
              <p className="text-[10px] text-stone-500">
                Four fingers or all five open
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-xl border border-violet-100 bg-violet-50/50 p-2">
            <span className="text-xl">✊</span>

            <div>
              <p className="font-semibold text-stone-700">Fist</p>
              <p className="text-[10px] text-stone-500">
                0 fingers open
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-xl border border-violet-100 bg-violet-50/50 p-2">
            <span className="text-xl">✌️</span>

            <div>
              <p className="font-semibold text-stone-700">Peace Sign</p>
              <p className="text-[10px] text-stone-500">
                Index &amp; Middle open
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-xl border border-violet-100 bg-violet-50/50 p-2">
            <span className="text-xl">👍</span>

            <div>
              <p className="font-semibold text-stone-700">Thumbs Up</p>
              <p className="text-[10px] text-stone-500">
                Thumb up, fist closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}