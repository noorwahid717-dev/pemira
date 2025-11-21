import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/library'
import { useVotingSession } from '../hooks/useVotingSession'
import type { TPSScanResult } from '../types/voting'
import '../styles/TPSScanner.css'

const TPSScanner = (): JSX.Element => {
  const navigate = useNavigate()
  const { session } = useVotingSession()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const stopScanner = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const handleQRScanned = useCallback(
    (qrData: string) => {
      stopScanner()

      const payload: TPSScanResult = {
        token: qrData,
        tpsName: 'Aula Utama - TPS 1',
        scannedAt: new Date().toISOString(),
      }

      sessionStorage.setItem('scannedQR', JSON.stringify(payload))
      navigate('/voting-tps/validate')
    },
    [navigate, stopScanner],
  )

  const startScanner = useCallback(async () => {
    try {
      setError(null)
      setPermissionDenied(false)

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      const devices = await codeReader.listVideoInputDevices()
      if (devices.length === 0) {
        setError('Tidak ada kamera yang tersedia')
        return
      }

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      setStream(videoStream)

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream
      }


      codeReader.decodeFromVideoElement(
        videoRef.current as HTMLVideoElement,
        (result) => {
          if (result) {
            handleQRScanned(result.getText())
          }
        },
        (err) => {
          if (err && err.message !== 'Decode hint failed. No QR code found') {
            setError('Tidak dapat membaca QR, coba lagi.')
          }
        },
      )
    } catch (err: unknown) {
      console.error('Scanner error:', err)
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setPermissionDenied(true)
        setError('Izin kamera ditolak')
      } else {
        setError('Tidak dapat mengakses kamera')
      }
    }
  }, [handleQRScanned])

  const toggleTorch = async () => {
    if (!stream) return
    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      if ('torch' in capabilities && capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }],
        })
        setTorchEnabled((prev) => !prev)
      }
    } catch (err) {
      console.error('Torch error:', err)
    }
  }

  const requestPermission = () => {
    setPermissionDenied(false)
    setError(null)
    startScanner()
  }

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [startScanner, stopScanner])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button
          className="btn-back-scanner"
          onClick={() => {
            stopScanner()
            navigate('/voting-tps')
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
            <button className="btn-permission" onClick={requestPermission}>
              Izinkan Kamera
            </button>
            <p className="error-help">Jika sudah ditolak, buka Settings browser untuk memberikan izin.</p>
          </div>
        ) : error ? (
          <div className="scanner-error-state">
            <div className="error-icon">⚠️</div>
            <h3>Tidak Dapat Mengakses Kamera</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={startScanner}>
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="scanner-viewfinder">
              <video ref={videoRef} className="scanner-video" autoPlay playsInline muted={false} />
              <div className="scanner-overlay">
                <div className="scanner-frame">
                  <div className="frame-corner tl" />
                  <div className="frame-corner tr" />
                  <div className="frame-corner bl" />
                  <div className="frame-corner br" />
                  <div className="scanner-line" />
                </div>
              </div>
            </div>

            <div className="scanner-instruction">
              <p>Arahkan kamera ke QR panitia</p>
            </div>

            <div className="scanner-controls">
              <button className="btn-torch" onClick={toggleTorch} disabled={!stream}>
                {torchEnabled ? '🔦' : '💡'} Flash
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TPSScanner
