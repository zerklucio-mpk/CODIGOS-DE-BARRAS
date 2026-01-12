
export interface BarcodeRecord {
  id: string;
  code: string;
  label: string;
  timestamp: number;
  type: 'EAN13' | 'CODE128';
}
