import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Tabs, Tab, Form, Button, Alert } from 'react-bootstrap';
import { ProductImportOCR } from '../components/ProductImportOCR';
import { OCRStats } from '../components/OCRStats';
import { ProductImportResult } from '../services/ocr.service';
import { FaFileImport, FaChartLine, FaCog, FaSave, FaUndo } from 'react-icons/fa';
import { useOCRConfig } from '../hooks/useOCRConfig';

export const ProductImportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [lastImport, setLastImport] = useState<ProductImportResult | null>(null);
  const {
    config,
    rules,
    loading,
    error,
    updateConfig,
    updateRules,
    reset,
  } = useOCRConfig();

  const handleImportComplete = (result: ProductImportResult) => {
    setLastImport(result);
  };

  const handleConfigSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newConfig = {
        language: formData.get('language') as string,
        minConfidence: Number(formData.get('minConfidence')),
        autoCorrect: formData.get('autoCorrect') === 'on',
        validateData: formData.get('validateData') === 'on',
      };
      await updateConfig(newConfig);
    },
    [updateConfig]
  );

  const handleRulesSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newRules = {
        codeFormat: formData.get('codeFormat') as string,
        defaultCategories: formData.getAll('defaultCategories') as string[],
        defaultBrand: formData.get('defaultBrand') as string,
        createCategories: formData.get('createCategories') === 'on',
      };
      await updateRules(newRules);
    },
    [updateRules]
  );

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Importação de Produtos</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'import')}
        className="mb-4"
      >
        <Tab
          eventKey="import"
          title={
            <span>
              <FaFileImport className="me-2" />
              Importar
            </span>
          }
        >
          <Row>
            <Col md={8}>
              <ProductImportOCR onImportComplete={handleImportComplete} />
            </Col>
            <Col md={4}>
              <OCRStats />
            </Col>
          </Row>
        </Tab>

        <Tab
          eventKey="stats"
          title={
            <span>
              <FaChartLine className="me-2" />
              Estatísticas
            </span>
          }
        >
          <Row>
            <Col>
              <OCRStats />
            </Col>
          </Row>
        </Tab>

        <Tab
          eventKey="settings"
          title={
            <span>
              <FaCog className="me-2" />
              Configurações
            </span>
          }
        >
          <Row>
            <Col md={6}>
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Configurações do OCR</h5>
                </div>
                <div className="card-body">
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleConfigSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Idioma</Form.Label>
                      <Form.Select name="language" defaultValue={config.language}>
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es">Español</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confiança Mínima: {config.minConfidence}%</Form.Label>
                      <Form.Range
                        name="minConfidence"
                        min="0"
                        max="100"
                        step="5"
                        defaultValue={config.minConfidence}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="autoCorrect"
                        name="autoCorrect"
                        label="Correção Automática"
                        defaultChecked={config.autoCorrect}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="validateData"
                        name="validateData"
                        label="Validar Dados"
                        defaultChecked={config.validateData}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading}>
                        <FaSave className="me-2" />
                        Salvar Configurações
                      </Button>
                      <Button type="button" variant="secondary" onClick={reset} disabled={loading}>
                        <FaUndo className="me-2" />
                        Restaurar Padrão
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Regras de Importação</h5>
                </div>
                <div className="card-body">
                  <Form onSubmit={handleRulesSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Formato do Código</Form.Label>
                      <Form.Control
                        type="text"
                        name="codeFormat"
                        placeholder="Ex: PROD-{NUMBER}"
                        defaultValue={rules.codeFormat}
                      />
                      <Form.Text className="text-muted">
                        Use {'{NUMBER}'} para gerar números sequenciais
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Categorias Padrão</Form.Label>
                      <Form.Select
                        name="defaultCategories"
                        multiple
                        defaultValue={rules.defaultCategories}
                      >
                        <option value="eletronicos">Eletrônicos</option>
                        <option value="vestuario">Vestuário</option>
                        <option value="alimentos">Alimentos</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="limpeza">Limpeza</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Segure Ctrl (ou Cmd) para selecionar múltiplas categorias
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Marca Padrão</Form.Label>
                      <Form.Control
                        type="text"
                        name="defaultBrand"
                        placeholder="Ex: Marca Própria"
                        defaultValue={rules.defaultBrand}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="createCategories"
                        name="createCategories"
                        label="Criar Categorias Automaticamente"
                        defaultChecked={rules.createCategories}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading}>
                        <FaSave className="me-2" />
                        Salvar Regras
                      </Button>
                      <Button type="button" variant="secondary" onClick={reset} disabled={loading}>
                        <FaUndo className="me-2" />
                        Restaurar Padrão
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
}; 