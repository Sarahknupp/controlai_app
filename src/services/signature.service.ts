import { createHash, createSign, createVerify } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface SignatureMetadata {
  timestamp: string;
  issuer: string;
  serialNumber: string;
  algorithm: string;
}

export class SignatureService {
  private static instance: SignatureService;
  private privateKeyPath: string;
  private publicKeyPath: string;
  private readonly SIGNATURE_ALGORITHM = 'SHA256';

  private constructor() {
    this.privateKeyPath = path.join(process.cwd(), 'config', 'keys', 'private.pem');
    this.publicKeyPath = path.join(process.cwd(), 'config', 'keys', 'public.pem');
  }

  public static getInstance(): SignatureService {
    if (!SignatureService.instance) {
      SignatureService.instance = new SignatureService();
    }
    return SignatureService.instance;
  }

  private async loadKey(keyPath: string): Promise<string> {
    try {
      return await fs.readFile(keyPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load key from ${keyPath}: ${error}`);
    }
  }

  private generateSerialNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return createHash('sha256')
      .update(timestamp + random)
      .digest('hex')
      .substring(0, 16);
  }

  public async signPDF(pdfBuffer: Buffer, metadata: { issuer: string }): Promise<{
    signature: string;
    metadata: SignatureMetadata;
  }> {
    try {
      const privateKey = await this.loadKey(this.privateKeyPath);
      
      // Criar metadados da assinatura
      const signatureMetadata: SignatureMetadata = {
        timestamp: new Date().toISOString(),
        issuer: metadata.issuer,
        serialNumber: this.generateSerialNumber(),
        algorithm: this.SIGNATURE_ALGORITHM
      };

      // Criar string para assinar (PDF + metadados)
      const dataToSign = Buffer.concat([
        pdfBuffer,
        Buffer.from(JSON.stringify(signatureMetadata))
      ]);

      // Criar assinatura
      const signer = createSign(this.SIGNATURE_ALGORITHM);
      signer.update(dataToSign);
      const signature = signer.sign(privateKey, 'base64');

      return {
        signature,
        metadata: signatureMetadata
      };
    } catch (error) {
      throw new Error(`Failed to sign PDF: ${error}`);
    }
  }

  public async verifySignature(
    pdfBuffer: Buffer,
    signature: string,
    metadata: SignatureMetadata
  ): Promise<boolean> {
    try {
      const publicKey = await this.loadKey(this.publicKeyPath);

      // Recriar dados originais
      const dataToVerify = Buffer.concat([
        pdfBuffer,
        Buffer.from(JSON.stringify(metadata))
      ]);

      // Verificar assinatura
      const verifier = createVerify(this.SIGNATURE_ALGORITHM);
      verifier.update(dataToVerify);
      
      return verifier.verify(publicKey, signature, 'base64');
    } catch (error) {
      throw new Error(`Failed to verify signature: ${error}`);
    }
  }

  public async embedSignature(
    pdfBuffer: Buffer,
    signature: string,
    metadata: SignatureMetadata
  ): Promise<Buffer> {
    // Criar objeto com dados da assinatura
    const signatureData = {
      signature,
      metadata,
      version: '1.0'
    };

    // Converter para string base64
    const signatureBlock = Buffer.from(
      JSON.stringify(signatureData),
      'utf8'
    ).toString('base64');

    // Adicionar ao final do PDF como comentário
    const signedPdf = Buffer.concat([
      pdfBuffer,
      Buffer.from(`\n%%ControlAISignature:${signatureBlock}%%`)
    ]);

    return signedPdf;
  }

  public async extractSignature(pdfBuffer: Buffer): Promise<{
    pdfWithoutSignature: Buffer;
    signature?: string;
    metadata?: SignatureMetadata;
  }> {
    const pdfString = pdfBuffer.toString('utf8');
    const signatureMatch = pdfString.match(/%%ControlAISignature:(.+)%%/);

    if (!signatureMatch) {
      return { pdfWithoutSignature: pdfBuffer };
    }

    try {
      const signatureData = JSON.parse(
        Buffer.from(signatureMatch[1], 'base64').toString('utf8')
      );

      // Remover bloco de assinatura do PDF
      const pdfWithoutSignature = Buffer.from(
        pdfString.replace(/\n%%ControlAISignature:.+%%/, ''),
        'utf8'
      );

      return {
        pdfWithoutSignature,
        signature: signatureData.signature,
        metadata: signatureData.metadata
      };
    } catch (error) {
      throw new Error(`Failed to extract signature: ${error}`);
    }
  }
} 