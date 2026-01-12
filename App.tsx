import React, { useState, useCallback, useEffect } from 'react';
import { 
  Barcode, 
  Download, 
  CheckCircle2,
  RefreshCw,
  RotateCw,
  Loader2,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { BarcodeDisplay } from './components/BarcodeDisplay';

const App: React.FC = () => {
  const [targetLength, setTargetLength] = useState<number>(13);
  const [inputValue, setInputValue] = useState<string>('7501055310884');
  const [format] = useState<'EAN13' | 'CODE128'>('EAN13');
  const [label, setLabel] = useState<string>('Producto Industrial');
  const [isAutoFixing, setIsAutoFixing] = useState<boolean>(true);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [appVersion] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Escuchar el evento de instalación de PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    let val = inputValue.replace(/\D/g, '');
    if (val.length > targetLength) {
      setInputValue(val.slice(0, targetLength));
    } else if (val.length < targetLength) {
      setInputValue(val.padEnd(targetLength, '0'));
    }
  }, [targetLength]);

  const calculateCheckDigit = useCallback((code: string, len: number) => {
    if (code.length < len - 1) return null;
    const baseCode = code.slice(0, len - 1);
    const digits = baseCode.split('').map(Number);
    let sum = 0;

    if (len === 13) {
      for (let i = 0; i < 12; i++) {
        sum += digits[i] * (i % 2 === 0 ? 1 : 3);
      }
    } else if (len === 12) {
      for (let i = 0; i < 11; i++) {
        sum += digits[i] * (i % 2 === 0 ? 3 : 1);
      }
    } else {
      for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * (i % 2 === 0 ? 3 : 1);
      }
    }
    
    const check = (10 - (sum % 10)) % 10;
    return check.toString();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    const isDeleting = val.length < inputValue.length;
    
    val = val.slice(0, targetLength);
    if (isAutoFixing && !isDeleting) {
      if (val.length === targetLength - 1) {
        const correct = calculateCheckDigit(val, targetLength);
        if (correct !== null) val = val + correct;
      }
    }
    setInputValue(val);
  };

  const forceFix = () => {
    if (inputValue.length >= targetLength - 1) {
      const correct = calculateCheckDigit(inputValue, targetLength);
      if (correct !== null) {
        setInputValue(inputValue.slice(0, targetLength - 1) + correct);
      }
    }
  };

  const handleHardReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      const currentUrl = window.location.href.split('?')[0];
      window.location.href = `${currentUrl}?t=${Date.now()}`;
    }, 800);
  };

  const downloadBarcode = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = `${label.replace(/\s+/g, '-')}-${inputValue}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const checkDigit = inputValue.length >= targetLength - 1 
    ? calculateCheckDigit(inputValue, targetLength) 
    : null;
    
  const isValid = inputValue.length === targetLength && inputValue[targetLength - 1] === checkDigit;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center py-6 px-4 font-sans text-slate-900 select-none">
      <header className="max-w-2xl w-full mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-[2rem] shadow-lg border border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Barcode size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase leading-none text-slate-900">CV DIRECTO</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={10} className="text-green-500" />
                <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">SISTEMA VERIFICADO v2.0</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2 font-black text-[9px] uppercase tracking-wider animate-bounce shadow-lg shadow-green-100"
              >
                <PlusCircle size={12} />
                Instalar App
              </button>
            )}
            <button 
              onClick={handleHardReload}
              disabled={isReloading}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 ${
                isReloading 
                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {isReloading ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />}
              {isReloading ? 'Sincronizando...' : 'Actualizar App'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl w-full">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-bold text-slate-700 uppercase text-[9px] tracking-widest">Generador Activo</h2>
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-100">
              BUILD {appVersion}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estándar de Dígitos</label>
                <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                  {[10, 11, 12, 13].map((len) => (
                    <button 
                      key={len}
                      onClick={() => setTargetLength(len)}
                      className={`flex-1 py-2.5 rounded-lg font-black text-[11px] transition-all duration-200 ${targetLength === len ? 'bg-white shadow-sm text-indigo-600' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Etiqueta</label>
                <input 
                  type="text" 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none font-bold text-slate-700 transition-all text-sm"
                  placeholder="Ej: PRODUCTO-01"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contenido ({targetLength} Digs)</label>
                <button 
                  onClick={() => setIsAutoFixing(!isAutoFixing)}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Auto-Check</span>
                  <div className={`w-8 h-4 rounded-full relative transition-all ${isAutoFixing ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAutoFixing ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>
              
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={handleInputChange}
                  className={`w-full h-20 px-8 bg-slate-50 border-2 rounded-3xl font-mono text-3xl focus:bg-white outline-none transition-all tracking-[0.2em] ${
                    isValid ? 'border-green-100 text-slate-900' : 'border-amber-100 text-amber-700'
                  }`}
                />
                <div className="absolute right-4 flex items-center gap-2">
                  {isValid ? (
                    <div className="bg-green-500 p-2.5 rounded-full text-white shadow-md shadow-green-100">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    inputValue.length >= targetLength - 1 && (
                      <button 
                        onClick={forceFix} 
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <RefreshCw size={14} />
                        <span className="text-[8px] uppercase">Corregir</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <BarcodeDisplay value={inputValue} format={format} height={120} />

            <button 
              disabled={!isValid}
              onClick={downloadBarcode}
              className={`w-full h-16 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                isValid ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Download size={20}/> GUARDAR PNG
            </button>
          </div>
        </div>
      </main>
      
      <footer className="mt-6 text-center opacity-40">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">CV Directo Mobile Engine &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;