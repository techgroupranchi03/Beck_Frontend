# Theme Switching Implementation Guide

## Overview
This document outlines the architecture and implementation logic for a multi-palette theme switching system in the Beck Frontend application. The system will allow users to switch between different color palettes while maintaining light/dark mode functionality.

---

## Current Architecture

### Existing Setup
- **File**: `src/theme.js`
- **Current Functionality**: 
  - Single color palette with light/dark mode variants
  - Theme managed through `ThemeContext.jsx`
  - MUI's `createTheme()` for theme configuration

### Current Color Palette
```
Primary Palette (Default/Nature Theme)
├── dark: "#132421"
├── primary: "#407f68"
├── accent: "#6b603f"
├── lightGreen: "#96d980"
└── cream: "#fef7c5"
```

---

## Proposed Architecture

### Multi-Palette System
```
Theme System
├── Palette 1: Nature (Current)
│   ├── Light Mode
│   └── Dark Mode
├── Palette 2: Ocean
│   ├── Light Mode
│   └── Dark Mode
└── Palette 3: Sunset
    ├── Light Mode
    └── Dark Mode
```

---

## Implementation Logic Flow

### 1. Data Structure Design

```
Palette Configuration Structure:
{
  id: string,
  name: string,
  colors: {
    dark: string,
    primary: string,
    accent: string,
    lightGreen: string,
    cream: string
  }
}

Available Palettes Array:
[
  { id: 'nature', name: 'Nature', colors: {...} },
  { id: 'ocean', name: 'Ocean', colors: {...} },
  { id: 'sunset', name: 'Sunset', colors: {...} }
]
```

### 2. State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Application Start                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Load User Preferences from Storage             │
│  - Selected Palette ID (default: 'nature')              │
│  - Theme Mode (light/dark) (default: 'light')           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Initialize Theme Context                    │
│  State: { paletteId, mode, availablePalettes }          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│        Generate Theme Based on Current Settings         │
│  - Get palette colors by paletteId                      │
│  - Apply mode (light/dark) transformations              │
│  - Create MUI theme object                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Provide Theme to Application               │
│         <ThemeProvider theme={currentTheme}>            │
└─────────────────────────────────────────────────────────┘
```

### 3. User Interaction Flow

```
┌─────────────────────────────────────────────────────────┐
│          User Opens Theme Selector UI                    │
│     (Button/Menu in Navigation/Settings)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Display Available Options                        │
│  ┌─────────────────────────────────────────┐            │
│  │ Color Palette Selector                  │            │
│  │  ○ Nature   ○ Ocean   ○ Sunset          │            │
│  │                                          │            │
│  │ Mode Toggle                              │            │
│  │  ☀️ Light Mode  /  🌙 Dark Mode          │            │
│  └─────────────────────────────────────────┘            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              User Selects New Option                     │
│     (Click Palette or Toggle Mode)                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Update Theme Context State                       │
│  - setPaletteId(newId) OR setMode(newMode)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│        Theme Context Triggers Re-calculation             │
│  useEffect([paletteId, mode]) → generateTheme()         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Save Preference to LocalStorage                 │
│  localStorage.setItem('theme-palette', paletteId)        │
│  localStorage.setItem('theme-mode', mode)                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Re-render Application with New Theme            │
│          (All components update automatically)           │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### File Structure
```
src/
├── theme.js (Modified)
│   └── Contains: 
│       - All palette definitions
│       - Theme generation function
│       - Typography settings
│
├── ThemeContext.jsx (Modified)
│   └── Contains:
│       - Palette selection state
│       - Mode (light/dark) state
│       - Theme switching functions
│       - LocalStorage persistence
│
├── reusable_components/
│   ├── ThemeToggleButton.jsx (Existing - Dark/Light toggle)
│   └── PaletteSwitcher.jsx (New - Palette selector)
│
└── Layout.jsx (Modified)
    └── Add palette switcher to navigation/settings
```

---

## Detailed Logic Breakdown

### A. Theme Generation Logic

```
FUNCTION generateTheme(paletteId, mode):
  
  STEP 1: Get palette colors
  ─────────────────────────────────
  palette = PALETTES.find(p => p.id === paletteId)
  IF palette not found:
    palette = DEFAULT_PALETTE
  
  colors = palette.colors
  
  STEP 2: Apply mode-specific transformations
  ─────────────────────────────────
  IF mode === 'light':
    background = { default: '#f9f9f9', paper: '#ffffff' }
    text = { primary: '#000000', secondary: '#555555' }
    // Use lighter versions of palette colors
  
  ELSE IF mode === 'dark':
    background = { default: '#1a1a1a', paper: '#3c3c3c' }
    text = { primary: '#ffffff', secondary: '#b0b0b0' }
    // Use adjusted versions for dark mode visibility
  
  STEP 3: Create MUI theme object
  ─────────────────────────────────
  theme = createTheme({
    palette: {
      mode: mode,
      primary: { main: colors.primary, dark: colors.dark, ... },
      secondary: { main: colors.accent },
      background: background,
      text: text,
      // ... other configurations
    },
    typography: TYPOGRAPHY_CONFIG,
    components: COMPONENT_OVERRIDES
  })
  
  RETURN theme
```

### B. Context State Management Logic

```
ThemeContext State:
─────────────────────────────────
{
  paletteId: string,              // Current palette ID
  mode: 'light' | 'dark',         // Current mode
  theme: MuiTheme,                // Generated theme object
  availablePalettes: Array,       // List of all palettes
  switchPalette: function,        // Change palette
  toggleMode: function            // Toggle light/dark
}

Initialization:
─────────────────────────────────
ON MOUNT:
  1. Read from localStorage:
     - savedPaletteId = localStorage.getItem('theme-palette') || 'nature'
     - savedMode = localStorage.getItem('theme-mode') || 'light'
  
  2. Set initial state:
     - paletteId = savedPaletteId
     - mode = savedMode
  
  3. Generate initial theme:
     - theme = generateTheme(paletteId, mode)

State Updates:
─────────────────────────────────
FUNCTION switchPalette(newPaletteId):
  1. Validate palette exists
  2. Update state: setPaletteId(newPaletteId)
  3. Save to localStorage
  4. Trigger theme regeneration

FUNCTION toggleMode():
  1. Calculate new mode: newMode = mode === 'light' ? 'dark' : 'light'
  2. Update state: setMode(newMode)
  3. Save to localStorage
  4. Trigger theme regeneration

useEffect Hooks:
─────────────────────────────────
useEffect([paletteId, mode], () => {
  1. Generate new theme with current paletteId and mode
  2. Update theme in state
  3. Optionally: Add transition/animation
})
```

### C. Persistence Logic

```
Storage Keys:
─────────────────────────────────
- 'theme-palette': stores selected palette ID
- 'theme-mode': stores 'light' or 'dark'

Save Operation:
─────────────────────────────────
WHEN palette or mode changes:
  localStorage.setItem('theme-palette', paletteId)
  localStorage.setItem('theme-mode', mode)

Load Operation:
─────────────────────────────────
ON APP INITIALIZATION:
  paletteId = localStorage.getItem('theme-palette') || 'nature'
  mode = localStorage.getItem('theme-mode') || 'light'
  
Migration/Validation:
─────────────────────────────────
IF stored paletteId not in availablePalettes:
  paletteId = 'nature' (default)
  localStorage.setItem('theme-palette', 'nature')
```

---

## Proposed Color Palettes

### Palette 1: Nature (Current/Default)
```
Theme: Earthy, organic, natural
─────────────────────────────────
dark:       #132421  (Deep Forest Green)
primary:    #407f68  (Sage Green)
accent:     #6b603f  (Olive Brown)
lightGreen: #96d980  (Fresh Green)
cream:      #fef7c5  (Soft Cream)
```

### Palette 2: Ocean (New)
```
Theme: Calm, professional, serene
─────────────────────────────────
dark:       #0a1929  (Deep Navy)
primary:    #1976d2  (Ocean Blue)
accent:     #0288d1  (Sky Blue)
lightGreen: #4fc3f7  (Light Cyan)
cream:      #e3f2fd  (Soft Blue Tint)
```

### Palette 3: Sunset (New)
```
Theme: Warm, energetic, vibrant
─────────────────────────────────
dark:       #2d1b1b  (Deep Burgundy)
primary:    #d84315  (Burnt Orange)
accent:     #f57c00  (Warm Amber)
lightGreen: #ffb74d  (Soft Orange)
cream:      #fff3e0  (Peach Cream)
```

---

## UI/UX Considerations

### Palette Switcher UI Options

#### Option 1: Dropdown Menu
```
┌─────────────────────────┐
│ 🎨 Theme: Nature    ▼   │
├─────────────────────────┤
│   ✓ Nature             │
│     Ocean              │
│     Sunset             │
└─────────────────────────┘
```

#### Option 2: Color Chips (Recommended)
```
┌─────────────────────────────────────┐
│  Theme Palette                      │
│  ┌───┐  ┌───┐  ┌───┐               │
│  │███│  │███│  │███│               │
│  │███│  │███│  │███│               │
│  └─✓─┘  └───┘  └───┘               │
│ Nature  Ocean  Sunset               │
└─────────────────────────────────────┘
```

#### Option 3: Settings Page
```
Settings → Appearance
├── Color Palette
│   ○ Nature    ○ Ocean    ○ Sunset
└── Mode
    ○ Light    ○ Dark    ○ Auto (System)
```

### Placement Recommendations
1. **Navigation Bar**: Quick access for frequent switchers
2. **Profile Menu**: Organized under user preferences
3. **Settings Page**: Detailed theme customization options

---

## Implementation Steps (Overview)

### Phase 1: Preparation
1. Define all color palettes in `theme.js`
2. Create palette configuration structure
3. Update theme generation function

### Phase 2: Context Enhancement
1. Modify `ThemeContext.jsx` to support palette selection
2. Add localStorage persistence for palette preference
3. Implement palette switching logic
4. Ensure backwards compatibility

### Phase 3: UI Components
1. Create `PaletteSwitcher.jsx` component
2. Integrate with existing `ThemeToggleButton.jsx`
3. Add to navigation/settings area
4. Implement smooth transitions

### Phase 4: Testing & Polish
1. Test all palette × mode combinations (6 total)
2. Verify localStorage persistence
3. Test on different screen sizes
4. Add accessibility features (ARIA labels)
5. Implement preview functionality

---

## Technical Considerations

### Performance
- Theme changes should not cause layout shifts
- Use CSS transitions for smooth color changes
- Memoize theme generation to avoid unnecessary recalculations

### Accessibility
- Ensure all palettes meet WCAG contrast requirements
- Provide labels for screen readers
- Support keyboard navigation for palette selector

### Browser Compatibility
- localStorage is supported in all modern browsers
- Provide fallback for browsers without localStorage
- Test color rendering across browsers

### Mobile Responsiveness
- Palette switcher should be accessible on mobile
- Consider space constraints in navigation
- Possibly use icon-only view on small screens

---

## Future Enhancements

### Custom Palettes
- Allow users to create custom color combinations
- Color picker interface
- Save custom palettes to user account

### Auto Mode
- System preference detection (`prefers-color-scheme`)
- Automatic switching based on time of day
- Geolocation-based (sunrise/sunset times)

### Theme Preview
- Live preview before applying
- Side-by-side comparison
- Preview specific sections

### Animation
- Smooth color transitions
- Theme change animations
- Loading states

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Navigation Bar / Settings                                 │  │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐ │  │
│  │  │ 🎨 Palette  │  │ ☀️ Light / 🌙 Dark Toggle          │ │  │
│  │  │  Selector   │  │                                      │ │  │
│  │  └──────┬──────┘  └───────────────┬─────────────────────┘ │  │
│  └─────────┼─────────────────────────┼───────────────────────┘  │
└────────────┼─────────────────────────┼──────────────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────────────────────────────────────────────────┐
│                      THEME CONTEXT                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State:                                                   │  │
│  │  - paletteId: 'nature' | 'ocean' | 'sunset'             │  │
│  │  - mode: 'light' | 'dark'                               │  │
│  │  - theme: MuiTheme object                               │  │
│  │                                                          │  │
│  │  Functions:                                             │  │
│  │  - switchPalette(newPaletteId)                         │  │
│  │  - toggleMode()                                        │  │
│  └────────┬─────────────────────────────────┬─────────────┘  │
└───────────┼─────────────────────────────────┼────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────┐       ┌──────────────────────────┐
│   THEME GENERATION      │       │   LOCAL STORAGE          │
│                         │       │                          │
│  generateTheme(         │       │  Save:                   │
│    paletteId,          │◄──────┤  - theme-palette         │
│    mode                │       │  - theme-mode            │
│  )                     │       │                          │
│                        │       │  Load on init            │
│  Returns: MuiTheme     │──────►│                          │
└────────┬───────────────┘       └──────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PALETTE CONFIGURATIONS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Nature     │  │    Ocean     │  │   Sunset     │          │
│  │  dark: #...  │  │  dark: #...  │  │  dark: #...  │          │
│  │  primary:... │  │  primary:... │  │  primary:... │          │
│  │  accent: ... │  │  accent: ... │  │  accent: ... │          │
│  │  lightGreen  │  │  lightGreen  │  │  lightGreen  │          │
│  │  cream: ...  │  │  cream: ...  │  │  cream: ...  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MUI THEME                                │
│  createTheme({                                                   │
│    palette: { mode, primary, secondary, background, text, ...}, │
│    typography: { fontFamily, h1, h2, body1, ...},               │
│    components: { MuiDrawer, MuiButton, ...}                     │
│  })                                                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION COMPONENTS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Clients    │  │  Dashboard   │  │  Inventory   │          │
│  │  Management  │  │              │  │  Management  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  All components automatically use theme via:                    │
│  - theme.palette.*                                              │
│  - sx={{ color: 'primary.main' }}                              │
│  - <Box bgcolor="background.paper">                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

This implementation provides:
✅ Multiple color palette options (3+ palettes)
✅ Independent light/dark mode for each palette
✅ Persistent user preferences
✅ Clean, maintainable code structure
✅ Smooth user experience
✅ Future extensibility

The system allows users to express their preferences while maintaining the application's design consistency and brand identity across all themes.
