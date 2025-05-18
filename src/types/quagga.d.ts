declare module 'quagga' {
  interface QuaggaConfig {
    inputStream?: {
      name?: string;
      type?: string;
      target?: any;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
      singleChannel?: boolean;
    };
    tracking?: boolean;
    debug?: boolean;
    locate?: boolean;
    numOfWorkers?: number;
    decoder?: {
      readers?: string[];
      debug?: {
        drawBoundingBox?: boolean;
        showFrequency?: boolean;
        drawScanline?: boolean;
        showPattern?: boolean;
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
  }

  interface QuaggaStatic {
    init(config: QuaggaConfig, callback?: (err: Error | null) => void): Promise<void>;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    offDetected(callback: (result: QuaggaResult) => void): void;
    decodeSingle(config: QuaggaConfig, callback: (result: QuaggaResult | null) => void): void;
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
} 