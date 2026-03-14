import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, X } from 'lucide-react';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

interface DocumentViewerModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export function DocumentViewerModal({ url, title, onClose }: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const rotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [url]);

  const isImage = url
    ? /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url) ||
      /image\//i.test(url)
    : false;

  const isPdf = url ? /\.pdf(\?|$)/i.test(url) : false;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[95vh] max-w-[95vw] flex flex-col p-0 gap-0 border-0 bg-slate-900 overflow-hidden"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
          <DialogTitle className="text-base font-medium text-slate-100 truncate max-w-[70%]">
            {title ?? 'Document'}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-slate-400 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              onClick={rotate}
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              onClick={resetView}
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 min-h-[320px] bg-slate-950">
          {url ? (
            isPdf ? (
              <div
                className="overflow-auto"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <iframe
                  src={url}
                  title={title ?? 'Document'}
                  className="w-full min-h-[70vh] border-0 bg-white"
                />
              </div>
            ) : isImage ? (
              <img
                src={url}
                alt={title ?? 'Document'}
                className="mx-auto block select-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setZoom((z) =>
                      Math.min(
                        MAX_ZOOM,
                        Math.max(MIN_ZOOM, z + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))
                      )
                    );
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <p className="text-sm">Preview not available for this file type.</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
