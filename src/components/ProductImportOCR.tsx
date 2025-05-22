import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, ProgressBar, Alert, Table } from 'react-bootstrap';
import { FaCloudUploadAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { useProductImport } from '../hooks/useProductImport';
import { ProductImportResult } from '../services/ocr.service';

interface ProductImportOCRProps {
  onImportComplete?: (result: ProductImportResult) => void;
}

export const ProductImportOCR: React.FC<ProductImportOCRProps> = ({ onImportComplete }) => {
  const {
    loading,
    progress,
    error,
    result,
    importProducts,
  } = useProductImport();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        await importProducts(file);
        if (result && onImportComplete) {
          onImportComplete(result);
        }
      }
    },
    [importProducts, result, onImportComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <Card>
      <Card.Body>
        <div
          {...getRootProps()}
          className={`dropzone p-5 text-center ${
            isDragActive ? 'active' : ''
          } ${loading ? 'disabled' : ''}`}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt size={48} className="mb-3 text-primary" />
          <h4>Arraste e solte uma imagem aqui</h4>
          <p className="text-muted">
            ou clique para selecionar uma imagem (PNG, JPG, JPEG)
          </p>
        </div>

        {loading && (
          <div className="mt-4">
            <ProgressBar now={progress} label={`${progress}%`} />
            <p className="text-center mt-2">Processando imagem...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-4">
            <FaTimes className="me-2" />
            {error}
          </Alert>
        )}

        {result && (
          <div className="mt-4">
            <Alert variant={result.success ? 'success' : 'warning'}>
              <FaCheck className="me-2" />
              Importação concluída com {result.stats.successful} produtos importados
              com sucesso e {result.stats.failed} falhas.
            </Alert>

            {result.products.length > 0 && (
              <div className="mt-4">
                <h5>Produtos Importados</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nome</th>
                      <th>Preço</th>
                      <th>Quantidade</th>
                      <th>Categoria</th>
                      <th>Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.products.map((product) => (
                      <tr key={product.code}>
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td>R$ {product.price.toFixed(2)}</td>
                        <td>{product.quantity}</td>
                        <td>{product.category || '-'}</td>
                        <td>{product.brand || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h5>Erros</h5>
                <ul className="list-unstyled">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-danger">
                      <FaTimes className="me-2" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 