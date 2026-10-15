export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];
export const LANDMARK_NAMES = [
  'Wrist',
  'Thumb CMC', 'Thumb MCP', 'Thumb IP', 'Thumb Tip',
  'Index MCP', 'Index PIP', 'Index DIP', 'Index Tip',
  'Middle MCP', 'Middle PIP', 'Middle DIP', 'Middle Tip',
  'Ring MCP', 'Ring PIP', 'Ring DIP', 'Ring Tip',
  'Pinky MCP', 'Pinky PIP', 'Pinky DIP', 'Pinky Tip'
];


export function euclideanDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


export function getExtendedFingers(landmarks, handedness = 'Right') {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false, count: 0 };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const thumbMCP = landmarks[2];
  const pinkyMCP = landmarks[17];
  const indexMCP = landmarks[5];
  const distThumbToPinky = euclideanDistance(thumbTip, pinkyMCP);
  const distThumbIPToPinky = euclideanDistance(thumbIP, pinkyMCP);
  const distThumbToWrist = euclideanDistance(thumbTip, wrist);
  const distThumbMCPToWrist = euclideanDistance(thumbMCP, wrist);
  const thumb = distThumbToPinky > distThumbIPToPinky * 1.12 && distThumbToWrist > distThumbMCPToWrist * 1.15;
  const distIndexTip = euclideanDistance(landmarks[8], wrist);
  const distIndexPIP = euclideanDistance(landmarks[6], wrist);
  const distIndexMCP = euclideanDistance(landmarks[5], wrist);
  const index = distIndexTip > distIndexPIP * 1.12 && distIndexTip > distIndexMCP;

  const distMiddleTip = euclideanDistance(landmarks[12], wrist);
  const distMiddlePIP = euclideanDistance(landmarks[10], wrist);
  const distMiddleMCP = euclideanDistance(landmarks[9], wrist);
  const middle = distMiddleTip > distMiddlePIP * 1.12 && distMiddleTip > distMiddleMCP;

  const distRingTip = euclideanDistance(landmarks[16], wrist);
  const distRingPIP = euclideanDistance(landmarks[14], wrist);
  const distRingMCP = euclideanDistance(landmarks[13], wrist);
  const ring = distRingTip > distRingPIP * 1.12 && distRingTip > distRingMCP;

  const distPinkyTip = euclideanDistance(landmarks[20], wrist);
  const distPinkyPIP = euclideanDistance(landmarks[18], wrist);
  const distPinkyMCP = euclideanDistance(landmarks[17], wrist);
  const pinky = distPinkyTip > distPinkyPIP * 1.12 && distPinkyTip > distPinkyMCP;

  const count = [thumb, index, middle, ring, pinky].filter(Boolean).length;

  return { thumb, index, middle, ring, pinky, count };
}


export function recognizeGesture(landmarks, extendedFingers) {
  if (!landmarks || landmarks.length < 21) {
    return { name: 'None', confidence: 0, description: 'No hand detected' };
  }

  const { thumb, index, middle, ring, pinky, count } = extendedFingers;
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexTip = landmarks[8];
  const indexMCP = landmarks[5];
  if (count === 0) {
    return {
      name: 'Fist',
      emoji: '✊',
      description: 'All fingers curled tightly into palm',
      color: '#ef4444',
    };
  }
  const isThumbPointingUp = thumbTip.y < thumbIP.y && thumbTip.y < indexMCP.y && thumbTip.y < wrist.y;
  if (!index && !middle && !ring && !pinky && (thumb || isThumbPointingUp)) {
    return {
      name: 'Thumbs Up',
      emoji: '👍',
      description: 'Thumb pointing upward with fist closed',
      color: '#10b981',
    };
  }
  if (index && middle && !ring && !pinky) {
    return {
      name: 'Peace Sign',
      emoji: '✌️',
      description: 'Index and Middle fingers extended in V shape',
      color: '#3b82f6',
    };
  }
  if (count === 5 || (count === 4 && index && middle && ring && pinky)) {
    return {
      name: 'Open Palm',
      emoji: '✋',
      description: 'All five fingers spread and extended',
      color: '#06b6d4',
    };
  }
  if (index && !middle && !ring && !pinky) {
    return {
      name: 'Pointing / Draw',
      emoji: '☝️',
      description: 'Index finger pointing forward (Air Draw active)',
      color: '#8b5cf6',
    };
  }
  if (index && pinky && !middle && !ring) {
    return {
      name: 'Rock On',
      emoji: '🤘',
      description: 'Index and Pinky fingers extended',
      color: '#ec4899',
    };
  }
  return {
    name: `${count} Fingers`,
    emoji: '🖐️',
    description: `${count} fingers currently extended`,
    color: '#eab308',
  };
}


export function drawHandLandmarks(ctx, landmarks, options = {}) {
  const {
    width,
    height,
    isMirrored = true,
    handIndex = 0,
    accentColor = handIndex === 0 ? '#38bdf8' : '#a855f7',
  } = options;

  if (!landmarks || landmarks.length < 21) return;
  const getCanvasCoords = (lm) => {
    const x = isMirrored ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    return { x, y };
  };
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = accentColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 8;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = getCanvasCoords(landmarks[startIdx]);
    const end = getCanvasCoords(landmarks[endIdx]);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  ctx.restore();
  landmarks.forEach((lm, index) => {
    const { x, y } = getCanvasCoords(lm);
    ctx.save();
    const isFingertip = [4, 8, 12, 16, 20].includes(index);
    const isIndexTip = index === 8;

    if (isIndexTip) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (isFingertip) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  });
}
