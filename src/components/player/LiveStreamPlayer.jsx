import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const LiveStreamPlayer = ({ 
  src, 
  autoPlay = true, 
  muted = true, 
  controls = true, 
  width = '100%', 
  height = 'auto',
  onError,
  onLoadStart,
  onLoadedData,
  style = {}
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    
    // HLS 지원 여부 확인
    if (Hls.isSupported()) {
      // HLS.js 사용
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, video ready to play');
        if (autoPlay) {
          video.play().catch(e => console.log('Auto-play prevented:', e));
        }
        setIsLoading(false);
        onLoadedData?.();
      });

      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        setError(data);
        setIsLoading(false);
        onError?.(data);
      });

      hlsRef.current.on(Hls.Events.LOADING, () => {
        setIsLoading(true);
        onLoadStart?.();
      });

      hlsRef.current.on(Hls.Events.LOADED, () => {
        setIsLoading(false);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari에서 네이티브 HLS 지원
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        console.log('Native HLS loaded');
        setIsLoading(false);
        onLoadedData?.();
      });
      
      video.addEventListener('error', (e) => {
        console.error('Native HLS error:', e);
        setError(e);
        setIsLoading(false);
        onError?.(e);
      });
    } else {
      // HLS를 지원하지 않는 경우
      const error = new Error('HLS is not supported in this browser');
      setError(error);
      onError?.(error);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError, onLoadStart, onLoadedData]);

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setError(e);
    onError?.(e);
  };

  if (error) {
    return (
      <div style={{
        width,
        height,
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        ...style
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>스트림을 로드할 수 없습니다</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>{error.message || '알 수 없는 오류'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <video
        ref={videoRef}
        controls={controls}
        muted={muted}
        autoPlay={autoPlay}
        playsInline
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          backgroundColor: '#000',
          ...style
        }}
        onError={handleVideoError}
      />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          스트림 로딩 중...
        </div>
      )}
    </div>
  );
};

export default LiveStreamPlayer;
