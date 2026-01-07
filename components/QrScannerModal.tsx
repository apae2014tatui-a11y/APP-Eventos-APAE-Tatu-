
import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';

declare var Html5Qrcode: any;

interface QrScannerModalProps {
  onClose: () => void;
  onScan: (decodedText: string) => void;
  lastStatus: { message: string; success: boolean } | null;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onScan, lastStatus }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    const startScanner = async () => {
      setIsInitializing(true);
      setErrorMsg(null);
      
      try {
        // JIT Permission logic: Check if camera is available
        // In a true Flutter app, this would be permission_handler logic
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id; // Prefer back camera
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;

          const config = { 
            fps: 15, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText: string) => {
              // Som de sucesso ou vibração poderia ser disparado aqui
              onScan(decodedText);
            },
            (errorMessage: string) => {
              // Silencioso enquanto procura
            }
          );
          setIsInitializing(false);
        } else {
          setErrorMsg("Nenhuma câmera encontrada no dispositivo.");
        }
      } catch (err: any) {
        console.error("Erro no Scanner:", err);
        if (err.toString().includes("NotAllowedError")) {
          setErrorMsg("Permissão da câmera negada. Por favor, autorize nas configurações do Android.");
        } else if (err.toString().includes("NotReadableError")) {
          setErrorMsg("A câmera já está sendo usada por outro aplicativo.");
        } else {
          setErrorMsg("Erro ao iniciar a câmera. Tente reiniciar o aplicativo.");
        }
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      // Hardware Cleanup
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e: any) => console.warn("Erro ao parar câmera:", e));
      }
    };
  }, [onScan]);

  const statusClass = lastStatus 
    ? (lastStatus.success ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800') 
    : 'bg-indigo-50 border-indigo-100 text-indigo-700';

  return (
    <Modal title="Validação por Câmera" onClose={onClose}>
      <div className="flex flex-col items-center">
        <div 
          id="qr-reader" 
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-600 bg-black aspect-square relative"
        >
          {isInitializing && !errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-sm">Solicitando acesso à câmera...</p>
            </div>
          )}
          
          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-800 p-8 text-center">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <p className="font-black mb-4 uppercase tracking-tight">{errorMsg}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
        
        <div className={`mt-6 p-4 rounded-2xl w-full max-w-sm border-2 transition-all duration-500 text-center flex items-center justify-center gap-2 ${statusClass}`}>
           {lastStatus ? (
             <>
               {lastStatus.success ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
               ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
               )}
               <span className="font-black uppercase tracking-tight">{lastStatus.message}</span>
             </>
           ) : (
             <span className="font-bold animate-pulse uppercase tracking-widest text-xs">Posicione o QR Code no centro</span>
           )}
        </div>
      </div>
    </Modal>
  );
};

export default QrScannerModal;
