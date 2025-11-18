'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  isOpen: boolean;
  label?: string;
}

export default function QrScanner({ onScan, onClose, isOpen, label = 'Scan QR Code' }: QrScannerProps) {
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);

      // Create scanner instance
      scannerRef.current = new Html5Qrcode(qrCodeRegionId);

      // Get camera devices
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Prefer back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        // Start scanning
        await scannerRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Error callback (can be ignored for continuous scanning)
            // console.log('Scan error:', errorMessage);
          }
        );
      } else {
        setError('No camera found on this device');
        setIsScanning(false);
      }
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, isScanning, startScanner, stopScanner]);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scanner Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6" />
              <h2 className="text-xl font-bold">{label}</h2>
            </div>
            <p className="text-sm text-white/80 mt-2">
              Position the QR code within the frame
            </p>
          </div>

          {/* Scanner Area */}
          <div className="p-6">
            {error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-red-600 text-center mb-4">{error}</p>
                <button
                  onClick={startScanner}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div id={qrCodeRegionId} className="rounded-lg overflow-hidden" />
                <p className="text-sm text-gray-500 text-center mt-4">
                  {isScanning ? 'Scanning...' : 'Initializing camera...'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <button
              onClick={handleClose}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
