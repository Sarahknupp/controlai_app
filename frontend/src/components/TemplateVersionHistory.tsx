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
import { templateService } from '../services/template.service';
import { NotificationTemplate, TemplateVersion } from '../types/template.types';
import { diffWords } from 'diff';

interface TemplateVersionHistoryProps {
  template: NotificationTemplate;
  onVersionRestored: () => void;
}

const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps> = ({
  template,
  onVersionRestored
}) => {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<TemplateVersion | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [restoreReason, setRestoreReason] = useState('');

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, template.id]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getTemplateVersions({
        templateId: template.id,
        sortBy: 'version',
        sortOrder: 'desc'
      });
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedVersion(null);
    setCompareVersion(null);
    setShowCompare(false);
    setRestoreReason('');
  };

  const handleVersionSelect = (version: TemplateVersion) => {
    setSelectedVersion(version);
    setCompareVersion(null);
    setShowCompare(false);
  };

  const handleCompare = (version: TemplateVersion) => {
    setCompareVersion(version);
    setShowCompare(true);
  };

  const handleRestore = async () => {
    if (!selectedVersion || !restoreReason) return;

    try {
      setLoading(true);
      setError(null);
      await templateService.restoreTemplateVersion(template.id, selectedVersion.version, restoreReason);
      onVersionRestored();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = (oldText: string, newText: string) => {
    const differences = diffWords(oldText, newText);
    return differences.map((part, index) => (
      <span
        key={index}
        style={{
          backgroundColor: part.added ? '#a5d6a7' : part.removed ? '#ef9a9a' : 'transparent'
        }}
      >
        {part.value}
      </span>
    ));
  };

  return (
    <>
      <IconButton onClick={handleOpen} title="Version History">
        <HistoryIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Version History
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" gap={2}>
              <List sx={{ width: '30%', borderRight: 1, borderColor: 'divider' }}>
                {versions.map((version) => (
                  <ListItem
                    key={version.id}
                    sx={{
                      bgcolor: selectedVersion?.version === version.version ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => handleVersionSelect(version)}
                    secondaryAction={
                      version.version !== template.currentVersion && (
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompare(version);
                          }}
                        >
                          <CompareIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={`Version ${version.version}`}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(version.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {version.changeReason}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ flex: 1 }}>
                {selectedVersion && !showCompare ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Version {selectedVersion.version}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Created: {new Date(selectedVersion.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Reason: {selectedVersion.changeReason}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Subject
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedVersion.subject}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Body
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedVersion.body}
                    </Typography>
                    {selectedVersion.version !== template.currentVersion && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <TextField
                          label="Restore Reason"
                          value={restoreReason}
                          onChange={(e) => setRestoreReason(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ mb: 2 }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<RestoreIcon />}
                          onClick={handleRestore}
                          disabled={!restoreReason || loading}
                        >
                          Restore This Version
                        </Button>
                      </>
                    )}
                  </>
                ) : compareVersion ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Comparing Versions
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Version vs Version {compareVersion.version}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Subject Changes
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {renderDiff(compareVersion.subject, template.subject)}
                    </Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Body Changes
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {renderDiff(compareVersion.body, template.body)}
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Select a version to view details
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplateVersionHistory; 