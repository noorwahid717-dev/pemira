import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../utils/navigation';
import { BrowserMultiFormatReader } from '@zxing/library';
import '../styles/TPSScanner.css';

export default function TPSScanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startScanner();
    
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const devices = await codeReader.listVideoInputDevices();
      
      if (devices.length === 0) {
        setError('Tidak ada kamera yang tersedia');
        return;
      }

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(videoStream);

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }

      setScanning(true);

      codeReader.decodeFromVideoElement(videoRef.current, (result, err) => {
        if (result) {
          handleQRScanned(result.getText());
        }
      });

    } catch (err) {
      console.error('Scanner error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Izin kamera ditolak');
      } else {
        setError('Tidak dapat mengakses kamera');
      }
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setScanning(false);
  };

  const handleQRScanned = (qrData) => {
    stopScanner();
    
    // Simulate validation
    sessionStorage.setItem('scannedQR', JSON.stringify({
      token: qrData,
      tpsName: 'Aula Utama - TPS 1',
      scannedAt: new Date().toISOString()
    }));
    
    navigate('/voting-tps/validate');
  };

  const toggleTorch = async () => {
    if (!stream) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
      }
    } catch (err) {
      console.error('Torch error:', err);
    }
  };

  const requestPermission = () => {
    setPermissionDenied(false);
    setError(null);
    startScanner();
  };

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button 
          className="btn-back-scanner"
          onClick={() => {
            stopScanner();
            navigate('/voting-tps');
          }}
        >
          ◀ Kembali
        </button>
        <h2>Scan QR Panitia</h2>
      </div>

      <div className="scanner-container">
        {permissionDenied ? (
          <div className="scanner-error-state">
            <div className="error-icon">📷</div>
            <h3>Izin Kamera Diperlukan</h3>
            <p>Aplikasi membutuhkan izin kamera untuk scan QR.</p>
            <button 
              className="btn-permission"
              onClick={requestPermission}
            >
              Izinkan Kamera
            </button>
            <p className="error-help">
              Jika sudah ditolak, buka Settings browser untuk memberikan izin.
            </p>
          </div>
        ) : error ? (
          <div className="scanner-error-state">
            <div className="error-icon">⚠️</div>
            <h3>Tidak Dapat Mengakses Kamera</h3>
            <p>{error}</p>
            <button 
              className="btn-retry"
              onClick={startScanner}
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="scanner-viewfinder">
              <video 
                ref={videoRef}
                className="scanner-video"
                autoPlay
                playsInline
              />
              <div className="scanner-overlay">
                <div className="scanner-frame">
                  <div className="frame-corner tl"></div>
                  <div className="frame-corner tr"></div>
                  <div className="frame-corner bl"></div>
                  <div className="frame-corner br"></div>
                  <div className="scanner-line"></div>
                </div>
              </div>
            </div>
            
            <div className="scanner-instruction">
              <p>Arahkan kamera ke QR panitia</p>
            </div>

            <div className="scanner-controls">
              <button 
                className="btn-torch"
                onClick={toggleTorch}
                disabled={!stream}
              >
                {torchEnabled ? '🔦' : '💡'} Flash
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
