import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Slide,
    Typography,
    useTheme,
    TextField,
    Grid,
    Autocomplete,
    Menu,
    FormControl,
    MenuItem,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TileView_AddEdit_Dialog = ({ open, onClose, onSave, task }) => {
    const isEdit = !!task;
    const theme = useTheme();
    const { palette } = theme;

    const listofProperties = [
        "RaiChandani",
        "Tech Office",
        "Main Building",
        "Warehouse"
    ];
    const listofInventoryItems = [
        "Shampoo",
        "Elevator",
        "Chair",
        "Table",
        "Lamp"
    ];

    const taskTypes = [
        "Maintenance",
        "Repair",
        "Inspection",
        "Cleaning"
    ];

    const handleSubmit = () => {
        // Just close the dialog - no API calls
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            aria-describedby='task-dialog-description'
            TransitionComponent={Transition}
        >
            <DialogTitle>
                {isEdit ? 'Edit Task' : 'Add Task'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {/* Form fields will be added here */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Task Name"
                            defaultValue={isEdit ? task.name : ''}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            size="small"
                            required
                            error={Boolean(isEdit && !task.name)}
                            helperText={isEdit && !task.name ? 'Task Name is required' : ''}
                        />
                        {/* describe field */}
                        <TextField
                            label="Description"
                            defaultValue={isEdit ? task.description : ''}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            size="small"
                            multiline
                            rows={4}
                        />
                        {/* list of properties field autocomplete dropdown */}
                        <Autocomplete
                            options={listofProperties}
                            defaultValue={isEdit ? task.property : null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Property"
                                    margin="normal"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                        {/* list of inventory items field autocomplete dropdown */}
                        <Autocomplete
                            options={listofInventoryItems}
                            defaultValue={isEdit ? task.inventoryItem : null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Inventory Item"
                                    margin="normal"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                        {/* task type field dropdown */}
                        <FormControl fullWidth margin="normal">
                            <TextField
                                select
                                label="Task Type"
                                defaultValue={isEdit ? task.type : ''}
                                size="small"
                                variant="outlined"
                            >
                                {taskTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>


                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='text'
                    size='small'
                    sx={{ textTransform: 'none' }}
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    disableElevation
                    size='small'
                    onClick={handleSubmit}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: palette.primary.main,
                        '&:hover': { backgroundColor: palette.secondary.main }
                    }}
                >
                    {isEdit ? 'Save ' : 'Add Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default TileView_AddEdit_Dialog