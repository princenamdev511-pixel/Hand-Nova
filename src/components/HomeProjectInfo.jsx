import React from 'react';
import {
  Cpu,
  Camera,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function HomeProjectInfo({ onStartStudio }) {
  const features = [
    {
      title: 'Live Webcam Capture',
      desc: 'Capture live video through your browser camera with camera selection and mirror mode.',
      icon: '📹',
    },
    {
      title: '21 Hand Landmarks',
      desc: 'Track 21 hand landmarks in real time, from the wrist to the fingertips.',
      icon: '🖐️',
    },
    {
      title: 'Finger Counting',
      desc: 'Detect the number of extended fingers from zero to five.',
      icon: '🔢',
    },
    {
      title: 'Gesture Recognition',
      desc: 'Recognize gestures such as Open Palm, Fist, Peace Sign, Thumbs Up, and Pointing.',
      icon: '✌️',
    },
    {
      title: 'Dual Hand Tracking',
      desc: 'Track up to two hands simultaneously with individual hand detection.',
      icon: '👐',
    },
    {
      title: 'Virtual Air Drawing',
      desc: 'Draw in the air using your index fingertip, with brush colors and an eraser.',
      icon: '🎨',
    },
    {
      title: 'Live HUD Dashboard',
      desc: 'View detected gestures, finger counts, FPS, and hand tracking status.',
      icon: '📊',
    },
    {
      title: 'Cloud Drawing Storage',
      desc: 'Save and access drawings through the connected backend and database.',
      icon: '☁️',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Hand Capture Studio
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
            Hand Capture
            <span className="mt-2 block bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
              Studio
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
            Track hand movements, recognize gestures, count fingers, and draw
            in the air using your fingertips. Explore an interactive hand
            tracking experience with real-time visual feedback.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStartStudio}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
            >
              <Camera className="h-4 w-4" />
              <span>Launch Hand Capture</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-stone-500">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-600" />
              Real-Time Tracking
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-600" />
              Gesture Recognition
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-600" />
              Air Drawing
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
              What You Can Do
            </span>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-800 sm:text-3xl">
              Studio Features
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
              Explore the tools and capabilities available in Hand Capture
              Studio.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-medium text-stone-600">
            <Cpu className="h-4 w-4 text-violet-600" />
            Interactive Experience
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-stone-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-stone-50 text-2xl transition-colors group-hover:border-violet-200 group-hover:bg-violet-50">
                  {item.icon}
                </div>

                <span className="text-xs font-semibold text-violet-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-stone-800">
                {item.title}
              </h3>

              <p className="mt-2 text-xs leading-6 text-stone-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
            <Cpu className="h-7 w-7" />
          </div>

          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
              How It Works
            </span>

            <h2 className="mt-2 text-xl font-extrabold text-stone-800 sm:text-2xl">
              Real-Time Hand Tracking
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
              The application uses browser-based hand tracking to detect hand
              landmarks and gestures. Interact with the virtual canvas using
              your hand movements and fingertip positions.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    Live Detection
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Track hand positions through your camera.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    Smart Gestures
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Recognize gestures and count extended fingers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    Air Canvas
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Draw using hand movements and drawing tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}