// src/utils/tracking.js
import axios from 'axios';


// Session management variables
let sessionId = null;
let lastActivity = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ANONYMOUS_PREFIX = 'anon_';

// Initialize anonymous ID
const getAnonymousId = () => {
    let anonymousId = localStorage.getItem('anonymous_id');
    if (!anonymousId) {
        anonymousId = ANONYMOUS_PREFIX + Math.random().toString(36).substr(2, 9) +
            '_' + Date.now();
        localStorage.setItem('anonymous_id', anonymousId);
    }
    return anonymousId;
};

// Initialize session
const initSession = () => {
    const storedSession = sessionStorage.getItem('current_session');
    const now = Date.now();

    if (storedSession) {
        const { sessionId: storedId, timestamp } = JSON.parse(storedSession);
        if (now - timestamp < SESSION_TIMEOUT) {
            sessionId = storedId;
            lastActivity = now;
            return;
        }
    }

    // Create new session
    sessionId = 'session_' + Date.now() + '_' +
        Math.random().toString(36).substr(2, 9);

    sessionStorage.setItem('current_session', JSON.stringify({
        sessionId: sessionId,
        timestamp: now
    }));

    lastActivity = now;

    // Track session start
    trackEventInternal('session_start', {
        is_new_session: true,
        session_id: sessionId,
        anonymous_id: getAnonymousId(),
        source: 'session_init'
    });
};

// Update activity timestamp
const updateActivity = () => {
    lastActivity = Date.now();
};

// Check session timeout
const checkSessionTimeout = () => {
    if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        trackEventInternal('session_end', {
            session_id: sessionId,
            duration_ms: Date.now() -
                JSON.parse(sessionStorage.getItem('current_session')).timestamp
        });
        initSession(); // Start new session
    }
};

// Internal track function with session data
const trackEventInternal = async (eventName, eventProps = {}) => {
    try {
        // Get user info
        const userData = localStorage.getItem('user');
        let user = null;

        if (userData) {
            try {
                user = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Get anonymous ID for non-logged-in users
        const anonymousId = getAnonymousId();

        // Ensure session is initialized
        if (!sessionId) {
            initSession();
        }

        const properties = {
            ...eventProps,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            referrer: document.referrer,
            // Add session data
            session_id: sessionId,
            anonymous_id: user ? null : anonymousId, // Only send for anonymous users
            is_anonymous: !user,
            page_url: window.location.href,
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        };

        // Use distinct_id for Mixpanel - anonymous users get device-based ID
        const distinctId = user?.id || user?.userId || user?.email ||
            (anonymousId + '_' + navigator.userAgent.substr(0, 50).replace(/\s+/g, ''));

        const payload = {
            event: eventName,
            properties: properties,
            userId: distinctId, // Changed from 'anonymous' to distinct ID
            anonymousId: user ? null : anonymousId,
            sessionId: sessionId
        };

        // Update activity on any event
        updateActivity();

        // Use relative URL for API calls in the same domain
        await axios.post(`https://api.taskbnb.in/api/track`, payload);

        if (process.env.NODE_ENV === 'development') {
            // console.log('Tracked event:', eventName, {
            //     distinctId,
            //     sessionId,
            //     isAnonymous: !user
            // });
        }
    } catch (error) {
        console.error('Tracking error:', error);
    }
};

// Public track function (updated)
export const trackEvent = async (eventName, eventProps = {}) => {
    await trackEventInternal(eventName, eventProps);
};

// Setup activity listeners
const setupActivityListeners = () => {
    ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check session timeout every minute
    setInterval(checkSessionTimeout, 60000);
};

// Initialize tracking system
export const initTracking = () => {
    initSession();
    setupActivityListeners();
};

// Helper function to track page views (updated)
export const trackPageView = (pageName) => {
    trackEvent('Page View', {
        page_name: pageName,
        action: 'viewed'
    });
};

// When user logs in, merge anonymous history
export const identifyUser = (userId, userProperties = {}) => {
    const anonymousId = getAnonymousId();
    const previousSessionId = sessionId;

    // Track the identification
    trackEvent('user_identified', {
        ...userProperties,
        previous_anonymous_id: anonymousId,
        previous_session_id: previousSessionId,
        identification_source: 'login'
    });

    // Clear anonymous ID from localStorage
    localStorage.removeItem('anonymous_id');

    // Start new session for logged-in user
    initSession();
};

// Export session info if needed
export const getSessionInfo = () => ({
    sessionId,
    anonymousId: getAnonymousId(),
    lastActivity,
    isSessionActive: Date.now() - lastActivity < SESSION_TIMEOUT
});

// Helper function to track button clicks
export const trackButtonClick = (buttonName, pageName = null) => {
    trackEvent('Button Click', {
        button_name: buttonName,
        page_name: pageName || window.location.pathname,
        action: 'clicked'
    });
};

// Helper function to track form submissions
export const trackFormSubmit = (formName, success = true, errorMessage = null) => {
    trackEvent('Form Submission', {
        form_name: formName,
        status: success ? 'success' : 'failed',

        error_message: errorMessage,
        action: 'submitted'
    });
};

// Helper function to track authentication events
export const trackAuthEvent = (eventType, role, status = 'success', error = null) => {
    trackEvent('Authentication', {
        event_type: eventType,
        role: role,
        status: status,
        error_message: error,
        action: 'authenticated'
    });
};