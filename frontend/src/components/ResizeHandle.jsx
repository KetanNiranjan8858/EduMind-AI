import React, { useState, useEffect, useRef } from 'react';

/**
 * ResizeHandle component
 * A clean, draggable divider for fluid sidebar resizing matching the warm cream & forest teal theme.
 */
export default function ResizeHandle({
  onResize,
  onReset,
  onDragStart,
  onDragEnd,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);

  const onResizeRef = useRef(onResize);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    onDragStartRef.current = onDragStart;
  }, [onDragStart]);

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (onResizeRef.current) {
          onResizeRef.current(e.clientX, e);
        }
      });
    };

    const handleMouseUp = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('resizing-active');

      if (onDragEndRef.current) {
        onDragEndRef.current(e.clientX);
      }
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('resizing-active');

    if (onDragStartRef.current) {
      onDragStartRef.current();
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('resizing-active');
    };
  }, [isDragging]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDoubleClick={onReset}
      title="Drag to resize in real time • Double-click to reset default width"
      className={`group relative w-2 shrink-0 cursor-col-resize select-none flex items-center justify-center z-30 transition-colors ${
        isDragging ? 'bg-[#173F3D]/20' : 'hover:bg-[#173F3D]/10'
      } ${className}`}
    >
      {/* 1px Center Divider Line */}
      <div
        className={`absolute inset-y-0 w-[1px] pointer-events-none transition-colors ${
          isDragging
            ? 'bg-[#173F3D] shadow-[0_0_8px_rgba(23,63,61,0.5)]'
            : 'bg-[#DCD2C0] group-hover:bg-[#173F3D]/60'
        }`}
      />

      {/* Modern Center Grab Pill */}
      <div
        className={`relative z-10 w-1.5 h-8 rounded-full pointer-events-none transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
          isDragging
            ? 'bg-[#173F3D] shadow-[0_0_8px_rgba(23,63,61,0.5)] scale-y-110'
            : 'bg-[#DCD2C0] group-hover:bg-[#173F3D] group-hover:scale-y-110'
        }`}
      >
        <span className="w-0.5 h-0.5 rounded-full bg-[#FAF7F2]" />
        <span className="w-0.5 h-0.5 rounded-full bg-[#FAF7F2]" />
        <span className="w-0.5 h-0.5 rounded-full bg-[#FAF7F2]" />
      </div>
    </div>
  );
}
