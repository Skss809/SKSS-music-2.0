import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export function Visualizer() {
  const { isPlaying } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      if (isPlaying) {
        // Simulate a waveform for visual effect
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        for (let i = 0; i < width; i++) {
          const amplitude = 30 + Math.sin(time * 2) * 10;
          const frequency = 0.02;
          const y = height / 2 + Math.sin(i * frequency + time) * amplitude * Math.sin(i * 0.01);
          ctx.lineTo(i, y);
        }
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'; // Indigo 500
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Second wave
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const amplitude = 20 + Math.cos(time * 1.5) * 10;
          const frequency = 0.03;
          const y = height / 2 + Math.cos(i * frequency - time) * amplitude * Math.cos(i * 0.015);
          ctx.lineTo(i, y);
        }
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'; // Purple 500
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Flat line when paused
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-32 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/5 relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={128} 
        className="w-full h-full"
      />
    </div>
  );
}
