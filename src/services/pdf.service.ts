import puppeteer from 'puppeteer';
import { PDFOptions } from 'puppeteer';

export class PDFService {
  private static instance: PDFService;
  private readonly COMPRESSION_QUALITIES = {
    high: { quality: 100, compress: false },
    medium: { quality: 80, compress: true },
    low: { quality: 60, compress: true }
  };

  private constructor() {}

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async generatePDF(
    html: string,
    options: {
      quality?: 'high' | 'medium' | 'low';
      format?: 'A4' | 'Letter';
      landscape?: boolean;
    } = {}
  ): Promise<Buffer> {
    const { quality = 'high', format = 'A4', landscape = false } = options;
    const compressionSettings = this.COMPRESSION_QUALITIES[quality];

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOptions: PDFOptions = {
        format,
        landscape,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        preferCSSPageSize: true
      };

      if (compressionSettings.compress) {
        // Aplicar configurações de compressão
        Object.assign(pdfOptions, {
          omitBackground: true,
          scale: quality === 'low' ? 0.8 : 1,
        });

        // Otimizar imagens
        await page.evaluate((quality) => {
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            img.style.imageRendering = quality === 'low' ? 'pixelated' : 'auto';
            if (quality === 'low') {
              img.style.filter = 'blur(0.5px)';
            }
          });
        }, quality);
      }

      const pdf = await page.pdf(pdfOptions);
      return pdf;

    } finally {
      await browser.close();
    }
  }

  public async optimizePDF(
    pdfBuffer: Buffer,
    quality: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<Buffer> {
    // Se a qualidade for alta, retorna o buffer original
    if (quality === 'high') {
      return pdfBuffer;
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Carregar PDF como data URL
      const pdfBase64 = pdfBuffer.toString('base64');
      await page.goto(`data:application/pdf;base64,${pdfBase64}`, {
        waitUntil: 'networkidle0'
      });

      // Configurações de compressão baseadas na qualidade
      const compressionSettings = this.COMPRESSION_QUALITIES[quality];
      
      // Gerar PDF otimizado
      const optimizedPdf = await page.pdf({
        printBackground: false,
        omitBackground: true,
        scale: quality === 'low' ? 0.8 : 0.9,
        preferCSSPageSize: true
      });

      return optimizedPdf;

    } finally {
      await browser.close();
    }
  }
} 