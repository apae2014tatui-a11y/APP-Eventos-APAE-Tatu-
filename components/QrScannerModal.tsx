
import React, { useEffect, useRef } from 'react';
import Modal from './Modal';

declare var Html5QrcodeScanner: any;

interface QrScannerModalProps {
  onClose: () => void;
  onScan: (decodedText: string) => void;
  lastStatus: { message: string; success: boolean } | null;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onScan, lastStatus }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Garante que o scanner só é inicializado uma vez
    if (!scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Pausa o scanner para evitar múltiplas leituras
        html5QrcodeScanner.pause(true);
        onScan(decodedText);
        // Retoma o scanner após um pequeno intervalo para permitir a leitura do próximo
        setTimeout(() => {
            try {
                if(html5QrcodeScanner.getState() !== 2) // 2 is SCANNING state
                    html5QrcodeScanner.resume();
            } catch(e) {
                console.error("Erro ao retomar o scanner:", e);
            }
        }, 2000);
      };

      html5QrcodeScanner.render(onScanSuccess, undefined);
      scannerRef.current = html5QrcodeScanner;
    }

    // Função de limpeza para parar o scanner quando o componente for desmontado
    return () => {
      if (scannerRef.current) {
         scannerRef.current.clear().catch((error: any) => {
            console.error("Falha ao limpar o scanner de QR code.", error);
         });
         scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColor = lastStatus?.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';

  return (
    <Modal title="Validar Entrada com QR Code" onClose={onClose}>
      <div id="qr-reader-container" className="flex flex-col items-center">
        <div id="qr-reader" className="w-full max-w-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"></div>
        {lastStatus && (
            <div className={`mt-4 p-3 rounded-md w-full max-w-sm text-center font-semibold transition-all ${statusColor}`}>
               {lastStatus.message}
            </div>
        )}
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Aponte a câmera para o QR Code do ingresso.</p>
      </div>
    </Modal>
  );
};

export default QrScannerModal;
