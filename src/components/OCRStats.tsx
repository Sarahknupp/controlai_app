import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Table } from 'react-bootstrap';
import { FaChartLine, FaCheck, FaTimes } from 'react-icons/fa';
import { ocrService, OCRStats as OCRStatsType } from '../services/ocr.service';

export const OCRStats: React.FC = () => {
  const [stats, setStats] = useState<OCRStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await ocrService.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <div className="text-danger">
            <FaTimes className="me-2" />
            {error}
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const successRate = (stats.successfulScans / stats.totalScans) * 100;

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <FaChartLine className="me-2" />
          Estatísticas do OCR
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Total de Scans</h6>
                <h3 className="mb-0">{stats.totalScans}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Scans com Sucesso</h6>
                <h3 className="mb-0 text-success">{stats.successfulScans}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Scans com Falha</h6>
                <h3 className="mb-0 text-danger">{stats.failedScans}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Confiança Média</h6>
                <h3 className="mb-0">{stats.averageConfidence.toFixed(1)}%</h3>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Taxa de Sucesso</h6>
                <ProgressBar
                  now={successRate}
                  label={`${successRate.toFixed(1)}%`}
                  variant={successRate >= 80 ? 'success' : successRate >= 50 ? 'warning' : 'danger'}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Último Scan</h6>
                <p className="mb-0">
                  {new Date(stats.lastScanDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {stats.commonErrors.length > 0 && (
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">Erros Comuns</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Erro</th>
                        <th>Ocorrências</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.commonErrors.map((error, index) => (
                        <tr key={index}>
                          <td>{error.error}</td>
                          <td>{error.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 