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
    'others',
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
    // i need here value 1 to 7 for sunday to saturday
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
];

export const monthsOfYear = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
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