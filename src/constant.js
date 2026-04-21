// Inventory


import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import WeekendIcon from '@mui/icons-material/Weekend';
import KitchenIcon from '@mui/icons-material/Kitchen';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import BuildIcon from '@mui/icons-material/Build';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Handyman } from '@mui/icons-material';

export const categoriess = [
    { label: 'Electronics', value: 'electronics', icon: ElectricalServicesIcon },
    { label: 'Furniture', value: 'furniture', icon: WeekendIcon },
    { label: 'Applicances', value: 'applicances', icon: KitchenIcon },
    { label: 'Safety', value: 'safety', icon: HealthAndSafetyIcon },
    { label: 'Maintenance', value: 'maintenace', icon: BuildIcon },
    { label: 'Outdoor', value: 'outdoor', icon: NaturePeopleIcon },
    { label: 'Cleaning', value: 'cleaning', icon: CleaningServicesIcon },
];
export const categories = [
    'electronics',
    'furniture',
    'applicances',
    'safety',
    'maintenance',
    'outdoor',
    'cleaning',
];

// task

export const taskTypesOptions = [
    { label: 'Cleaning', value: 'cleaning', icon: CleaningServicesIcon },
    { label: 'Maintenance', value: 'maintenance', icon: BuildIcon },
    { label: 'Inspection', value: 'inspection', icon: HealthAndSafetyIcon },
    { label: 'Repair', value: 'repair', icon: Handyman },
    { label: 'Others', value: 'others', icon: MoreHorizIcon },
];

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
    { value: 'completed', label: 'Completed' },
    { value: 'skipped', label: 'Skipped' },
];

export const taskStatusFilter = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'skipped', label: 'Skipped' },
];

export const scheduleTypes = [
    'weekly',
    'monthly',
    'yearly',
    'fixed_dates',
];

export const scheduleTypeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'fixed_dates', label: 'Fixed Dates' },
];

export const daysOfWeek = [
    // i need here value 1 to 7 for sunday to saturday
    { label: 'Monday', shortLabel: 'Mon', value: 1 },
    { label: 'Tuesday', shortLabel: 'Tue', value: 2 },
    { label: 'Wednesday', shortLabel: 'Wed', value: 3 },
    { label: 'Thursday', shortLabel: 'Thu', value: 4 },
    { label: 'Friday', shortLabel: 'Fri', value: 5 },
    { label: 'Saturday', shortLabel: 'Sat', value: 6 },
    { label: 'Sunday', shortLabel: 'Sun', value: 7 }
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




export const units = [
    { label: "Piece", value: "piece" },
    { label: "Liters", value: "liters" },
    { label: "KG", value: "kg" },
    { label: "Container", value: "container" }
];

export const containerOptions = [
    { label: "Full", value: "100%" },
    { label: "75%", value: "75%" },
    { label: "Half", value: "50%" },
    { label: "Quarter", value: "25%" },
    { label: "Empty", value: "empty" }
];

export const containerTypes = [
    { label: "Bottle", value: "bottle", icon: "🍶" },
    { label: "Jar", value: "jar", icon: "🫙" },
    { label: "Jug", value: "jug", icon: "🫗" },
    { label: "Can", value: "can", icon: "🥫" },
    { label: "Drum", value: "drum", icon: "🛢️" },
    { label: "Tank", value: "tank", icon: "⛽" },
    { label: "Bucket", value: "bucket", icon: "🪣" },
    { label: "Box", value: "box", icon: "📦" },
    { label: "Cylinder", value: "cylinder", icon: "🔴" },
    { label: "Spray Bottle", value: "spray_bottle", icon: "🧴" },
];

export const quantityConfig = {
    piece: { step: 0.5, min: 0, max: 9999, quickFill: [0.5, 1, 5, 10], unitSuffix: '' },
    liters: { step: 0.1, min: 0, max: 9999, quickFill: [0.5, 1.0, 5.0], unitSuffix: 'L' },
    kg: { step: 0.1, min: 0, max: 9999, quickFill: [0.5, 1.0, 5.0], unitSuffix: 'kg' },
};

export const palette = {
    layout: '#132421',
    active: '#407f68',
    interactive: '#6b603f',
    notifications: '#96d980',
    surface: '#fef7c5',
};


