// Inventory

export const categories = [
    'electronics',
    'furniture',
    'applicances',
    'safety',
    'maintenace',
    'outdoor',
    'cleaning',
];

// task

export const taskTypes = [
    'cleaning',
    'maintenance',
    'inspection',
    'repair',
    'other',
];

export const statusOpts = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'over_due', label: 'Overdue' },
    { value: 'deleted', label: 'Deleted' },
];

export const taskStatusFilter = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'over_due', label: 'Overdue' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
];

export const scheduleTypes = [
    'one_time',
    'daily',
    'weekly',
    'monthly',
    'yearly'
];

export const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

export const monthsOfYear = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// Generate dates 1-31 for monthly selection
export const datesOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

export const recurringTypes = [
    'daily',
    'weekly',
    'monthly',
    'yearly',
];

// Team
export const TeamStatus = [
    'active',
    'inactive',
    'on-leave',
];