import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  AssignmentTurnedIn,
  Close,
  ArrowForward,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NavigateToTask = ({ open, onClose, deleteResponse }) => {
  const theme = useTheme();
  const { palette } = theme;
  const navigate = useNavigate();

  if (!deleteResponse) return null;

  const { details, navigation, message } = deleteResponse;

  const handleNavigateToTasks = () => {
    if (navigation && navigation.to) {
      navigate(navigation.to, {
        state: {
          assignedTo: details.memberId
        }
      });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          bgcolor: palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Warning sx={{ color: palette.error.main }} />
            <Typography variant="body1" fontWeight={600} color={palette.error.main}>
              Cannot Delete Team Member
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: palette.text.secondary,
              '&:hover': {
                bgcolor: palette.mode === 'light' ? '#f0f0f0' : '#4a4a4a'
              }
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          <Typography variant="body2" color={palette.text.secondary}>
            {message || 'This team member has assigned tasks and cannot be deleted.'}
          </Typography>

          {details && (
            <Box
              sx={{
                bgcolor: palette.card_button.paper,
                borderRadius: 2,
                p: 2,
                border: `1px solid ${palette.primary.main}`,
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="body2" fontWeight={600}>
                  Team Member: {details.memberName}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<AssignmentTurnedIn sx={{ color: palette.primary.main }} />}
                    label={`${details.taskCount} Total Task${details.taskCount !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: palette.mode === 'light' ? '#e8f5e9' : '#2e4a3e',
                      color: palette.text.primary,
                      border: `1px solid ${palette.primary.main}`,
                    }}
                  />
                  {details.regularTasks > 0 && (
                    <Chip
                      label={`${details.regularTasks} Regular`}
                      size="small"
                      sx={{
                        bgcolor: palette.taskStatus.in_progress,
                        color: '#ffffff',
                      }}
                    />
                  )}
                  {details.recurringTasks > 0 && (
                    <Chip
                      label={`${details.recurringTasks} Recurring`}
                      size="small"
                      sx={{
                        bgcolor: palette.taskStatus.completed,
                        color: '#ffffff',
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              bgcolor: palette.background.creme,
              borderRadius: 2,
              p: 2,
              borderLeft: `4px solid ${palette.primary.main}`,
            }}
          >
            <Typography variant="body2" color={palette.text.primary}>
              <strong>Action Required:</strong> Please reassign all tasks to another team member before deleting.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={handleNavigateToTasks}
          variant="contained"
          endIcon={<ArrowForward />}
          disableElevation
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            bgcolor: palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: palette.secondary.main,
            }
          }}
        >
          Go to Tasks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NavigateToTask;