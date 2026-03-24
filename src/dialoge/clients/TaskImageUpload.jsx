// import React, { useRef, useState } from 'react';
// import {
//     Box,
//     IconButton,
//     Typography,
//     Stack
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import CameraAltIcon from '@mui/icons-material/CameraAlt';
// import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
// import { useSnackbar } from '../../resuable_components/Snackbar';

// const TaskImageUpload = ({ 
//     task, 
//     setPhotos, 
//     photoPreviews, 
//     setPhotoPreviews, 
//     existingImageIds, 
//     setExistingImageIds,
//     setRemovedImageIds,
//     hasExistingImages,
//     loading 
// }) => {
//     const MAX_PHOTOS = 3;
//     const { showSnackbar } = useSnackbar();
//     const desktopInputRef = useRef(null);
//     const cameraInputRef = useRef(null);
//     const galleryInputRef = useRef(null);
//     const [inputKey, setInputKey] = useState(0);

//     // Fix image orientation by re-drawing through canvas
//     // Modern browsers apply EXIF rotation when drawing to canvas,
//     // so the exported image will have correct orientation without EXIF metadata
//     const correctImageOrientation = (file) => {
//         return new Promise((resolve) => {
//             const img = new Image();
//             const objectUrl = URL.createObjectURL(file);
//             img.onload = () => {
//                 const canvas = document.createElement('canvas');
//                 canvas.width = img.naturalWidth;
//                 canvas.height = img.naturalHeight;
//                 const ctx = canvas.getContext('2d');
//                 ctx.drawImage(img, 0, 0);
//                 canvas.toBlob(
//                     (blob) => {
//                         URL.revokeObjectURL(objectUrl);
//                         if (!blob) {
//                             resolve(file);
//                             return;
//                         }
//                         const correctedFile = new File([blob], file.name, {
//                             type: file.type || 'image/jpeg',
//                             lastModified: Date.now(),
//                         });
//                         resolve(correctedFile);
//                     },
//                     file.type || 'image/jpeg',
//                     0.92
//                 );
//             };
//             img.onerror = () => {
//                 URL.revokeObjectURL(objectUrl);
//                 resolve(file);
//             };
//             img.src = objectUrl;
//         });
//     };

//     // Handle file selection (multiple files)
//     const handleFileChange = async (event) => {
//         const files = Array.from(event.target.files);
//         if (files.length === 0) return;

//         const totalExisting = photoPreviews?.length || 0;
//         const remainingSlots = MAX_PHOTOS - totalExisting;

//         if (remainingSlots <= 0) {
//             showSnackbar('You can upload only 3 photos', 'error');
//             event.target.value = '';
//             return;
//         }

//         const filesToProcess = files.slice(0, remainingSlots);

//         const validFiles = filesToProcess.filter(file => {
//             if (!file.type.startsWith('image/')) {
//                 showSnackbar(`${file.name} is not a valid image file`, 'error');
//                 return false;
//             }
//             return true;
//         });

//         // Process all images through canvas to fix EXIF orientation
//         const correctedFiles = await Promise.all(
//             validFiles.map(file => correctImageOrientation(file))
//         );

//         const newPreviews = correctedFiles.map(file => URL.createObjectURL(file));

//         setPhotos(prev => [...(prev || []), ...correctedFiles]);
//         setPhotoPreviews(prev => [...(prev || []), ...newPreviews]);

//         if (files.length > remainingSlots) {
//             showSnackbar('Only 3 photos are allowed', 'warning');
//         }

//         // Force re-creation of input elements so mobile camera can be triggered again
//         setInputKey(prev => prev + 1);
//     };

//     // Handle photo removal (by index)
//     const handleRemovePhoto = (index) => {
//         // Check if it's an existing image or new image
//         const isExistingImage = hasExistingImages && index < existingImageIds.length;
        
//         if (isExistingImage) {
//             // Get the ID of the image being removed and add to removed list
//             const removedId = existingImageIds[index];
//             setRemovedImageIds(prev => [...(prev || []), removedId]);
            
//             // Remove from existing image IDs
//             setExistingImageIds(prev => (prev || []).filter((_, i) => i !== index));
//         } else {
//             // Calculate adjusted index for photos array
//             const adjustedIndex = hasExistingImages 
//                 ? index - existingImageIds.length 
//                 : index;
            
//             // Remove from photos (new files)
//             setPhotos(prev => (prev || []).filter((_, i) => i !== adjustedIndex));
//         }

//         // Revoke blob URL if it's a new image
//         if (photoPreviews?.[index]) {
//             if (photoPreviews[index].startsWith('blob:')) {
//                 URL.revokeObjectURL(photoPreviews[index]);
//             }
//         }

//         // Remove from previews
//         setPhotoPreviews(prev => (prev || []).filter((_, i) => i !== index));
//     };

//     return (
//         <Box>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//                 Please upload photo(s) to confirm task completion for: <strong>{task?.title}</strong>
//             </Typography>

//             {/* Photo Previews Grid */}
//             {(photoPreviews?.length || 0) > 0 && (
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
//                         gap: 2,
//                         mb: 2,
//                     }}
//                 >
//                     {photoPreviews.map((preview, index) => (
//                         <Box
//                             key={index}
//                             sx={{
//                                 position: 'relative',
//                                 width: '100%',
//                                 height: 150,
//                                 borderRadius: 1,
//                                 overflow: 'hidden',
//                                 border: '1px solid',
//                                 borderColor: 'divider',
//                             }}
//                         >
//                             <img
//                                 src={preview}
//                                 alt={`Completion preview ${index + 1}`}
//                                 style={{
//                                     width: '100%',
//                                     height: '100%',
//                                     objectFit: 'cover',
//                                     imageOrientation: 'from-image',
//                                 }}
//                             />
//                             <IconButton
//                                 onClick={() => handleRemovePhoto(index)}
//                                 disabled={loading}
//                                 size="small"
//                                 sx={{
//                                     position: 'absolute',
//                                     top: 4,
//                                     right: 4,
//                                     backgroundColor: 'background.paper',
//                                     '&:hover': {
//                                         backgroundColor: 'primary.main',
//                                         color: 'white',
//                                     },
//                                 }}
//                             >
//                                 <CloseIcon fontSize="small" />
//                             </IconButton>
//                         </Box>
//                     ))}
//                 </Box>
//             )}

//             {/* Upload Button  show till max photos reached */}
//             {(photoPreviews?.length || 0) < MAX_PHOTOS ? (
//                 <Box
//                     sx={{
//                         border: '2px dashed',
//                         borderColor: 'divider',
//                         borderRadius: 1,
//                         p: 1,
//                         textAlign: 'center',
//                         justifyContent: 'center',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         alignItems: 'center',
//                         cursor: { xs: 'default', md: 'pointer' },
//                     }}
//                     onClick={(e) => {
//                         if (window.innerWidth >= 900) {
//                             desktopInputRef.current?.click();
//                         }
//                     }}
//                 >
//                     <input
//                         key={`desktop-${inputKey}`}
//                         ref={desktopInputRef}
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         hidden
//                         onChange={handleFileChange}
//                         disabled={loading}
//                         style={{ display: 'none' }}
//                     />

//                     <CloudUploadIcon sx={{ fontSize: 30, color: 'text.secondary', }} />
//                     <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
//                         Upload completion photos
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                         Supported formats: JPG, PNG, GIF (Max 3 photos)
//                     </Typography>

//                     <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center', display: { xs: 'flex', md: 'none' } }}>
//                         <input
//                             key={`camera-${inputKey}`}
//                             ref={cameraInputRef}
//                             type="file"
//                             accept="image/*"
//                             capture="environment"
//                             hidden
//                             onChange={handleFileChange}
//                             // disabled={loading}
//                             style={{ display: 'none' }}
//                         />
//                         <input
//                             key={`gallery-${inputKey}`}
//                             ref={galleryInputRef}
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             hidden
//                             onChange={handleFileChange}
//                             disabled={loading}
//                             style={{ display: 'none' }}
//                         />
                        
//                         <IconButton
//                             color="primary"
//                             disabled={loading}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 cameraInputRef.current?.click();
//                             }}
//                             sx={{
//                                 bgcolor: 'primary.main',
//                                 color: 'white',
//                                 width: 56,
//                                 height: 56,
//                             }}
//                         >
//                             <CameraAltIcon sx={{ fontSize: 28 }} />
//                         </IconButton>

//                         <IconButton
//                             color="primary"
//                             disabled={loading}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 galleryInputRef.current?.click();
//                             }}
//                             sx={{
//                                 border: '2px solid',
//                                 borderColor: 'primary.main',
//                                 width: 56,
//                                 height: 56,
//                             }}
//                         >
//                             <PhotoLibraryIcon sx={{ fontSize: 28 }} />
//                         </IconButton>
//                     </Stack>
//                 </Box>
//             ) : (
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                     You have reached the maximum of {MAX_PHOTOS} photos.
//                 </Typography>
//             )}
//         </Box>
//     );
// };

// export default TaskImageUpload;





import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { useSnackbar } from '../../resuable_components/Snackbar';

// ─────────────────────────────────────────────────────────────────────────────
// sessionStorage helpers
//
// Root cause of the page-reload bug:
//   On Android, opening the native camera via <input capture="environment">
//   causes the browser / WebView to push a new activity. When the user taps
//   "OK", the browser pops back and often triggers a full page reload,
//   wiping all React state before the file's onChange event fires.
//
// Fix strategy:
//   1. As soon as the file is processed, serialize it to base64 and persist it
//      in sessionStorage BEFORE touching React state.
//   2. On component mount, check sessionStorage for any pending photos and
//      restore them into state automatically.
//   3. Once React state is safely updated, clear the sessionStorage entry.
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = 'taskImageUpload_pendingPhotos';

const saveToSession = (base64List) => {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(base64List));
    } catch (_) {
        // Quota exceeded or storage unavailable — fail silently
    }
};

const loadFromSession = () => {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
};

const clearSession = () => {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
};

// File  →  base64 data-URL
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// base64 data-URL  →  File
const base64ToFile = (dataUrl, filename = 'photo.jpg') => {
    const [header, data] = dataUrl.split(',');
    const mime   = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const binary = atob(data);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
};

// ─────────────────────────────────────────────────────────────────────────────

const TaskImageUpload = ({
    task,
    setPhotos,
    photoPreviews,
    setPhotoPreviews,
    existingImageIds,
    setExistingImageIds,
    setRemovedImageIds,
    hasExistingImages,
    loading
}) => {
    const MAX_PHOTOS = 3;
    const { showSnackbar } = useSnackbar();

    const desktopInputRef = useRef(null);
    const cameraInputRef  = useRef(null);
    const galleryInputRef = useRef(null);
    const [inputKey, setInputKey] = useState(0);

    // Flag set to true the moment the camera button is tapped, cleared after
    // the file is processed. Used by the visibilitychange handler below.
    const cameraOpenedRef = useRef(false);

    // Derived
    const currentCount   = photoPreviews?.length || 0;
    const canAddMore     = currentCount < MAX_PHOTOS;
    const remainingSlots = MAX_PHOTOS - currentCount;

    // ── 1. Restore photos that were saved before a possible Android reload ────
    useEffect(() => {
        const pending = loadFromSession();
        if (pending.length === 0) return;

        clearSession();

        const restoredFiles    = pending.map((item) => base64ToFile(item.dataUrl, item.name));
        // Re-use the saved dataUrl as the preview src — avoids creating blob URLs
        // that would be invalidated by the reload anyway.
        const restoredPreviews = pending.map((item) => item.dataUrl);

        setPhotos((prev)        => [...(prev || []), ...restoredFiles]);
        setPhotoPreviews((prev) => [...(prev || []), ...restoredPreviews]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally runs once on mount only

    // ── 2. visibilitychange safety net ───────────────────────────────────────
    // Some Android WebViews only hide the page rather than fully reloading it.
    // Listening to visibilitychange lets us catch that scenario too.
    useEffect(() => {
        const handleVisibility = () => {
            // If the page becomes visible again after the camera was opened,
            // and sessionStorage still has data, the reload happened — the
            // mount effect above will handle restoration on the next render.
            // Nothing extra needed here; this listener is a diagnostic hook.
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // ── EXIF orientation fix ──────────────────────────────────────────────────
    const correctImageOrientation = useCallback((file) => {
        return new Promise((resolve) => {
            const img    = new Image();
            const objUrl = URL.createObjectURL(file);
            img.onload = () => {
                const canvas  = document.createElement('canvas');
                canvas.width  = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objUrl);
                        if (!blob) { resolve(file); return; }
                        resolve(new File([blob], file.name, {
                            type: file.type || 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    },
                    file.type || 'image/jpeg',
                    0.92
                );
            };
            img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(file); };
            img.src = objUrl;
        });
    }, []);

    // ── File change handler ───────────────────────────────────────────────────
    const handleFileChange = useCallback(async (event) => {
        // Prevent any default browser navigation / form submit
        event.preventDefault();
        event.stopPropagation();

        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const currentTotal = photoPreviews?.length || 0;
        const slots        = MAX_PHOTOS - currentTotal;

        if (slots <= 0) {
            showSnackbar(`You can upload only ${MAX_PHOTOS} photos`, 'error');
            event.target.value = '';
            return;
        }

        const filesToProcess = files.slice(0, slots);
        const validFiles     = filesToProcess.filter((file) => {
            if (!file.type.startsWith('image/')) {
                showSnackbar(`${file.name} is not a valid image file`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Fix EXIF orientation via canvas redraw
        const correctedFiles = await Promise.all(
            validFiles.map((f) => correctImageOrientation(f))
        );

        // ── KEY FIX: persist to sessionStorage BEFORE updating React state ───
        // If Android reloads the page after this point, the mount effect will
        // read these entries and restore them automatically.
        try {
            const existing    = loadFromSession();
            const newEntries  = await Promise.all(
                correctedFiles.map(async (f) => ({
                    name:    f.name,
                    dataUrl: await fileToBase64(f),
                }))
            );
            saveToSession([...existing, ...newEntries]);
        } catch (_) {
            // base64 conversion failed — proceed without persistence.
            // The happy path (no reload) still works fine.
        }

        // Update React state
        const newPreviews = correctedFiles.map((f) => URL.createObjectURL(f));
        setPhotos((prev)        => [...(prev || []), ...correctedFiles]);
        setPhotoPreviews((prev) => [...(prev || []), ...newPreviews]);

        // State is now committed — the session backup is no longer needed.
        // Delay slightly so React finishes flushing before we clear.
        setTimeout(clearSession, 500);

        if (files.length > slots) {
            showSnackbar(`Only ${MAX_PHOTOS} photos are allowed`, 'warning');
        }

        setInputKey((prev) => prev + 1);
        event.target.value    = '';
        cameraOpenedRef.current = false;
    }, [photoPreviews, correctImageOrientation, setPhotos, setPhotoPreviews, showSnackbar]);

    // ── Trigger a file input safely ───────────────────────────────────────────
    const triggerInput = useCallback((ref, isCamera = false) => {
        if (!ref?.current) return;
        if (isCamera) cameraOpenedRef.current = true;
        ref.current.value = ''; // reset so onChange fires even for the same file
        ref.current.click();
    }, []);

    // ── Remove a photo by index ───────────────────────────────────────────────
    const handleRemovePhoto = useCallback((index) => {
        const isExisting = hasExistingImages && index < (existingImageIds?.length || 0);

        if (isExisting) {
            const removedId = existingImageIds[index];
            setRemovedImageIds((prev)    => [...(prev || []), removedId]);
            setExistingImageIds((prev)   => (prev || []).filter((_, i) => i !== index));
        } else {
            const adjustedIndex = hasExistingImages
                ? index - (existingImageIds?.length || 0)
                : index;
            setPhotos((prev) => (prev || []).filter((_, i) => i !== adjustedIndex));
        }

        if (photoPreviews?.[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreviews[index]);
        }

        setPhotoPreviews((prev) => (prev || []).filter((_, i) => i !== index));
    }, [hasExistingImages, existingImageIds, photoPreviews,
        setRemovedImageIds, setExistingImageIds, setPhotos, setPhotoPreviews]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please upload photo(s) to confirm task completion for:{' '}
                <strong>{task?.title}</strong>
            </Typography>

            {/* ── Photo Previews Grid ── */}
            {currentCount > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    {photoPreviews.map((preview, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: 150,
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <img
                                src={preview}
                                alt={`Completion preview ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    imageOrientation: 'from-image',
                                }}
                            />
                            <IconButton
                                onClick={() => handleRemovePhoto(index)}
                                disabled={loading}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'background.paper',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}

            {/* ── Upload Area ── */}
            {canAddMore ? (
                <Box
                    sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: { xs: 'default', md: loading ? 'not-allowed' : 'pointer' },
                        opacity: loading ? 0.6 : 1,
                        pointerEvents: loading ? 'none' : 'auto',
                    }}
                    onClick={() => {
                        // Desktop only — mobile uses the icon buttons
                        if (window.innerWidth >= 900) {
                            triggerInput(desktopInputRef);
                        }
                    }}
                >
                    {/* Desktop input */}
                    <input
                        key={`desktop-${inputKey}`}
                        ref={desktopInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ display: 'none' }}
                    />

                    <CloudUploadIcon sx={{ fontSize: 30, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                        Upload completion photos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Supported formats: JPG, PNG, GIF (Max {MAX_PHOTOS} photos
                        {remainingSlots < MAX_PHOTOS ? ` · ${remainingSlots} remaining` : ''})
                    </Typography>

                    {/* ── Mobile: camera + gallery ── */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            mt: 1.5,
                            width: '100%',
                            justifyContent: 'center',
                            display: { xs: 'flex', md: 'none' },
                        }}
                    >
                        {/* Camera capture input */}
                        <input
                            key={`camera-${inputKey}`}
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {/* Gallery input */}
                        <input
                            key={`gallery-${inputKey}`}
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={loading}
                            style={{ display: 'none' }}
                        />

                        {/* Camera button */}
                        <IconButton
                            disabled={loading || !canAddMore}
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerInput(cameraInputRef, true);
                            }}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                width: 56,
                                height: 56,
                                '&:hover': { bgcolor: 'primary.dark' },
                                '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                },
                            }}
                        >
                            <CameraAltIcon sx={{ fontSize: 28 }} />
                        </IconButton>

                        {/* Gallery button */}
                        <IconButton
                            disabled={loading || !canAddMore}
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerInput(galleryInputRef);
                            }}
                            sx={{
                                border: '2px solid',
                                borderColor: 'primary.main',
                                width: 56,
                                height: 56,
                                '&:hover': { bgcolor: 'primary.light' },
                                '&.Mui-disabled': {
                                    borderColor: 'action.disabled',
                                    color: 'action.disabled',
                                },
                            }}
                        >
                            <PhotoLibraryIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Stack>
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You have reached the maximum of {MAX_PHOTOS} photos.
                </Typography>
            )}
        </Box>
    );
};

export default TaskImageUpload;