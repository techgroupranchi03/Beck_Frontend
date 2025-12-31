import { Repeat, CalendarMonth, Event } from '@mui/icons-material';

/**
 * Utility functions to format schedule information in a human-readable format
 * Similar to crontab.guru
 */

// Day names mapping (1 = Monday, 7 = Sunday)
const DAY_NAMES = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
};

// Month names mapping (1 = January, 12 = December)
const MONTH_NAMES = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return num + 'st';
    if (j === 2 && k !== 12) return num + 'nd';
    if (j === 3 && k !== 13) return num + 'rd';
    return num + 'th';
};

/**
 * Format a list of items with proper grammar
 * Examples: 
 *   [1] => "1st"
 *   [1, 2] => "1st & 2nd"
 *   [1, 2, 3] => "1st, 2nd & 3rd"
 */
const formatList = (items, mapper = (item) => item) => {
    if (!items || items.length === 0) return '';
    
    const mapped = items.map(mapper);
    
    if (mapped.length === 1) return mapped[0];
    if (mapped.length === 2) return `${mapped[0]} & ${mapped[1]}`;
    
    const last = mapped[mapped.length - 1];
    const rest = mapped.slice(0, -1).join(', ');
    return `${rest} & ${last}`;
};

/**
 * Format weekly schedule
 * @param {Object} repeat_on - { days: [1, 2, 3] }
 * @returns {string} - "Every Monday & Tuesday"
 */
const formatWeeklySchedule = (repeat_on) => {
    if (!repeat_on || !repeat_on.days || repeat_on.days.length === 0) {
        return 'Weekly';
    }
    
    const dayNames = repeat_on.days
        .sort((a, b) => a - b)
        .map(day => DAY_NAMES[day] || `Day ${day}`);
    
    return `Every ${formatList(dayNames)}`;
};

/**
 * Format monthly schedule
 * @param {Object} repeat_on - { dates: [1, 15] }
 * @returns {string} - "On 1st & 15th of every month"
 */
const formatMonthlySchedule = (repeat_on) => {
    if (!repeat_on || !repeat_on.dates || repeat_on.dates.length === 0) {
        return 'Monthly';
    }
    
    const dates = repeat_on.dates
        .sort((a, b) => a - b)
        .map(date => getOrdinalSuffix(date));
    
    return `On ${formatList(dates)} of every month`;
};

/**
 * Format yearly schedule
 * @param {Object} repeat_on - { months: [6, 7], dates: [15, 20] }
 * @returns {string} - "On 15th & 20th of June & July"
 */
const formatYearlySchedule = (repeat_on) => {
    if (!repeat_on) {
        return 'Yearly';
    }
    
    const { months, dates } = repeat_on;
    
    if (!dates || dates.length === 0) {
        if (!months || months.length === 0) {
            return 'Yearly';
        }
        const monthNames = months
            .sort((a, b) => a - b)
            .map(month => MONTH_NAMES[month] || `Month ${month}`);
        return `Every ${formatList(monthNames)}`;
    }
    
    const dateStrings = dates
        .sort((a, b) => a - b)
        .map(date => getOrdinalSuffix(date));
    
    if (!months || months.length === 0) {
        return `On ${formatList(dateStrings)} of every month`;
    }
    
    const monthNames = months
        .sort((a, b) => a - b)
        .map(month => MONTH_NAMES[month] || `Month ${month}`);
    
    return `On ${formatList(dateStrings)} of ${formatList(monthNames)}`;
};

/**
 * Main function to format schedule information
 * @param {string} schedule_type - 'weekly', 'monthly', 'yearly', 'one_time'
 * @param {Object} repeat_on - Schedule details object
 * @returns {Object} - { icon: Repeat, label: 'Weekly', description: 'Every Monday & Tuesday' }
 */
export const formatSchedule = (schedule_type, repeat_on) => {
    if (!schedule_type || schedule_type === 'one_time') {
        return null;
    }
    
    let icon = Repeat;
    let label = '';
    let description = '';
    
    switch (schedule_type.toLowerCase()) {
        case 'weekly':
            icon = Repeat;
            label = 'Weekly';
            description = formatWeeklySchedule(repeat_on);
            break;
            
        case 'monthly':
            icon = CalendarMonth;
            label = 'Monthly';
            description = formatMonthlySchedule(repeat_on);
            break;
            
        case 'yearly':
            icon = Event;
            label = 'Yearly';
            description = formatYearlySchedule(repeat_on);
            break;
            
        default:
            return null;
    }
    
    return { icon, label, description };
};

/**
 * Convert schedule to cron expression (basic implementation)
 * Note: This is a simplified version and may not cover all edge cases
 * @param {string} schedule_type
 * @param {Object} repeat_on
 * @returns {string} - Cron expression
 */
export const toCronExpression = (schedule_type, repeat_on) => {
    if (!schedule_type || schedule_type === 'one_time') {
        return null;
    }
    
    switch (schedule_type.toLowerCase()) {
        case 'weekly':
            if (!repeat_on || !repeat_on.days || repeat_on.days.length === 0) {
                return '0 0 * * 1'; // Default to Monday
            }
            const days = repeat_on.days.join(',');
            return `0 0 * * ${days}`;
            
        case 'monthly':
            if (!repeat_on || !repeat_on.dates || repeat_on.dates.length === 0) {
                return '0 0 1 * *'; // Default to 1st of every month
            }
            const dates = repeat_on.dates.join(',');
            return `0 0 ${dates} * *`;
            
        case 'yearly':
            if (!repeat_on) {
                return '0 0 1 1 *'; // Default to January 1st
            }
            const { months = [1], dates: yearDates = [1] } = repeat_on;
            return `0 0 ${yearDates.join(',')} ${months.join(',')} *`;
            
        default:
            return null;
    }
};

export default formatSchedule;
