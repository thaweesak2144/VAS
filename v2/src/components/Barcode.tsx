'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
}

export default function Barcode({ value, width = 2, height = 60 }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: true,
          fontSize: 12,
          margin: 4,
          fontOptions: 'bold',
        });
      } catch {
        // invalid barcode value
      }
    }
  }, [value, width, height]);

  return <svg ref={svgRef} />;
}
