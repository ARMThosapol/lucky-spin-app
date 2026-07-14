import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  History as HistoryIcon,
  Check,
  X,
  Award,
  List,
  HelpCircle,
  Info,
  ChevronRight
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface WheelOption {
  id: string;
  text: string;
  color: string;
  enabled: boolean;
}

export interface SpinHistory {
  id: string;
  optionText: string;
  timestamp: string;
}

export interface WheelPreset {
  name: string;
  icon: string;
  options: string[];
  colors?: string[];
}

// ==========================================
// PRESETS & COLORS UTILS
// ==========================================
export const COLOR_PALETTE = [
  '#FF6B6B', // Soft Coral Coral Red
  '#FFB84C', // Sunny Yellow-Orange
  '#30E3CA', // Mint Turquoise
  '#4D96FF', // Royal Sky Blue
  '#AA77FF', // Radiant Purple
  '#F473B9', // Flamingo Pink
  '#F169E2', // Orchid Magenta
  '#6BCB77', // Emerald Green
  '#FF9F9F', // Light Pink Peach
  '#118AB2', // Ocean Teal
];

export const PRESETS: WheelPreset[] = [
  {
    name: "🍽️ คิดไม่ออก กินอะไรดี? (Food Decision)",
    icon: "Utensils",
    options: [
      "กะเพราไข่ดาว 🍳",
      "ส้มตำไก่ย่าง 🍗",
      "หมูกระทะ / ชาบู 🥩",
      "ก๋วยเตี๋ยวเรือต้มยำ 🍜",
      "สลัดผักเพื่อสุขภาพ 🥗",
      "ซูชิ / อาหารญี่ปุ่น 🍣",
      "พิซซ่า / แฮมเบอร์เกอร์ 🍕",
      "ข้าวผัดปูจานด่วน 🦀"
    ]
  },
  {
    name: "💸 ใครจ่ายตังค์มื้อนี้? (Who Pays?)",
    icon: "DollarSign",
    options: [
      "ฉันเอง (สายเปย์) 😎",
      "หารเท่ากัน (American Share) 🤝",
      "คนทางซ้ายมือ 👈",
      "คนทางขวามือ 👉",
      "รอดไป! คนที่อายุน้อยสุดจ่าย 👶",
      "บอสใหญ่ใจดีเลี้ยง 🙏"
    ]
  },
  {
    name: "❓ ใช่ หรือ ไม่? (Yes / No / Maybe)",
    icon: "HelpCircle",
    options: [
      "ใช่เลย ทำเลย! ✅",
      "อย่าหาทำ ไม่เด็ดขาด ❌",
      "เดี๋ยวค่อยว่ากัน ⏳",
      "ลองสุ่มใหม่อีกที 🔄"
    ],
    colors: ['#6BCB77', '#FF6B6B', '#FFB84C', '#4D96FF']
  },
  {
    name: "🎬 กิจกรรมวันหยุดสุดสัปดาห์ (Weekend Activity)",
    icon: "Compass",
    options: [
      "นอนอืดอยู่บ้านพักผ่อน 😴",
      "ไปคาเฟ่ชิคๆ ถ่ายรูป 📸",
      "ดูซีรีส์ Netflix มาราธอน 🍿",
      "ออกกำลังกาย ฟิตหุ่น 🏋️‍♂️",
      "อ่านหนังสือพัฒนาตัวเอง 📖",
      "ออกไปช้อปปิ้งละลายทรัพย์ 🛍️",
      "จัดห้อง เคลียร์บ้าน 🧹",
      "เล่นเกมกับเดอะแก๊ง 🎮"
    ]
  },
  {
    name: "🎲 เลขนำโชคสุ่มดวง (Lucky Numbers 1-10)",
    icon: "Hash",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  }
];

export function getOptionColor(index: number, total: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// ==========================================
// SOUND UTILS
// ==========================================
class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playTick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch (e) {
      // Ignore audio errors gracefully
    }
  }

  public playWin() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.15, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } catch (e) {
      // Ignore audio errors gracefully
    }
  }
}

export const soundManager = new SoundManager();

// ==========================================
// TEXT WRAPPING & SPLITTING HELPERS
// ==========================================
function chunkText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    lines.push(text.substring(i, i + maxChars));
  }
  return lines;
}

function splitTextIntoLines(text: string, maxChars: number): string[] {
  if (text.includes(' ')) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (!word) continue;
      if (currentLine === '') {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxChars) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    if (lines.some(l => l.length > maxChars + 3)) {
      return chunkText(text, maxChars);
    }
    return lines;
  }
  
  return chunkText(text, maxChars);
}

// ==========================================
// CONFETTI COMPONENT
// ==========================================
interface ConfettiProps {
  active: boolean;
}

function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F473B9', '#AA77FF',
      '#FF9F9F', '#30E3CA', '#118AB2', '#FFD166', '#EF476F', '#06D6A0'
    ];

    interface Particle {
      x: number;
      y: number;
      r: number;
      d: number;
      color: string;
      tilt: number;
      tiltAngleIncremental: number;
      tiltAngle: number;
      speedX: number;
      speedY: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 150;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height - 100,
        r: Math.random() * 5 + 4,
        d: Math.random() * maxParticles + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.05 + 0.02,
        tiltAngle: 0,
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speedY + Math.sin(p.tiltAngle) * 0.5;
        p.x += p.speedX + Math.cos(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

        if (p.y > height) {
          particles[i] = {
            ...p,
            x: Math.random() * width,
            y: -20,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 4 - 2
          };
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}

// ==========================================
// SPINWHEEL COMPONENT
// ==========================================
interface SpinWheelProps {
  options: WheelOption[];
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  onSpinComplete: (winner: WheelOption) => void;
  soundEnabled: boolean;
}

function SpinWheel({
  options,
  isSpinning,
  setIsSpinning,
  onSpinComplete,
  soundEnabled,
}: SpinWheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentRotationRef = useRef<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  const enabledOptions = options.filter(o => o.enabled);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const spin = () => {
    if (isSpinning || enabledOptions.length < 2) return;

    setIsSpinning(true);
    soundManager.setEnabled(soundEnabled);

    const targetIndex = Math.floor(Math.random() * enabledOptions.length);
    const winner = enabledOptions[targetIndex];

    const sliceAngle = 360 / enabledOptions.length;
    const middleAngle = (targetIndex * sliceAngle) + (sliceAngle / 2);
    const targetRotation = 360 - middleAngle;

    const prevRot = currentRotationRef.current;
    const baseRot = prevRot + (360 - (prevRot % 360));
    const extraSpins = 360 * 6;
    const nextRot = baseRot + extraSpins + targetRotation;

    currentRotationRef.current = nextRot;
    setRotation(nextRot);

    const startTime = performance.now();
    const startRot = prevRot;
    const totalDistance = nextRot - startRot;
    const duration = 5000;
    let lastWedgeIndex = -1;

    const trackTicks = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        setIsSpinning(false);
        onSpinComplete(winner);
        return;
      }

      const t = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - t, 4);
      const currentRotVal = startRot + totalDistance * easeOut;

      const visualAngle = (360 - (currentRotVal % 360)) % 360;
      const currentWedge = Math.floor(visualAngle / sliceAngle);

      if (currentWedge !== lastWedgeIndex) {
        soundManager.playTick();
        lastWedgeIndex = currentWedge;
      }

      animationFrameRef.current = requestAnimationFrame(trackTicks);
    };

    animationFrameRef.current = requestAnimationFrame(trackTicks);
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getWedgePath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 360) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;
    }
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const cx = 200;
  const cy = 200;
  const r = 175;
  const sliceAngle = enabledOptions.length > 0 ? 360 / enabledOptions.length : 360;

  if (enabledOptions.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 aspect-square max-w-sm mx-auto">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center text-4xl animate-bounce mb-4">
          🎡
        </div>
        <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-2">
          ต้องการตัวเลือกเพิ่มเติม
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          กรุณาเพิ่มตัวเลือกในเมนู และตรวจสอบให้แน่ใจว่าเปิดใช้งานอย่างน้อย 2 รายการขึ้นไปเพื่อหมุนวงล้อ
        </p>
      </div>
    );
  }

  const bulbCount = 24;
  const bulbs = Array.from({ length: bulbCount }).map((_, i) => {
    const angle = i * (360 / bulbCount);
    const pos = polarToCartesian(cx, cy, r + 8, angle);
    return { x: pos.x, y: pos.y, id: i };
  });

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-md mx-auto aspect-square">
      <div className="absolute inset-4 rounded-full bg-slate-900/5 dark:bg-black/20 blur-xl pointer-events-none" />

      <div className="relative w-full h-full p-2">
        <svg
          ref={wheelRef}
          id="lucky-wheel-svg"
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-2xl select-none"
        >
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '200px 200px',
              transition: isSpinning ? 'transform 5000ms cubic-bezier(0.15, 0.85, 0.2, 1)' : 'none'
            }}
          >
            {enabledOptions.map((option, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = (index + 1) * sliceAngle;
              const middleAngle = startAngle + sliceAngle / 2;
              
              let fontSize = "13px";
              let maxChars = 8;
              if (enabledOptions.length < 5) {
                fontSize = "19px";
                maxChars = 13;
              } else if (enabledOptions.length < 8) {
                fontSize = "16px";
                maxChars = 10;
              } else if (enabledOptions.length < 12) {
                fontSize = "13px";
                maxChars = 8;
              } else {
                fontSize = "11px";
                maxChars = 6;
              }

              const rawLines = splitTextIntoLines(option.text, maxChars);
              const maxLines = 3;
              const lines = rawLines.slice(0, maxLines);
              if (rawLines.length > maxLines) {
                lines[maxLines - 1] = lines[maxLines - 1].substring(0, Math.max(2, maxChars - 2)) + '...';
              }

              return (
                <g key={option.id} className="group cursor-pointer">
                  <path
                    d={getWedgePath(cx, cy, r, startAngle, endAngle)}
                    fill={option.color}
                    className="transition-all duration-300 stroke-white/15 stroke-1 group-hover:brightness-105"
                  />
                  
                  <text
                    x={cx}
                    y={cy - r * 0.58}
                    fill="#FFFFFF"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize={fontSize}
                    fontWeight="700"
                    textAnchor="middle"
                    transform={`rotate(${middleAngle} ${cx} ${cy})`}
                    className="pointer-events-none select-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.4)]"
                  >
                    {lines.map((line, idx) => {
                      const startDy = -(lines.length - 1) * 0.6 + 0.35;
                      return (
                        <tspan
                          key={idx}
                          x={cx}
                          dy={idx === 0 ? `${startDy}em` : "1.2em"}
                        >
                          {line}
                        </tspan>
                      );
                    })}
                  </text>
                </g>
              );
            })}

            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          </g>

          <circle
            cx={cx}
            cy={cy}
            r={r + 8}
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="12"
            className="filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]"
          />

          <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="#2D3748" strokeWidth="1" opacity="0.4" />

          {bulbs.map((bulb) => (
            <circle
              key={bulb.id}
              cx={bulb.x}
              cy={bulb.y}
              r="4.5"
              fill={isSpinning ? (bulb.id % 2 === Math.floor(Date.now() / 250) % 2 ? '#FFF5F5' : '#FFD700') : '#FFF9E6'}
              stroke="#B7791F"
              strokeWidth="1"
              className={isSpinning ? "animate-pulse" : ""}
              style={{
                filter: isSpinning ? 'drop-shadow(0px 0px 4px #FFD700)' : 'none'
              }}
            />
          ))}

          <circle
            cx={cx}
            cy={cy}
            r="44"
            fill="url(#hubGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="5"
            className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] cursor-pointer"
            onClick={spin}
          />

          <g className="pointer-events-none select-none cursor-pointer" onClick={spin}>
            <circle cx={cx} cy={cy} r="32" fill="#1A202C" />
            <text
              x={cx}
              y={cy + 1}
              fill="#FFD700"
              fontSize="12px"
              fontWeight="900"
              fontFamily="Outfit, Inter, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              className="tracking-widest"
            >
              SPIN
            </text>
            <text
              x={cx}
              y={cy + 13}
              fill="#FFFFFF"
              fontSize="8px"
              fontWeight="500"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.7"
            >
              หมุนเลย!
            </text>
          </g>

          <g transform="translate(0, -2)">
            <path
              d="M 182,10 L 218,10 L 200,42 Z"
              fill="rgba(0,0,0,0.35)"
              className="filter blur-[2px]"
            />
            <path
              d="M 184,8 L 216,8 L 200,38 Z"
              fill="url(#pointerGradient)"
              stroke="#FFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            />
            <circle cx="200" cy="16" r="4.5" fill="#FFF" />
          </g>

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A5568" />
              <stop offset="100%" stopColor="#1A202C" />
            </linearGradient>

            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="100%" stopColor="#C53030" />
            </linearGradient>
          </defs>
        </svg>

        {!isSpinning && (
          <button
            onClick={spin}
            id="spin-button-action"
            className="absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-extrabold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200 uppercase tracking-wider flex items-center gap-2 border border-amber-300"
          >
            🎰 กดหมุนวงล้อ
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const STORAGE_KEYS = {
  OPTIONS: 'lucky_wheel_options_v1',
  HISTORY: 'lucky_wheel_history_v1',
  SOUND: 'lucky_wheel_sound_enabled_v1'
};

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', text: 'กะเพราไข่ดาว 🍳', color: '#FF6B6B', enabled: true },
  { id: '2', text: 'ส้มตำไก่ย่าง 🍗', color: '#FFB84C', enabled: true },
  { id: '3', text: 'หมูกระทะ / ชาบู 🥩', color: '#30E3CA', enabled: true },
  { id: '4', text: 'ก๋วยเตี๋ยวเรือต้มยำ 🍜', color: '#4D96FF', enabled: true },
  { id: '5', text: 'ซูชิ / อาหารญี่ปุ่น 🍣', color: '#AA77FF', enabled: true },
  { id: '6', text: 'พิซซ่าแฮมเบอร์เกอร์ 🍕', color: '#F473B9', enabled: true },
];

export default function App() {
  const [options, setOptions] = useState<WheelOption[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_OPTIONS;
  });

  const [history, setHistory] = useState<SpinHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== 'false';
  });

  const [newOptionText, setNewOptionText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'presets' | 'history'>('manage');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('lucky_wheel_custom_logo_v1');
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        triggerAlert('⚠️ ขนาดรูปภาพต้องไม่เกิน 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCustomLogo(base64String);
        localStorage.setItem('lucky_wheel_custom_logo_v1', base64String);
        triggerAlert('🖼️ อัปโหลดรูปจริงสำเร็จแล้ว!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('lucky_wheel_custom_logo_v1');
    triggerAlert('🔄 รีเซ็ตกลับเป็นโลโก้ตั้งต้นแล้ว');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPTIONS, JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled.toString());
  }, [soundEnabled]);

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOptionText.trim();
    if (!trimmed) return;

    if (options.some(o => o.text.toLowerCase() === trimmed.toLowerCase())) {
      triggerAlert('⚠️ มีตัวเลือกนี้อยู่แล้วในระบบ!');
      return;
    }

    const nextColor = getOptionColor(options.length, options.length + 1);
    const newOption: WheelOption = {
      id: Date.now().toString(),
      text: trimmed,
      color: nextColor,
      enabled: true
    };

    setOptions([...options, newOption]);
    setNewOptionText('');
    inputRef.current?.focus();
  };

  const handleDeleteOption = (id: string) => {
    const filtered = options.filter(o => o.id !== id);
    setOptions(filtered);
  };

  const handleToggleOption = (id: string) => {
    const updated = options.map(o => {
      if (o.id === id) {
        return { ...o, enabled: !o.enabled };
      }
      return o;
    });
    setOptions(updated);
  };

  const startEditing = (opt: WheelOption) => {
    setEditingOptionId(opt.id);
    setEditingText(opt.text);
  };

  const saveEditing = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const updated = options.map(o => {
      if (o.id === id) {
        return { ...o, text: trimmed };
      }
      return o;
    });
    setOptions(updated);
    setEditingOptionId(null);
  };

  const updateOptionColor = (id: string, color: string) => {
    const updated = options.map(o => {
      if (o.id === id) {
        return { ...o, color };
      }
      return o;
    });
    setOptions(updated);
  };

  const handleLoadPreset = (presetName: string, items: string[], customColors?: string[]) => {
    const newOpts = items.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      text: item,
      color: customColors ? customColors[index % customColors.length] : getOptionColor(index, items.length),
      enabled: true
    }));
    setOptions(newOpts);
    triggerAlert(`⚡️ โหลดธีม "${presetName}" เรียบร้อยแล้ว!`);
  };

  const handleClearAll = () => {
    if (confirm('คุณต้องการลบตัวเลือกทั้งหมดใช่หรือไม่?')) {
      setOptions([]);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('ต้องการคืนค่าตัวเลือกเริ่มต้นใช่หรือไม่?')) {
      setOptions(DEFAULT_OPTIONS);
      triggerAlert('🎡 คืนค่าตัวเลือกตั้งต้นเรียบร้อย!');
    }
  };

  const handleSpinComplete = (winItem: WheelOption) => {
    setWinner(winItem);
    setShowWinnerModal(true);
    soundManager.playWin();

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newHistoryItem: SpinHistory = {
      id: Date.now().toString(),
      optionText: winItem.text,
      timestamp: formattedTime
    };
    setHistory([newHistoryItem, ...history]);
  };

  const removeWinnerFromWheel = () => {
    if (!winner) return;
    setOptions(options.filter(o => o.id !== winner.id));
    setShowWinnerModal(false);
    triggerAlert(`🗑️ ลบ "${winner.text}" ออกจากวงล้อแล้ว!`);
    setWinner(null);
  };

  const handleClearHistory = () => {
    if (confirm('คุณต้องการล้างประวัติการสุ่มทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
    }
  };

  const enabledCount = options.filter(o => o.enabled).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-lg shadow-amber-500/5 bg-slate-950 shrink-0 cursor-pointer group"
              title="คลิกเพื่อเปลี่ยนรูปภาพจริงของคุณ!"
            >
              <img
                src={customLogo || "/src/assets/images/euarm_real_logo_1784000652895.jpg"}
                alt="EUARM"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[9px] font-bold text-amber-300 select-none">
                <span>อัปโหลด</span>
                <span>รูปจริง</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400">
                Lucky Spin Wheel by EUARM
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                วงล้อสุ่มดวง แฟนพันธุ์แท้ EUA ⚽ ARM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customLogo && (
              <button
                onClick={handleResetLogo}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-750 px-2.5 py-2 rounded-xl transition-all"
                title="ลบรูปจริงเพื่อใช้โลโก้การ์ตูนเหมือนเดิม"
              >
                🔄 รีเซ็ตโลโก้
              </button>
            )}
            
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                soundManager.setEnabled(!soundEnabled);
              }}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
              title={soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {alertMessage && (
          <div className="fixed top-18 left-1/2 transform -translate-x-1/2 bg-slate-950/90 border border-amber-500/30 text-amber-200 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md z-50 flex items-center gap-2 font-medium text-sm animate-bounce">
            {alertMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6 items-center">
            <div className="w-full bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 text-xs px-3 py-1.5 rounded-full text-slate-300 font-mono">
                🎯 เปิดใช้งาน: {enabledCount} / {options.length} รายการ
              </div>

              <div className="my-6 w-full">
                <SpinWheel
                  options={options}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                  onSpinComplete={handleSpinComplete}
                  soundEnabled={soundEnabled}
                />
              </div>

              <div className="w-full border-t border-slate-800/60 pt-4 mt-2 text-center">
                {isSpinning ? (
                  <p className="text-amber-400 font-semibold animate-pulse text-sm flex items-center justify-center gap-2">
                    <Sparkles size={16} className="animate-spin" /> หมุนติ้ว ๆ... ลุ้นระทึกสักครู่!
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs font-medium">
                    คลิกปุ่ม <strong className="text-amber-400 font-bold">SPIN</strong> ตรงกลางหรือปุ่มด้านล่างเพื่อสุ่มตัวเลือก
                  </p>
                )}
              </div>
            </div>

            {winner && !showWinnerModal && (
              <div className="w-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-lg">
                    👑
                  </div>
                  <div>
                    <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">ผลลัพธ์ล่าสุด</div>
                    <div className="text-base font-extrabold text-slate-100">{winner.text}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWinnerModal(true)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  ขยายใหญ่ 🎉
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-slate-950/30 p-1.5 rounded-2xl border border-slate-800/80 flex gap-1">
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-700 text-amber-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List size={16} />
                จัดการตัวเลือก ({options.length})
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'presets'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-700 text-amber-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={16} />
                คลังตัวอย่าง
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-700 text-amber-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HistoryIcon size={16} />
                ประวัติการสุ่ม ({history.length})
              </button>
            </div>

            {activeTab === 'manage' && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-5 backdrop-blur-sm shadow-xl">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
                    📝 เพิ่มตัวเลือกใหม่
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    กรอกชื่อตัวเลือกที่คุณต้องการสุ่ม แล้วกดปุ่มเครื่องหมายบวกเพื่อบันทึก
                  </p>
                </div>

                <form onSubmit={handleAddOption} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="เช่น ชาบู, พรุ่งนี้ค่อยคิด, นาย ก..."
                    maxLength={35}
                    disabled={isSpinning}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 transition-all disabled:opacity-55"
                  />
                  <button
                    type="submit"
                    disabled={isSpinning || !newOptionText.trim()}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-extrabold px-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:scale-100 disabled:border-slate-800 border border-amber-300/10"
                  >
                    <Plus size={18} />
                    <span>เพิ่ม</span>
                  </button>
                </form>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
                  <span className="text-xs font-semibold text-slate-400">
                    รายการตัวเลือกทั้งหมด
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetToDefault}
                      disabled={isSpinning}
                      className="text-xs font-bold text-slate-300 hover:text-amber-400 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-xl transition-all hover:bg-slate-800"
                    >
                      🔄 ตัวเลือกตั้งต้น
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={isSpinning || options.length === 0}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl transition-all hover:bg-rose-500/10 disabled:opacity-40"
                    >
                      🗑️ ล้างทั้งหมด
                    </button>
                  </div>
                </div>

                {options.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                    <p className="text-sm text-slate-400 text-center font-medium">ยังไม่มีตัวเลือกใด ๆ ในวงล้อเลย</p>
                    <p className="text-xs text-slate-500 text-center mt-1">พิมพ์เพิ่มด้านบน หรือกดปุ่ม "ตัวเลือกตั้งต้น" เพื่อโหลดรายชื่ออาหาร</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                    {options.map((option, index) => (
                      <div
                        key={option.id}
                        className={`group/item flex items-center justify-between p-3 rounded-2xl border transition-all duration-150 ${
                          option.enabled
                            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/20 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleOption(option.id)}
                            disabled={isSpinning}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              option.enabled
                                ? 'bg-amber-500 border-amber-600 text-slate-950 hover:bg-amber-400'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {option.enabled && <Check size={14} strokeWidth={3} />}
                          </button>

                          <div className="relative group/picker shrink-0">
                            <div
                              className="w-5 h-5 rounded-full border border-white/20 shadow-md cursor-pointer transition-transform group-hover/picker:scale-110"
                              style={{ backgroundColor: option.color }}
                              title="เปลี่ยนสีช่องสุ่ม"
                            />
                            <div className="absolute top-[-4px] left-7 bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl hidden group-hover/picker:flex gap-1.5 z-30">
                              {COLOR_PALETTE.slice(0, 6).map((col) => (
                                <button
                                  key={col}
                                  onClick={() => updateOptionColor(option.id, col)}
                                  className="w-4 h-4 rounded-full border border-white/10"
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                          </div>

                          {editingOptionId === option.id ? (
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onBlur={() => saveEditing(option.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditing(option.id);
                                if (e.key === 'Escape') setEditingOptionId(null);
                              }}
                              autoFocus
                              className="bg-slate-950 border border-amber-500/40 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none w-full max-w-xs"
                            />
                          ) : (
                            <span
                              onClick={() => !isSpinning && startEditing(option)}
                              className={`text-sm font-medium truncate cursor-pointer hover:text-amber-300 transition-colors ${
                                option.enabled ? 'text-slate-200' : 'text-slate-500 line-through'
                              }`}
                              title="คลิกเพื่อแก้ไขข้อความ"
                            >
                              {option.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => !isSpinning && startEditing(option)}
                            disabled={isSpinning}
                            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                            title="แก้ไขข้อความ"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            disabled={isSpinning}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30"
                            title="ลบตัวเลือก"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {options.length > 0 && enabledCount < 2 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-2.5">
                    <Info size={16} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-bold">วงล้อต้องการตัวเลือกอย่างน้อย 2 รายการ</p>
                      <p className="mt-0.5 text-slate-400">กรุณากดเปิดใช้งานตัวเลือกเพิ่มเติม เพื่อสปินวงล้อ</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-sm shadow-xl">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
                    🎨 โหลดแม่แบบตัวเลือกสำรวย
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    เลือกหัวข้อยอดนิยมเพื่อตั้งค่าตัวเลือกวงล้อทันที ช่วยให้เริ่มสนุกได้ทันใจไม่ต้องพิมพ์เอง
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      onClick={() => !isSpinning && handleLoadPreset(preset.name, preset.options, preset.colors)}
                      className={`group p-4 rounded-2xl border bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                        isSpinning ? 'opacity-50 pointer-events-none border-slate-800' : 'border-slate-800/80 hover:border-amber-500/30'
                      }`}
                    >
                      <div>
                        <div className="text-2xl mb-2">
                          {preset.name.split(' ')[0]}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                          {preset.name.split(' ').slice(1).join(' ')}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {preset.options.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center justify-end text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform gap-0.5">
                        <span>โหลดชุดนี้</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
                      📜 ประวัติการสุ่ม
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      บันทึกรายชื่อผู้โชคดีและตัวเลือกที่สุ่มได้ในแต่ละรอบ
                    </p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl transition-all hover:bg-rose-500/10"
                    >
                      ล้างประวัติ
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                    <div className="text-3xl mb-2 text-slate-600">📭</div>
                    <p className="text-sm text-slate-400 font-medium">ยังไม่มีประวัติการหมุนสุ่ม</p>
                    <p className="text-xs text-slate-500 mt-1">กดสปินวงล้อเพื่อเริ่มบันทึกประวัติการสุ่มกันเลย!</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2.5 custom-scrollbar">
                    {history.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 bg-slate-900/30 border border-slate-850 rounded-2xl hover:border-slate-800/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 w-6 h-6 rounded-lg flex items-center justify-center">
                            {history.length - idx}
                          </span>
                          <span className="text-sm font-bold text-slate-200">
                            {item.optionText}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md">
                          ⏰ {item.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-slate-950/20 border border-slate-800/40 rounded-2xl p-4 text-xs text-slate-400 flex gap-2.5 items-start">
              <span className="text-base">💡</span>
              <p className="leading-relaxed">
                <strong className="text-slate-300">เคล็ดลับ:</strong> คุณสามารถแก้ไขข้อความของแต่ละช่องได้ทันทีโดยการ <strong className="text-amber-400 font-bold">คลิกที่ชื่อตัวเลือก</strong> ในเมนูจัดการ และคุณยังเปลี่ยนสีวงล้อรายตัวได้โดยชี้ไปที่จุดสีด้านหน้าตัวเลือก
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl overflow-hidden border border-slate-800 flex flex-col md:flex-row shadow-2xl relative">
          <div className="flex-1 bg-gradient-to-br from-amber-400 to-yellow-500 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-rose-400/35 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute left-6 bottom-4 flex gap-1.5 opacity-25">
              <span className="w-1.5 h-3 bg-slate-950 rounded-full transform rotate-12"></span>
              <span className="w-1.5 h-3 bg-slate-950 rounded-full transform -rotate-12"></span>
              <span className="w-1.5 h-3 bg-slate-950 rounded-full transform rotate-6"></span>
            </div>
            <div className="absolute right-6 bottom-4 text-6xl opacity-20 pointer-events-none select-none">👦🏻</div>
            <div className="z-10">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-950 uppercase opacity-70">TEAM MEMBER</span>
              <h3 className="text-2xl font-extrabold font-display text-slate-950 mt-1 tracking-tight">EUA SUPHANAT</h3>
              <p className="text-xs text-amber-950 font-medium mt-1.5 max-w-xs leading-relaxed">
                ฝั่งตัวแทนความสนุกสนาน พลังงานบวก และรอยยิ้มแสนสดใสของเด็กน้อยสุดน่ารัก
              </p>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-400/25 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute right-6 bottom-4 flex gap-1.5 opacity-25">
              <span className="w-1.5 h-3 bg-white rounded-full transform -rotate-12"></span>
              <span className="w-1.5 h-3 bg-white rounded-full transform rotate-12"></span>
              <span className="w-1.5 h-3 bg-white rounded-full transform -rotate-6"></span>
            </div>
            <div className="absolute left-6 bottom-4 text-6xl opacity-15 pointer-events-none select-none">🧔🏻‍♂️</div>
            <div className="z-10 text-right md:text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-200 uppercase opacity-70">TEAM LEADER</span>
              <h3 className="text-2xl font-extrabold font-display text-white mt-1 tracking-tight">ARM THOS TRIPS</h3>
              <p className="text-xs text-purple-200 font-medium mt-1.5 max-w-xs leading-relaxed md:ml-0 ml-auto">
                ผู้นำสายเที่ยว ผู้สร้างสรรค์การผจญภัยและบันทึกความทรงจำอันมีค่าของครอบครัว
              </p>
            </div>
          </div>
        </div>
      </main>

      <Confetti active={showWinnerModal} />

      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="absolute top-[-50px] w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 border-4 border-slate-900 z-10 mb-4 animate-bounce">
              👑
            </div>

            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-mono mb-1">
              ✨ THE WINNER IS ✨
            </div>
            
            <h2 className="text-sm font-semibold text-slate-400">
              ผู้โชคดีที่ได้คือ
            </h2>

            <div className="my-5 py-5 px-6 bg-slate-950/80 border border-slate-800 rounded-2xl w-full flex items-center justify-center shadow-inner relative group min-h-[90px]">
              <div
                className="absolute inset-0 opacity-10 rounded-2xl transition-all duration-300"
                style={{ backgroundColor: winner.color }}
              />
              <p className="text-2xl md:text-3xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-300 drop-shadow-md break-all leading-normal">
                {winner.text}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => setShowWinnerModal(false)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-extrabold text-base py-3.5 rounded-xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all duration-200"
              >
                🎉 เยี่ยมเลย! กลับหน้าหลัก
              </button>
              
              <button
                onClick={removeWinnerFromWheel}
                className="text-xs text-slate-400 hover:text-rose-400 font-bold py-2 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all"
              >
                🗑️ ลบตัวเลือกนี้ออก (เพื่อจับตัวเลือกอื่นต่อ)
              </button>
            </div>

            <button
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-300 bg-slate-900 rounded-full border border-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

