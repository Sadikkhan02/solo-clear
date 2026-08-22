"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, X, Check, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

export function CameraCapture({
  isOpen = true,
  onCapture,
  onSkip,
  onClose,
  exerciseName = "Quest",
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(null); // null | true | false
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setHasCamera(null);

    // Check mediaDevices support
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setErrorMsg("Camera access is not supported on this device/browser.");
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setHasCamera(true);
    } catch (err) {
      console.warn("Camera permission/device error:", err);
      setHasCamera(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera permission was denied. You may skip this verification.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("No camera device found. You may skip this verification.");
      } else {
        setErrorMsg("Could not connect to camera. You may proceed by skipping.");
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Capture snapshot from video
  const handleTakePhoto = () => {
    if (!videoRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      // Mirror image horizontally for front-facing webcam preview feel
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);

      const base64Data = canvas.toDataURL("image/jpeg", 0.85);

      stopCameraStream();

      if (onCapture) {
        onCapture(base64Data);
      }
    } catch (err) {
      console.error("Failed to capture snapshot:", err);
      handleSkip();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    stopCameraStream();
    if (onSkip) {
      onSkip();
    }
  };

  const handleClose = () => {
    stopCameraStream();
    if (onClose) {
      onClose();
    } else {
      handleSkip();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="relative w-full max-w-md z-10"
        >
          <GlassCard glow={true} className="p-5 space-y-4 text-center bg-white shadow-2xl overflow-hidden relative">
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-text-muted hover:text-text-primary border border-slate-200 transition-colors active:scale-95 z-20"
              aria-label="Close Verification Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge & Title */}
            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary text-[10px] font-mono font-bold tracking-widest uppercase">
                <Camera className="w-3.5 h-3.5" />
                <span>PROOF OF QUEST VERIFICATION</span>
              </div>

              <h2 className="text-xl font-black text-text-primary tracking-tight">
                Capture Completion Proof
              </h2>
              <p className="text-xs text-text-secondary">
                Verify your execution of <strong>{exerciseName}</strong> (Optional)
              </p>
            </div>

            {/* Video Viewfinder Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  hasCamera === true ? "block" : "hidden"
                }`}
              />

              {/* Viewfinder Target Reticle Overlay */}
              {hasCamera === true && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-36 border-2 border-dashed border-white/50 rounded-2xl flex items-center justify-center relative">
                    <span className="absolute -top-3 px-2 py-0.5 rounded bg-slate-900/80 text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                      LIVE CADENCE
                    </span>
                    <Sparkles className="w-6 h-6 text-white/30" />
                  </div>
                </div>
              )}

              {/* Loading Stream State */}
              {hasCamera === null && (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono">Initializing System Optics...</p>
                </div>
              )}

              {/* Camera Error / Not Supported State */}
              {hasCamera === false && (
                <div className="p-4 text-center space-y-2 max-w-xs">
                  <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    {errorMsg || "Camera stream unavailable on this terminal."}
                  </p>
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono hover:bg-slate-700 active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {hasCamera === true ? (
                <NeumorphicButton
                  onClick={handleTakePhoto}
                  disabled={isProcessing}
                  className="w-full justify-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary text-sm py-3.5 border-none"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  <span>Snap Proof & Complete Quest</span>
                </NeumorphicButton>
              ) : null}

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Skip Photo Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CameraCapture;
