import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { NotificationTemplate, TemplateVersion } from '../types/template.types';
import { diffWords } from 'diff';
import { servicoTemplate, TemplateNotificacao, VersaoTemplate } from '../services/service-template';

interface TemplateVersionHistoryProps {
  template: TemplateNotificacao;
  aoRestaurarVersao: () => void;
}

const HistoricoVersaoTemplate: React.FC<TemplateVersionHistoryProps> = ({
  template,
  aoRestaurarVersao
}) => {
  const [aberto, setAberto] = useState(false);
  const [versoes, setVersoes] = useState<VersaoTemplate[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [versaoSelecionada, setVersaoSelecionada] = useState<VersaoTemplate | null>(null);
  const [versaoComparacao, setVersaoComparacao] = useState<VersaoTemplate | null>(null);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const [motivoRestauracao, setMotivoRestauracao] = useState('');

  useEffect(() => {
    if (aberto) {
      buscarVersoes();
    }
  }, [aberto, template.id]);

  const buscarVersoes = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await servicoTemplate.obterVersoesTemplate({
        idTemplate: template.id,
        ordenarPor: 'versao',
        ordem: 'desc'
      });
      setVersoes(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao buscar versões');
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrir = () => setAberto(true);
  const handleFechar = () => {
    setAberto(false);
    setVersaoSelecionada(null);
    setVersaoComparacao(null);
    setMostrarComparacao(false);
    setMotivoRestauracao('');
  };

  const handleSelecionarVersao = (versao: VersaoTemplate) => {
    setVersaoSelecionada(versao);
    setVersaoComparacao(null);
    setMostrarComparacao(false);
  };

  const handleComparar = (versao: VersaoTemplate) => {
    setVersaoComparacao(versao);
    setMostrarComparacao(true);
  };

  const handleRestaurar = async () => {
    if (!versaoSelecionada || !motivoRestauracao) return;

    try {
      setCarregando(true);
      setErro(null);
      await servicoTemplate.restaurarVersaoTemplate(template.id, versaoSelecionada.versao, motivoRestauracao);
      aoRestaurarVersao();
      handleFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao restaurar versão');
    } finally {
      setCarregando(false);
    }
  };

  const renderizarDiferencas = (textoAntigo: string, textoNovo: string) => {
    const diferencas = diffWords(textoAntigo, textoNovo);
    return diferencas.map((parte, indice) => (
      <span
        key={indice}
        style={{
          backgroundColor: parte.added ? '#a5d6a7' : parte.removed ? '#ef9a9a' : 'transparent'
        }}
      >
        {parte.value}
      </span>
    ));
  };

  return (
    <>
      <IconButton onClick={handleAbrir} title="Histórico de Versões">
        <HistoryIcon />
      </IconButton>

      <Dialog open={aberto} onClose={handleFechar} maxWidth="md" fullWidth>
        <DialogTitle>
          Histórico de Versões
          <IconButton
            onClick={handleFechar}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          {carregando ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" gap={2}>
              <List sx={{ width: '30%', borderRight: 1, borderColor: 'divider' }}>
                {versoes.map((versao) => (
                  <ListItem
                    key={versao.id}
                    sx={{
                      bgcolor: versaoSelecionada?.versao === versao.versao ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => handleSelecionarVersao(versao)}
                    secondaryAction={
                      versao.versao !== template.versaoAtual && (
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComparar(versao);
                          }}
                        >
                          <CompareIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={`Versão ${versao.versao}`}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(versao.dataCriacao).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {versao.motivoAlteracao}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ flex: 1 }}>
                {versaoSelecionada && !mostrarComparacao ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Versão {versaoSelecionada.versao}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Criado em: {new Date(versaoSelecionada.dataCriacao).toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Motivo: {versaoSelecionada.motivoAlteracao}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Assunto
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {versaoSelecionada.assunto}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Corpo
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {versaoSelecionada.corpo}
                    </Typography>
                    {versaoSelecionada.versao !== template.versaoAtual && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <TextField
                          label="Motivo da Restauração"
                          value={motivoRestauracao}
                          onChange={(e) => setMotivoRestauracao(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<RestoreIcon />}
                          onClick={handleRestaurar}
                          disabled={!motivoRestauracao || carregando}
                        >
                          Restaurar Esta Versão
                        </Button>
                      </>
                    )}
                  </>
                ) : versaoComparacao ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Comparando Versões
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Versão Atual vs Versão {versaoComparacao.versao}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Alterações no Assunto
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {renderizarDiferencas(versaoComparacao.assunto, template.assunto)}
                    </Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Alterações no Corpo
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {renderizarDiferencas(versaoComparacao.corpo, template.corpo)}
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Selecione uma versão para ver detalhes
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleFechar}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HistoricoVersaoTemplate; 