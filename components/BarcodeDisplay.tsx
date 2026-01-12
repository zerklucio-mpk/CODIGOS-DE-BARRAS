
import React, { useMemo } from 'react';

interface BarcodeDisplayProps {
  value: string;
  format?: 'EAN13' | 'CODE128';
  height?: number;
}

/**
 * Renderizador de alta fidelidad: Fuente pequeña (28px) y posición ultra baja.
 */
export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ 
  value, 
  format = 'EAN13', 
  height = 140 
}) => {
  // Diccionarios EAN-13 / UPC-A
  const L_CODE = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  const G_CODE = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
  const R_CODE = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
  const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

  const generateBinaryData = (code: string) => {
    if (!/^\d+$/.test(code)) return null;
    let internalCode = code.padStart(13, '0');
    const firstDigit = parseInt(internalCode[0]);
    const pattern = PARITY[firstDigit];
    
    let bin = "101"; 
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(internalCode[i + 1]);
      bin += pattern[i] === 'L' ? L_CODE[digit] : G_CODE[digit];
    }
    bin += "01010"; 
    for (let i = 0; i < 6; i++) {
      bin += R_CODE[parseInt(internalCode[i + 7])];
    }
    bin += "101"; 
    return bin;
  };

  const barcodeData = useMemo(() => {
    if (format === 'EAN13') return generateBinaryData(value);
    return null; 
  }, [value, format]);

  const isValid = !!barcodeData;

  const barWidth = 4; 
  const quietZone = 90; 
  const totalWidth = 95 * barWidth + quietZone * 2;
  const barBaseHeight = height; 
  const guardExtend = 55; // Un poco más de extensión para el efecto "abrazo"
  const textFontSize = 28; // Fuente más pequeña para mayor elegancia
  const textY = 10 + barBaseHeight + guardExtend - 12; // Posicionado al borde inferior de las barras largas

  const renderDigits = () => {
    const len = value.length;
    const midX_L = quietZone + (3 * barWidth) + (42 * barWidth) / 2;
    const midX_R = quietZone + (50 * barWidth) + (42 * barWidth) / 2;

    switch (len) {
      case 13:
        return (
          <>
            <text x={quietZone - 35} y={textY} fontSize={textFontSize} fontWeight="bold" fill="black">{value[0]}</text>
            <text x={midX_L} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.0}>{value.substring(1, 7)}</text>
            <text x={midX_R} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.0}>{value.substring(7, 13)}</text>
          </>
        );
      case 12:
        return (
          <>
            <text x={quietZone - 35} y={textY} fontSize={textFontSize} fontWeight="bold" fill="black">{value[0]}</text>
            <text x={midX_L} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.3}>{value.substring(1, 6)}</text>
            <text x={midX_R} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.3}>{value.substring(6, 11)}</text>
            <text x={totalWidth - quietZone + 25} y={textY} fontSize={textFontSize} fontWeight="bold" fill="black">{value[11]}</text>
          </>
        );
      case 11:
        return (
          <>
            <text x={quietZone - 35} y={textY} fontSize={textFontSize} fontWeight="bold" fill="black">{value[0]}</text>
            <text x={midX_L} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.3}>{value.substring(1, 6)}</text>
            <text x={midX_R} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.3}>{value.substring(6, 11)}</text>
          </>
        );
      case 10:
        return (
          <>
            <text x={midX_L} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.5}>{value.substring(0, 5)}</text>
            <text x={midX_R} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing={barWidth * 1.5}>{value.substring(5, 10)}</text>
          </>
        );
      default:
        return <text x={totalWidth/2} y={textY} textAnchor="middle" fontSize={textFontSize} fontWeight="bold" letterSpacing="10">{value}</text>;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-12 rounded-[4rem] transition-all duration-700 ${
      isValid ? 'bg-white shadow-2xl border border-slate-100' : 'bg-slate-50 border-2 border-dashed border-slate-200'
    }`}>
      {isValid && (
        <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-6">
            <svg 
              width={totalWidth} 
              height={10 + barBaseHeight + guardExtend + 10} 
              viewBox={`0 0 ${totalWidth} ${10 + barBaseHeight + guardExtend + 10}`}
              xmlns="http://www.w3.org/2000/svg"
              className="max-w-full h-auto"
            >
              <rect width={totalWidth} height={10 + barBaseHeight + guardExtend + 10} fill="#fff" />
              
              {barcodeData.split('').map((bit, index) => {
                if (bit === '0') return null;
                const isGuard = index < 3 || (index >= 45 && index <= 49) || index >= 92;
                const h = isGuard ? barBaseHeight + guardExtend : barBaseHeight;
                return (
                  <rect 
                    key={index} 
                    x={quietZone + index * barWidth} 
                    y={10} 
                    width={barWidth + 0.1}
                    height={h} 
                    fill="#000" 
                  />
                );
              })}

              <g style={{ fontFamily: 'Arial, sans-serif' }}>
                {renderDigits()}
              </g>
            </svg>
          </div>
        </div>
      )}
      {!isValid && (
         <div className="flex flex-col items-center text-center gap-6 opacity-20 py-12">
           <div className="flex gap-2 h-24 items-end">
            {[1, 0.5, 1.2, 0.8, 1.5, 0.7, 1.1, 0.9].map((h, i) => (
              <div key={i} style={{ height: `${h * 80}%` }} className="w-3 bg-slate-900 rounded-full" />
            ))}
          </div>
          <p className="text-[14px] font-black uppercase tracking-[0.5em] text-slate-800">Cargando...</p>
        </div>
      )}
    </div>
  );
};
