'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Hls: any;
  }
}

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsSrc =
      'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

    const initHls = () => {
      if (typeof window.Hls !== 'undefined' && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: false });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS — Safari
        video.src = hlsSrc;
        video.play().catch(() => {});
      }
      // No HLS support at all — video just stays invisible (background degrades gracefully)
    };

    if (typeof window.Hls !== 'undefined') {
      initHls();
    } else {
      // Load hls.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js';
      script.onload = initHls;
      script.onerror = () => {
        // CDN load failed — try native HLS or skip
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSrc;
          video.play().catch(() => {});
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.6 }}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
