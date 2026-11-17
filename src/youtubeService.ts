import { useEffect, useRef } from 'react';

interface UseYouTubeChatProps {
  videoUrl: string;
  onMessageSpike: (mps: number, baseline: number) => void;
  onNewMessage: (user: string, message: string) => void;
}

export function useYouTubeChat({ videoUrl, onMessageSpike, onNewMessage }: UseYouTubeChatProps) {
  const mpsWindowRef = useRef<number[]>([]);
  const currentSecondCount = useRef(0);

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;

      // Simulated incoming chat stream for 24h MVP reliability
      const simulatedIncoming = Math.floor(Math.random() * 8) + 2;
      currentSecondCount.current += simulatedIncoming;

      for (let i = 0; i < simulatedIncoming; i++) {
        onNewMessage(`Viewer_${Math.floor(Math.random() * 1000)}`, 'W stream 🔥');
      }

      const mps = currentSecondCount.current;
      currentSecondCount.current = 0;

      const history = mpsWindowRef.current;
      history.push(mps);
      if (history.length > 30) history.shift();

      const avg = history.reduce((a, b) => a + b, 0) / history.length;

      if (avg > 3 && mps > avg * 2.2 && mps > 6) {
        onMessageSpike(mps, Math.round(avg));
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [videoUrl]);
}
