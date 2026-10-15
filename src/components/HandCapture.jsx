import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  Camera,
  CameraOff,
  RefreshCw,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import {
  drawHandLandmarks,
  getExtendedFingers,
  recognizeGesture,
  euclideanDistance,
} from '../utils/handDetection.js';
import DrawingToolbar from './DrawingToolbar.jsx';

export default function HandCapture({
  onHandsDetected,
  onSaveDrawing,
  isSaving,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastPointRef = useRef(null);
  const lastToolRef = useRef(null);
  const strokesHistoryRef = useRef([]);
  const lastHandsOutputRef = useRef([]);
  const autoStartAttemptedRef = useRef(false);
  const cameraRequestRef = useRef(0);

  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [drawMode, setDrawMode] = useState('draw');
  const [drawingTrigger, setDrawingTrigger] = useState('point');
  const [brushColor, setBrushColor] = useState('#0ea5e9');
  const [brushSize, setBrushSize] = useState(7);
  const [isEraser, setIsEraser] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isPenDown, setIsPenDown] = useState(false);
  const [currentGestureName, setCurrentGestureName] = useState('None');
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let createdLandmarker = null;

    async function initMediaPipe() {
      try {
        setIsModelLoading(true);
        setModelError(null);

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isMounted) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        createdLandmarker = landmarker;

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsModelLoading(false);
        } else {
          landmarker.close();
        }
      } catch (err) {
        console.error('Hand tracking initialization failed:', err);

        if (isMounted) {
          setModelError(
            'Failed to load the hand tracking model. Check your internet connection and try again.'
          );
          setIsModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;

      if (createdLandmarker) {
        createdLandmarker.close();
      } else if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }

      landmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function getCameras() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;

        const allDevices =
          await navigator.mediaDevices.enumerateDevices();

        if (!isMounted) return;

        const videoInputs = allDevices.filter(
          (device) => device.kind === 'videoinput'
        );

        setDevices(videoInputs);

        if (videoInputs.length > 0) {
          setSelectedDeviceId((currentId) => {
            if (
              currentId &&
              videoInputs.some((device) => device.deviceId === currentId)
            ) {
              return currentId;
            }

            return videoInputs[0].deviceId;
          });
        }
      } catch (err) {
        console.warn('Could not enumerate cameras:', err);
      }
    }

    getCameras();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveUndoSnapshot = useCallback(() => {
    if (!drawingCanvasRef.current) return;

    const ctx = drawingCanvasRef.current.getContext('2d');

    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      drawingCanvasRef.current.width,
      drawingCanvasRef.current.height
    );

    strokesHistoryRef.current.push(imageData);

    if (strokesHistoryRef.current.length > 30) {
      strokesHistoryRef.current.shift();
    }
  }, []);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;

    const video = videoRef.current;

    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (video) {
      video.onloadedmetadata = null;
    }

    setCameraActive(false);
    setIsPenDown(false);
    setFps(0);

    lastPointRef.current = null;
    lastToolRef.current = null;
    lastVideoTimeRef.current = -1;
    lastHandsOutputRef.current = [];

    if (onHandsDetected) {
      onHandsDetected([]);
    }
  }, [onHandsDetected]);

  const startCamera = useCallback(async () => {
    const requestId = ++cameraRequestRef.current;
    let stream = null;

    try {
      setCameraError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera access is not supported here. Open the app on localhost or use a supported browser.'
        );
        return;
      }

      const video = videoRef.current;

      if (!video) {
        setCameraError(
          'Camera preview is not ready. Refresh the page and try again.'
        );
        return;
      }

      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }

      setCameraActive(false);

      const preferredConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: 'user' }),
        },
        audio: false,
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(
          preferredConstraints
        );
      } catch (firstError) {
        if (
          !selectedDeviceId ||
          firstError.name === 'NotAllowedError' ||
          firstError.name === 'PermissionDeniedError'
        ) {
          throw firstError;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });
      }

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      if (video.readyState < 1) {
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error('Camera timed out while loading.'));
          }, 10000);

          const cleanup = () => {
            window.clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
          };

          const onLoaded = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(
              new Error('The browser could not load the camera preview.')
            );
          };

          video.addEventListener('loadedmetadata', onLoaded, {
            once: true,
          });

          video.addEventListener('error', onError, {
            once: true,
          });
        });
      }

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());

        if (video.srcObject === stream) {
          video.srcObject = null;
        }

        return;
      }

      await video.play();

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());

        if (video.srcObject === stream) {
          video.srcObject = null;
        }

        return;
      }

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      if (canvasRef.current && drawingCanvasRef.current) {
        const previousCanvas = drawingCanvasRef.current;
        const previousWidth = previousCanvas.width;
        const previousHeight = previousCanvas.height;

        const savedDrawing = document.createElement('canvas');

        savedDrawing.width = previousWidth;
        savedDrawing.height = previousHeight;

        if (previousWidth > 0 && previousHeight > 0) {
          savedDrawing
            .getContext('2d')
            ?.drawImage(previousCanvas, 0, 0);
        }

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        previousCanvas.width = width;
        previousCanvas.height = height;

        if (savedDrawing.width > 0 && savedDrawing.height > 0) {
          previousCanvas.getContext('2d')?.drawImage(
            savedDrawing,
            0,
            0,
            savedDrawing.width,
            savedDrawing.height,
            0,
            0,
            width,
            height
          );
        }
      }

      lastVideoTimeRef.current = -1;
      lastHandsOutputRef.current = [];
      lastPointRef.current = null;
      lastToolRef.current = null;

      setCameraError(null);
      setCameraActive(true);

      try {
        const allDevices =
          await navigator.mediaDevices.enumerateDevices();

        if (requestId === cameraRequestRef.current) {
          setDevices(
            allDevices.filter((device) => device.kind === 'videoinput')
          );
        }
      } catch (err) {
        console.warn('Could not refresh camera list:', err);
      }
    } catch (err) {
      console.error('Camera access error:', err);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (requestId !== cameraRequestRef.current) {
        return;
      }

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        setCameraError(
          'Camera permission denied. Allow camera access in your browser settings, then try again.'
        );
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        setCameraError('No webcam was found on your device.');
      } else if (
        err.name === 'NotReadableError' ||
        err.name === 'TrackStartError'
      ) {
        setCameraError(
          'The camera may be in use by another app. Close other camera apps and try again.'
        );
      } else {
        setCameraError(
          `Unable to start camera: ${err.message || 'Unknown error'}`
        );
      }

      setCameraActive(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (
      !isModelLoading &&
      !modelError &&
      !autoStartAttemptedRef.current
    ) {
      autoStartAttemptedRef.current = true;
      startCamera();
    }
  }, [isModelLoading, modelError, startCamera]);

  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      const landmarker = landmarkerRef.current;

      if (
        cameraActive &&
        video &&
        canvas &&
        drawingCanvas &&
        landmarker &&
        video.readyState >= 2
      ) {
        const ctx = canvas.getContext('2d');
        const drawCtx = drawingCanvas.getContext('2d');

        if (!ctx || !drawCtx) {
          animFrameIdRef.current = requestAnimationFrame(loop);
          return;
        }

        const width = canvas.width;
        const height = canvas.height;

        frameCount++;

        const now = performance.now();

        if (now - lastFpsTime >= 1000) {
          setFps(
            Math.round((frameCount * 1000) / (now - lastFpsTime))
          );

          frameCount = 0;
          lastFpsTime = now;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();

        let handsOutput = lastHandsOutputRef.current;

        if (video.currentTime !== lastVideoTimeRef.current) {
          handsOutput = [];
          lastVideoTimeRef.current = video.currentTime;

          const detections = landmarker.detectForVideo(video, now);

          if (
            detections?.landmarks &&
            detections.landmarks.length > 0
          ) {
            detections.landmarks.forEach((landmarks, index) => {
              const handednessData =
                detections.handednesses?.[index]?.[0];

              const rawHand =
                handednessData?.displayName ||
                handednessData?.categoryName ||
                'Right';

              const actualHand = isMirrored
                ? rawHand === 'Left'
                  ? 'Right'
                  : 'Left'
                : rawHand;

              const extendedFingers = getExtendedFingers(
                landmarks,
                actualHand
              );

              const gesture = recognizeGesture(
                landmarks,
                extendedFingers
              );

              handsOutput.push({
                handIndex: index,
                handedness: actualHand,
                confidence: handednessData?.score || 0.9,
                landmarks,
                extendedFingers,
                gesture,
              });
            });
          }

          lastHandsOutputRef.current = handsOutput;
        }

        if (onHandsDetected) {
          onHandsDetected(handsOutput);
        }

        if (handsOutput.length > 0) {
          setCurrentGestureName(
            handsOutput[0].gesture?.name || 'Detected'
          );
        } else {
          setCurrentGestureName('No Hand in View');
        }

        if (showLandmarks && handsOutput.length > 0) {
          handsOutput.forEach((hand) => {
            drawHandLandmarks(ctx, hand.landmarks, {
              width,
              height,
              isMirrored,
              handIndex: hand.handIndex,
            });
          });
        }

        if (drawMode === 'draw' && handsOutput.length > 0) {
          const primaryHand = handsOutput[0];
          const landmarks = primaryHand.landmarks;
          const extendedFingers = primaryHand.extendedFingers;

          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];

          const gestureEraser = Boolean(
            extendedFingers.index &&
              extendedFingers.middle &&
              extendedFingers.ring &&
              extendedFingers.pinky
          );

          const activeEraser = isEraser || gestureEraser;

          const palmPoint = {
            x:
              (landmarks[0].x +
                landmarks[5].x +
                landmarks[9].x +
                landmarks[13].x +
                landmarks[17].x) /
              5,
            y:
              (landmarks[0].y +
                landmarks[5].y +
                landmarks[9].y +
                landmarks[13].y +
                landmarks[17].y) /
              5,
          };

          const cursorPoint = gestureEraser ? palmPoint : indexTip;

          const fx = isMirrored
            ? (1 - cursorPoint.x) * width
            : cursorPoint.x * width;

          const fy = cursorPoint.y * height;

          let penActive = false;

          if (drawingTrigger === 'point') {
            penActive =
              extendedFingers.index && !extendedFingers.middle;
          } else if (drawingTrigger === 'pinch') {
            const pinchDistance = euclideanDistance(
              indexTip,
              thumbTip
            );

            penActive = pinchDistance < 0.08;
          } else if (drawingTrigger === 'always') {
            penActive = true;
          }

          if (gestureEraser) {
            penActive = true;
          }

          if (lastToolRef.current !== activeEraser) {
            lastPointRef.current = null;
            lastToolRef.current = activeEraser;
          }

          setIsPenDown(Boolean(penActive));

          if (penActive) {
            drawCtx.save();

            if (activeEraser) {
              drawCtx.globalCompositeOperation = 'destination-out';
              drawCtx.lineWidth = Math.max(brushSize * 3, 26);
            } else {
              drawCtx.globalCompositeOperation = 'source-over';

              if (brushColor === 'multicolor') {
                const gradient = drawCtx.createLinearGradient(
                  fx - brushSize * 2,
                  fy - brushSize * 2,
                  fx + brushSize * 2,
                  fy + brushSize * 2
                );

                gradient.addColorStop(0, '#f43f5e');
                gradient.addColorStop(0.2, '#f97316');
                gradient.addColorStop(0.4, '#facc15');
                gradient.addColorStop(0.6, '#22c55e');
                gradient.addColorStop(0.8, '#8b5cf6');
                gradient.addColorStop(1, '#ec4899');

                drawCtx.strokeStyle = gradient;
                drawCtx.fillStyle = gradient;
                drawCtx.shadowColor = '#0ea5e9';
              } else {
                drawCtx.strokeStyle = brushColor;
                drawCtx.fillStyle = brushColor;
                drawCtx.shadowColor = brushColor;
              }

              drawCtx.lineWidth = brushSize;
              drawCtx.shadowBlur = brushSize > 8 ? 8 : 4;
            }

            drawCtx.lineCap = 'round';
            drawCtx.lineJoin = 'round';

            if (lastPointRef.current) {
              drawCtx.beginPath();

              drawCtx.moveTo(
                lastPointRef.current.x,
                lastPointRef.current.y
              );

              drawCtx.lineTo(fx, fy);
              drawCtx.stroke();
            } else {
              saveUndoSnapshot();

              drawCtx.beginPath();

              drawCtx.arc(
                fx,
                fy,
                activeEraser
                  ? Math.max(brushSize * 1.5, 13)
                  : brushSize / 2,
                0,
                Math.PI * 2
              );

              drawCtx.fill();
            }

            drawCtx.restore();

            lastPointRef.current = { x: fx, y: fy };
          } else {
            lastPointRef.current = null;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(fx, fy, penActive ? 12 : 18, 0, Math.PI * 2);

          ctx.strokeStyle = penActive
            ? activeEraser
              ? '#f43f5e'
              : brushColor === 'multicolor'
                ? '#38bdf8'
                : brushColor
            : 'rgba(255, 255, 255, 0.75)';

          ctx.lineWidth = penActive ? 3 : 2;

          if (penActive) {
            ctx.shadowColor = activeEraser
              ? '#f43f5e'
              : brushColor === 'multicolor'
                ? '#38bdf8'
                : brushColor;

            ctx.shadowBlur = 10;
          }

          ctx.stroke();

          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);

          ctx.fillStyle = penActive
            ? '#ffffff'
            : 'rgba(255, 255, 255, 0.9)';

          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(30, 20, 50, 0.88)';

          if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(fx - 45, fy - 36, 90, 22, 6);
            ctx.fill();
          }

          ctx.fillStyle = penActive
            ? activeEraser
              ? '#fb7185'
              : '#7dd3fc'
            : '#d6d3d1';

          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';

          ctx.fillText(
            penActive
              ? activeEraser
                ? 'ERASING'
                : 'DRAWING'
              : 'READY',
            fx,
            fy - 21
          );

          ctx.restore();
        } else {
          lastPointRef.current = null;
          setIsPenDown(false);
        }

        ctx.drawImage(drawingCanvas, 0, 0);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    cameraActive,
    drawMode,
    drawingTrigger,
    brushColor,
    brushSize,
    isEraser,
    showLandmarks,
    isMirrored,
    onHandsDetected,
    saveUndoSnapshot,
  ]);

  const handleUndo = () => {
    if (
      !drawingCanvasRef.current ||
      strokesHistoryRef.current.length === 0
    ) {
      return;
    }

    const ctx = drawingCanvasRef.current.getContext('2d');
    const previousState = strokesHistoryRef.current.pop();

    if (!ctx || !previousState) return;

    ctx.putImageData(previousState, 0, 0);
    lastPointRef.current = null;
  };

  const handleClear = () => {
    if (!drawingCanvasRef.current) return;

    saveUndoSnapshot();
    lastPointRef.current = null;

    const ctx = drawingCanvasRef.current.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      drawingCanvasRef.current.width,
      drawingCanvasRef.current.height
    );
  };

  const handleDownload = () => {
    if (!drawingCanvasRef.current) return;

    const exportCanvas = document.createElement('canvas');

    exportCanvas.width = drawingCanvasRef.current.width;
    exportCanvas.height = drawingCanvasRef.current.height;

    const exportCtx = exportCanvas.getContext('2d');

    if (!exportCtx) return;

    const gradient = exportCtx.createLinearGradient(
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    gradient.addColorStop(0, '#171026');
    gradient.addColorStop(1, '#302044');

    exportCtx.fillStyle = gradient;
    exportCtx.fillRect(
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    exportCtx.drawImage(drawingCanvasRef.current, 0, 0);

    exportCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    exportCtx.font = '14px system-ui, sans-serif';

    exportCtx.fillText(
      'Created with Hand Nova',
      20,
      exportCanvas.height - 20
    );

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.href = dataUrl;
    link.download = `hand-drawing-${Date.now()}.png`;
    link.click();
  };

  const handleCapture = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');

    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `hand-capture-${Date.now()}.png`;
    link.click();
  };

  const handleSaveCloud = () => {
    if (!drawingCanvasRef.current) return;

    const dataUrl = drawingCanvasRef.current.toDataURL('image/png');

    if (onSaveDrawing) {
      onSaveDrawing({
        dataUrl,
        strokeCount: strokesHistoryRef.current.length + 1,
        gesturesUsed: [currentGestureName],
      });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  };

  return (
    <div className="space-y-5">
      <div
        ref={containerRef}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-lg shadow-violet-100/60"
      >
        <video ref={videoRef} playsInline muted className="hidden" />

        <canvas ref={drawingCanvasRef} className="hidden" />

        <canvas
          ref={canvasRef}
          className="block h-full w-full bg-stone-50 object-contain"
        />

        <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
          <div className="pointer-events-auto flex max-w-[60%] items-center gap-2 rounded-2xl border border-violet-100 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur-md">
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-violet-500" />

            <span className="text-xs font-semibold text-stone-500">
              Gesture:
            </span>

            <span className="truncate text-xs font-bold text-violet-700">
              {currentGestureName}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {drawMode === 'draw' && (
              <div
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-colors ${
                  isPenDown
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-stone-100 bg-white/95 text-stone-600'
                }`}
              >
                <span className="text-sm">{isPenDown ? '✍️' : '✋'}</span>
                <span>{isPenDown ? 'DRAWING' : 'HOVER'}</span>
              </div>
            )}

            {devices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(event) => {
                  setSelectedDeviceId(event.target.value);
                }}
                className="max-w-32 cursor-pointer rounded-xl border border-violet-100 bg-white/95 px-2.5 py-2 text-xs text-stone-700 outline-none transition focus:ring-2 focus:ring-violet-200"
                aria-label="Select camera"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-xl border border-violet-100 bg-white/95 p-2.5 text-violet-700 shadow-sm transition hover:bg-violet-50"
              title="Fullscreen Mode"
              aria-label="Fullscreen Mode"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isModelLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50">
              <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
            </div>

            <h3 className="text-lg font-bold text-stone-800">
              Loading Hand Tracker
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-6 text-stone-500">
              Preparing the hand tracking model. Processing runs inside your
              browser.
            </p>
          </div>
        )}

        {modelError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-md">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>

            <h3 className="text-base font-bold text-stone-800">
              Model Loading Failed
            </h3>

            <p className="mt-2 max-w-md text-xs leading-6 text-stone-500">
              {modelError}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Retry
            </button>
          </div>
        )}

        {!isModelLoading && cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-md">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
              <CameraOff className="h-8 w-8 text-amber-600" />
            </div>

            <h3 className="text-base font-bold text-stone-800">
              Camera Access Required
            </h3>

            <p className="mt-2 max-w-md text-xs leading-6 text-stone-500">
              {cameraError}
            </p>

            <button
              type="button"
              onClick={startCamera}
              className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
            >
              <Camera className="h-4 w-4" />
              <span>Grant Access &amp; Start Camera</span>
            </button>
          </div>
        )}

        {!isModelLoading &&
          !modelError &&
          !cameraError &&
          !cameraActive && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-md">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50">
                <Camera className="h-8 w-8 text-violet-600" />
              </div>

              <h3 className="text-base font-bold text-stone-800">
                Webcam Is Paused
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-stone-500">
                Start your camera to resume live hand tracking and virtual
                canvas drawing.
              </p>

              <button
                type="button"
                onClick={startCamera}
                className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                <Camera className="h-4 w-4" />
                <span>Start Camera</span>
              </button>
            </div>
          )}

        {cameraActive && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 opacity-90 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              <span>{fps} FPS</span>
            </div>

            <button
              type="button"
              onClick={stopCamera}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <CameraOff className="h-3.5 w-3.5" />
              <span>Pause Camera</span>
            </button>
          </div>
        )}
      </div>

      <DrawingToolbar
        drawMode={drawMode}
        setDrawMode={setDrawMode}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        onClear={handleClear}
        onUndo={handleUndo}
        onDownload={handleDownload}
        onCapture={handleCapture}
        onSaveCloud={handleSaveCloud}
        showLandmarks={showLandmarks}
        setShowLandmarks={setShowLandmarks}
        isMirrored={isMirrored}
        setIsMirrored={setIsMirrored}
        drawingTrigger={drawingTrigger}
        setDrawingTrigger={setDrawingTrigger}
        isSaving={isSaving}
      />
    </div>
  );
}