import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, useTheme } from '@mui/material';
import { containerOptions } from '../constant';

// Reference marks on the side of the container
const REFERENCE_MARKS = [
    { label: 'Full', percent: 100 },
    { label: '75%', percent: 75 },
    { label: 'Half', percent: 50 },
    { label: '25%', percent: 25 },
    { label: 'Empty', percent: 0 },
];

// SVG dimensions
const W = 160, H = 220;
// Body bounds (where the draggable fill lives)
const BODY_TOP = 70, BODY_BOTTOM = 210;
const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;
const BODY_LEFT = 25, BODY_RIGHT = 95;

const percentToY = (pct) => BODY_BOTTOM - (pct / 100) * BODY_HEIGHT;
const yToPercent = (y) => Math.max(0, Math.min(100, ((BODY_BOTTOM - y) / BODY_HEIGHT) * 100));

// Snap to nearest 0.5 increment for precision
const snapToHalf = (pct) => Math.round(pct * 2) / 2;

// Container shape SVG paths for different container types
const CONTAINER_SHAPES = {
    bottle: `
        M 45,10 Q 45,5 48,5 L 72,5 Q 75,5 75,10
        L 75,30 Q 75,35 80,42 L 90,58 Q 95,65 95,72
        L 95,200 Q 95,210 85,210
        L 35,210 Q 25,210 25,200
        L 25,72 Q 25,65 30,58 L 40,42 Q 45,35 45,30 Z
    `,
    jar: `
        M 30,30 L 30,25 Q 30,20 35,20 L 85,20 Q 90,20 90,25
        L 90,30 Q 95,32 95,38 L 95,40
        Q 95,45 90,45 L 90,200 Q 90,210 80,210
        L 40,210 Q 30,210 30,200
        L 30,45 Q 25,45 25,40 L 25,38 Q 25,32 30,30 Z
    `,
    jug: `
        M 50,10 Q 50,5 55,5 L 70,5 Q 75,5 75,10
        L 75,25 Q 95,30 95,50 L 95,195 Q 95,210 80,210
        L 40,210 Q 25,210 25,195
        L 25,50 Q 25,30 45,25 L 50,25 Z
    `,
    can: `
        M 30,20 Q 30,10 60,10 Q 90,10 90,20
        L 90,200 Q 90,210 60,210 Q 30,210 30,200 Z
    `,
    drum: `
        M 28,25 Q 28,15 60,15 Q 92,15 92,25
        L 95,100 Q 95,115 60,115 Q 25,115 25,100 Z
        M 25,100 Q 25,85 60,85 Q 95,85 95,100
        L 92,195 Q 92,210 60,210 Q 28,210 28,195 Z
    `,
    tank: `
        M 30,40 Q 30,15 60,15 Q 90,15 90,40
        L 90,190 Q 90,210 60,210 Q 30,210 30,190 Z
    `,
    bucket: `
        M 20,50 L 35,210 Q 37,215 60,215 Q 83,215 85,210
        L 100,50 Q 100,40 60,40 Q 20,40 20,50 Z
    `,
    box: `
        M 25,30 L 95,30 L 95,210 L 25,210 Z
        M 25,30 L 30,20 L 100,20 L 95,30 Z
    `,
    cylinder: `
        M 30,30 Q 30,15 60,15 Q 90,15 90,30
        L 90,200 Q 90,215 60,215 Q 30,215 30,200 Z
    `,
    spray_bottle: `
        M 48,5 L 72,5 L 72,15 L 80,15 L 85,10 L 90,15 L 80,25
        L 75,25 L 75,35 Q 85,40 90,50
        L 90,200 Q 90,210 80,210
        L 40,210 Q 30,210 30,200
        L 30,50 Q 35,40 45,35 L 45,25 L 48,25 Z
    `,
};

// Default/fallback shape is bottle
const getShapePath = (containerType) => {
    return CONTAINER_SHAPES[containerType] || CONTAINER_SHAPES.bottle;
};

/** Parse any value into a numeric percent (0-100) */
const parsePercent = (val) => {
    if (!val || val === 'empty' || val === 'null' || val === '') return 0;
    const str = String(val).replace('%', '').trim();
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
};

/** Format a numeric percent into a display/storage string */
const formatPercent = (num) => {
    if (num <= 0) return 'empty';
    // Round to 1 decimal place
    const rounded = Math.round(num * 10) / 10;
    // Show integer if whole number, otherwise 1 decimal
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded}%`;
};

/** Get a friendly label for a percent value */
const getPercentLabel = (num) => {
    if (num <= 0) return 'Empty';
    if (num === 100) return 'Full';
    if (num === 75) return '75%';
    if (num === 50) return 'Half';
    if (num === 25) return 'Quarter';
    return `${Math.round(num * 10) / 10}%`;
};

const BottleQuantitySlider = ({ value, onChange, disabled = false, containerType = 'bottle' }) => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const svgRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const currentPercent = parsePercent(value);
    const fillY = percentToY(currentPercent);

    const shapePath = getShapePath(containerType);
    const clipId = `containerClip_${containerType}`;

    // Sync input field with value
    useEffect(() => {
        if (!dragging) {
            setInputValue(currentPercent <= 0 ? '0' : String(Math.round(currentPercent * 10) / 10));
        }
    }, [value, currentPercent, dragging]);

    const getYFromEvent = useCallback((e) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleY = H / rect.height;
        return (clientY - rect.top) * scaleY;
    }, []);

    const handleInteraction = useCallback((e) => {
        if (disabled) return;
        const y = getYFromEvent(e);
        const rawPct = yToPercent(y);
        const snapped = snapToHalf(rawPct);
        onChange(formatPercent(snapped));
    }, [disabled, getYFromEvent, onChange]);

    const handlePointerDown = useCallback((e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
        handleInteraction(e);
    }, [disabled, handleInteraction]);

    const handlePointerMove = useCallback((e) => {
        if (!dragging || disabled) return;
        e.preventDefault();
        handleInteraction(e);
    }, [dragging, disabled, handleInteraction]);

    const handlePointerUp = useCallback(() => {
        setDragging(false);
    }, []);

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => handlePointerMove(e);
        const onUp = () => handlePointerUp();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [dragging, handlePointerMove, handlePointerUp]);

    const getFillColor = (pct = currentPercent) => {
        if (pct <= 0) return theme.palette.error.main;
        if (pct <= 25) return theme.palette.warning.main;
        return primary;
    };

    const handleInputSubmit = () => {
        const num = parseFloat(inputValue);
        if (isNaN(num)) {
            setInputValue(String(currentPercent));
            return;
        }
        const clamped = Math.max(0, Math.min(100, num));
        onChange(formatPercent(clamped));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, userSelect: 'none' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                width={160}
                height={220}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                style={{ cursor: disabled ? 'default' : 'pointer', touchAction: 'none' }}
            >
                <defs>
                    <clipPath id={clipId}>
                        <path d={shapePath} />
                    </clipPath>
                </defs>

                {/* Fill clipped to container shape */}
                <rect
                    x={0} y={fillY}
                    width={W} height={BODY_BOTTOM - fillY + 10}
                    fill={getFillColor()}
                    opacity={0.35}
                    clipPath={`url(#${clipId})`}
                />

                {/* Container outline */}
                <path
                    d={shapePath}
                    fill="none"
                    stroke={theme.palette.divider}
                    strokeWidth={2}
                />

                {/* Reference level tick marks + labels */}
                {REFERENCE_MARKS.map((lvl) => {
                    const ly = percentToY(lvl.percent);
                    const isNear = Math.abs(currentPercent - lvl.percent) < 3;
                    return (
                        <g key={lvl.percent}>
                            <line
                                x1={BODY_RIGHT + 2} y1={ly}
                                x2={BODY_RIGHT + 10} y2={ly}
                                stroke={theme.palette.text.secondary}
                                strokeWidth={1} opacity={0.5}
                            />
                            <text
                                x={BODY_RIGHT + 13} y={ly + 4}
                                fontSize={10}
                                fill={isNear ? getFillColor() : theme.palette.text.secondary}
                                fontWeight={isNear ? 700 : 400}
                            >
                                {lvl.label}
                            </text>
                        </g>
                    );
                })}

                {/* Drag handle line across fill top */}
                {currentPercent > 0 && (
                    <line
                        x1={BODY_LEFT + 2} y1={fillY}
                        x2={BODY_RIGHT - 2} y2={fillY}
                        stroke={getFillColor()}
                        strokeWidth={2.5}
                        strokeDasharray="4,3"
                    />
                )}
            </svg>

            {/* Percentage label */}
            <Typography variant="body2" fontWeight={600} sx={{ color: getFillColor() }}>
                {getPercentLabel(currentPercent)}
            </Typography>

            {/* Precise percentage input */}
            <TextField
                size="small"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInputSubmit(); }}
                disabled={disabled}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { textAlign: 'center' },
                    },
                    htmlInput: {
                        min: 0,
                        max: 100,
                        step: 0.5,
                        style: { textAlign: 'center', width: 60 },
                    },
                }}
                sx={{ width: 120 }}
            />
        </Box>
    );
};

export default BottleQuantitySlider;
