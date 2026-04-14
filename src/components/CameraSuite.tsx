import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Eye, Hand, Fingerprint, CheckCircle, X, RotateCcw, Upload, Sparkles, Zap, Scan, ChevronRight } from 'lucide-react';

interface CameraSuiteProps {
  onCaptureComplete: (images: CapturedImages) => void;
  onSkip: () => void;
}

export interface CapturedImages {
  eyelidPhoto: File | null;
  fingernailPhoto: File | null;
  palmPhoto: File | null;
}

type CaptureTarget = 'eyelid' | 'fingernail' | 'palm';

const TARGETS: { id: CaptureTarget; label: string; icon: typeof Eye; description: string; guidance: string; color: string }[] = [
  {
    id: 'eyelid',
    label: 'Eye (Conjunctiva)',
    icon: Eye,
    description: 'Pull down lower eyelid to expose conjunctiva',
    guidance: 'The ViT model analyzes scleral pallor & vascular patterns for anemia detection (98.47% accuracy)',
    color: '#3B82F6',
  },
  {
    id: 'fingernail',
    label: 'Fingernail Bed',
    icon: Fingerprint,
    description: 'Place finger flat, nail facing camera under good light',
    guidance: 'MobileNet-V2 analyzes nail bed pallor — a clinical sign of iron deficiency anemia (94.66% accuracy)',
    color: '#8B5CF6',
  },
  {
    id: 'palm',
    label: 'Palm Crease',
    icon: Hand,
    description: 'Open palm flat, showing creases in good lighting',
    guidance: 'Palm pallor in palmar creases is a WHO-recommended clinical screening indicator',
    color: '#F59E0B',
  },
];

export function CameraSuite({ onCaptureComplete, onSkip }: CameraSuiteProps) {
  const [currentTarget, setCurrentTarget] = useState<CaptureTarget | null>(null);
  const [captures, setCaptures] = useState<Record<CaptureTarget, File | null>>({
    eyelid: null,
    fingernail: null,
    palm: null,
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturedCount = Object.values(captures).filter(Boolean).length;

  const startCamera = useCallback(async (target: CaptureTarget) => {
    setCurrentTarget(target);
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'eyelid' ? 'user' : 'environment', width: 640, height: 480 },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      // Fallback to file upload
      fileInputRef.current?.click();
      setIsCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCapturing(false);
    setCurrentTarget(null);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !currentTarget) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${currentTarget}_capture.jpg`, { type: 'image/jpeg' });
        setCaptures(prev => ({ ...prev, [currentTarget]: file }));
      }
      stopCamera();
    }, 'image/jpeg', 0.85);
  }, [currentTarget, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentTarget) {
      setCaptures(prev => ({ ...prev, [currentTarget]: file }));
      setCurrentTarget(null);
    }
  };

  const handleComplete = () => {
    onCaptureComplete({
      eyelidPhoto: captures.eyelid,
      fingernailPhoto: captures.fingernail,
      palmPhoto: captures.palm,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 medical-gradient rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20 mx-auto mb-4">
          <Camera className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
          📸 Vision Analysis Suite
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Capture images for AI-powered non-invasive screening. Our ViT model
          achieves 98.47% accuracy on conjunctival analysis.
        </p>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera View (Active Capture) */}
      <AnimatePresence>
        {isCapturing && currentTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-[3/4]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-3xl"
              />
              {/* AR Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-3 border-dashed border-teal-400 rounded-full opacity-60 animate-pulse" />
                <div className="absolute w-52 h-52 border border-teal-300/20 rounded-full" />
              </div>
              {/* Guide text */}
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-3 mx-8">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Scan className="w-4 h-4 text-teal-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">
                      {TARGETS.find(t => t.id === currentTarget)?.description}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Align within the circle · Good lighting required
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-8">
              <button
                onClick={stopCamera}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 border-4 border-teal-500 rounded-full" />
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  fileInputRef.current?.click();
                }}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Cards */}
      <div className="space-y-3">
        {TARGETS.map((target, i) => {
          const captured = captures[target.id];
          const Icon = target.icon;
          
          return (
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-[24px] p-5 border-2 transition-all ${
                captured
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${target.color}15` }}
                >
                  {captured ? (
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <Icon className="w-7 h-7" style={{ color: target.color }} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">{target.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{target.guidance}</p>
                  {captured && (
                    <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Captured — {(captured.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {captured && (
                    <button
                      onClick={() => setCaptures(prev => ({ ...prev, [target.id]: null }))}
                      className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startCamera(target.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      captured
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-900 text-white shadow-lg hover:bg-slate-800'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {captured ? 'Retake' : 'Capture'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-50 rounded-[24px] p-4 flex items-center justify-between border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < capturedCount ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500">
            {capturedCount}/3 images captured
            {capturedCount > 0 && ' — AI vision analysis will be included'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
        >
          Skip (Tabular Only)
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 py-3.5 medical-gradient text-white rounded-2xl text-sm font-bold shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
        >
          {capturedCount > 0 ? (
            <>
              <Zap className="w-4 h-4" />
              Continue with {capturedCount} image{capturedCount > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" />
              Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
}
