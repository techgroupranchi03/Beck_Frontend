import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Checkbox,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Stack,
  Collapse,
  Divider,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  FilterList,
  ExpandMore,
  ExpandLess,
  Person,
  Home,
} from '@mui/icons-material';
import { useTaskData } from './useTaskData';
import { useSnackbar } from '../../../resuable_components/Snackbar';
import { addClientExistingTaskInsideGroupTask } from '../../../service/Clients/Task';
import { formatSchedule } from '../../../utils/scheduleFormatter';
import { useTheme } from '@mui/material/styles';
import { formatDate } from '../../../utils/dateFormat';
import { useAuth } from '../../../context/AuthContext';
import { addTeamExistingTaskInsideGroupTask } from '../../../service/Teams/Team_Task';


const FilterSection = ({ title, icon, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);


  return (
    <Box sx={{ mb: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          py: 1,
          px: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ pl: 1, pt: 0.5, pb: 0.5 }}>{children}</Box>
      </Collapse>
    </Box>
  );
};

const AddExistingTaskInsideGroupTask = ({ open, onClose, groupId }) => {
  const theme = useTheme();
  const { palette } = theme;
  const { user } = useAuth();
  const isTeamUser = user?.role === 'team';

  const {
    allTasksData,
    fetchAllTasks,
    allTaskPagination,
    loading,
    teamMembers,
    properties
  } = useTaskData();

  console.log("All Tasks Data:", allTasksData);

  const { showSnackbar } = useSnackbar();

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const observerTarget = useRef(null);
  const searchTimeout = useRef(null);

  // Filter tasks (only regular tasks, not group tasks)
  const allTaskData = useMemo(() => {
    if (!allTasksData) return [];
    const tasks = allTasksData.tasks || [];
    
    // Apply filters
    return tasks.filter((task) => {
      const matchesUser = selectedUsers.length === 0 || selectedUsers.includes(task.assigned_to?.id);
      const matchesProperty = selectedProperties.length === 0 || selectedProperties.includes(task.property?.id);
      return matchesUser && matchesProperty;
    });
  }, [allTasksData, selectedUsers, selectedProperties]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTasks([]);
      setSearchText('');
      setCurrentPage(1);
      setSelectedUsers([]);
      setSelectedProperties([]);
      fetchAllTasks({}, '', 1, false, 10);
    }
  }, [open, fetchAllTasks]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce search
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchAllTasks({}, value.trim(), 1, false, 10);
    }, 400);
  };

  // Infinite scroll
  const loadMoreTasks = useCallback(async () => {
    if (!allTaskPagination?.hasNextPage || isLoadingMore || loading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await fetchAllTasks({}, searchText.trim(), nextPage, true, 10);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more tasks:', error);
      showSnackbar('Failed to load more tasks', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  }, [allTaskPagination?.hasNextPage, isLoadingMore, loading, currentPage, fetchAllTasks, searchText, showSnackbar]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreTasks();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreTasks]);

  const handleTaskToggle = (task) => {
    setSelectedTasks((prev) => {
      const isSelected = prev.some((t) => t.id === task.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== task.id);
      }
      return [...prev, task];
    });
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handlePropertyToggle = (propertyId) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const clearAllFilters = () => {
    setSelectedUsers([]);
    setSelectedProperties([]);
  };

  const activeFilterCount =
    selectedUsers.length + selectedProperties.length;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const taskIds = selectedTasks.map((task) => task.id);
      console.log("Task Ids:", taskIds);
      const res = isTeamUser
        ? await addTeamExistingTaskInsideGroupTask(groupId, { task_ids: taskIds })
        : await addClientExistingTaskInsideGroupTask(groupId, { task_ids: taskIds });
      showSnackbar(res?.message, 'success');
      onClose(true);
    } catch (error) {
      console.error('Error adding tasks:', error);
      showSnackbar(error?.message || 'Failed to add tasks', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !isSaving && onClose(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '80vh' } }}
    >
      <DialogTitle sx={{ pb: 2, pr: 6 }}>
        Add Existing Tasks to Group
        <IconButton
          onClick={() => !isSaving && onClose(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 0, px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks by title..."
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: loading && <CircularProgress size={10} sx={{ ml: 1 }} />
            }}
          />
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            disableElevation
            sx={{
              minWidth: 120,
              position: 'relative',
              '&:hover': {
                bgcolor: palette.secondary.main,
              },
            }}
          >
            Filters
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>
        </Stack>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Active filters:
            </Typography>
            {selectedUsers.map((userId) => {
              const user = teamMembers?.find((u) => u.id === userId);
              return (
                <Chip
                  key={userId}
                  label={user?.name || 'Unknown'}
                  size="small"
                  onDelete={() => handleUserToggle(userId)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
            {selectedProperties.map((propertyId) => {
              const property = properties?.find((p) => p.id === propertyId);
              return (
                <Chip
                  key={propertyId}
                  label={property?.name || 'Unknown'}
                  size="small"
                  onDelete={() => handlePropertyToggle(propertyId)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
            <Button size="small" onClick={clearAllFilters}>
              Clear all
            </Button>
          </Box>
        )}

        {/* Filter Panel */}
        <Collapse in={showFilters} sx={{ mb: 2 }}>
          <Box sx={{ px: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Box sx={{ py: 2 }}>
              {/* Assigned To Filter */}
              {teamMembers && teamMembers.length > 0 && (
                <FilterSection title="Assigned To" icon={<Person fontSize="small" color="primary" />}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {teamMembers.map((user) => (
                      <Chip
                        key={user.id}
                        size="small"
                        avatar={
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                        }
                        label={user.name}
                        onClick={() => handleUserToggle(user.id)}
                        color={selectedUsers.includes(user.id) ? 'primary' : 'default'}
                        variant={selectedUsers.includes(user.id) ? 'filled' : 'outlined'}
                        px={0.5}
                      />
                    ))}
                  </Stack>
                </FilterSection>
              )}

              {/* Property Filter */}
              {properties && properties.length > 0 && (
                <FilterSection title="Property" icon={<Home fontSize="small" color="primary" />}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {properties.map((property) => (
                      <Chip
                        size="small"
                        key={property.id}
                        label={property.name}
                        onClick={() => handlePropertyToggle(property.id)}
                        color={selectedProperties.includes(property.id) ? 'primary' : 'default'}
                        variant={selectedProperties.includes(property.id) ? 'filled' : 'outlined'}
                        px={0.5}
                      />
                    ))}
                  </Stack>
                </FilterSection>
              )}
            </Box>
          </Box>
        </Collapse>

        {/* Task list with infinite scroll */}
        <Box
          sx={{
            maxHeight: '380px',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
          }}
        >
          {loading && currentPage === 1 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : allTaskData.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
              No tasks found
            </Box>
          ) : (
            <List disablePadding>
              {allTaskData.map((task) => {
                const isSelected = selectedTasks.some((t) => t.id === task.id);
                const scheduleInfo = formatSchedule(task.schedule?.type, task.schedule?.recurrence_rule);

                return (
                  <ListItem
                    key={task.id}
                    button
                    onClick={() => handleTaskToggle(task)}
                    sx={{
                      border: 'none',
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox edge="start" checked={isSelected} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title.charAt(0).toUpperCase() + task.title.slice(1)}
                      secondary={
                        <>
                          {scheduleInfo && (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mt: 0.5 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: palette.primary.main,
                                }}
                              >
                                <scheduleInfo.icon fontSize="small" />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: palette.primary.main,
                                  fontSize: '0.813rem',
                                }}
                              >
                                {scheduleInfo.description}
                              </Typography>
                            </Stack>
                          )}

                          {task.schedule?.recurrence_rule?.dates && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: palette.text.secondary,
                                fontSize: '0.813rem',
                                mt: 0.5,
                              }}
                            >
                              Dates: {task.schedule.recurrence_rule.dates.map((date) => formatDate(date)).join(', ')}
                            </Typography>
                          )}

                          {task.schedule?.start_date && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: palette.text.secondary,
                                fontSize: '0.813rem',
                                mt: 0.5,
                              }}
                            >
                              Scheduled on: {formatDate(task.schedule.start_date)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                );
              })}

              <div ref={observerTarget} style={{ height: '20px' }} />

              {isLoadingMore && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={selectedTasks.length === 0 || isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
          sx={{
            borderRadius: 10,
            px: 4,
            height: 28,
            fontSize: '0.800rem',
          }}
        >
          {isSaving ? 'Adding...' : `Add ${selectedTasks.length > 0 ? `(${selectedTasks.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExistingTaskInsideGroupTask;