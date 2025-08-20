/**
 * Bot Protection Script for Evie Lau Portfolio
 * Implements basic bot detection and protection mechanisms
 */

(function() {
    'use strict';

    // Known bot user agents (partial matches)
    const suspiciousUserAgents = [
        'bot', 'crawler', 'spider', 'scraper', 'parser', 'harvester',
        'ahrefsbot', 'mj12bot', 'dotbot', 'semrushbot', 'seznambot',
        'blexbot', 'megaindex', 'linkdexbot', 'python-requests',
        'scrapy', 'selenium', 'phantomjs', 'headless'
    ];

    // Honeypot element styles (invisible to humans, visible to bots)
    const honeypotStyle = 'position: absolute !important; left: -9999px !important; top: -9999px !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important;';

    let botDetectionScore = 0;
    let startTime = Date.now();

    /**
     * Basic bot detection based on user agent
     */
    function detectSuspiciousUserAgent() {
        const userAgent = navigator.userAgent.toLowerCase();
        for (let i = 0; i < suspiciousUserAgents.length; i++) {
            if (userAgent.includes(suspiciousUserAgents[i])) {
                botDetectionScore += 10;
                console.warn('Suspicious user agent detected:', navigator.userAgent);
                return true;
            }
        }
        return false;
    }

    /**
     * Detect automation tools and headless browsers
     */
    function detectAutomationTools() {
        // Check for webdriver property
        if (navigator.webdriver) {
            botDetectionScore += 15;
            return true;
        }

        // Check for automation indicators
        if (window.phantom || window._phantom || window.callPhantom) {
            botDetectionScore += 15;
            return true;
        }

        // Check for selenium indicators
        if (window.document.documentElement.getAttribute('webdriver') ||
            window.document.documentElement.getAttribute('selenium') ||
            window.document.documentElement.getAttribute('driver')) {
            botDetectionScore += 15;
            return true;
        }

        return false;
    }

    /**
     * Monitor page interaction patterns
     */
    function monitorUserBehavior() {
        let mouseMovements = 0;
        let keyPresses = 0;
        let clicks = 0;

        // Track mouse movements
        document.addEventListener('mousemove', function() {
            mouseMovements++;
        });

        // Track key presses
        document.addEventListener('keydown', function() {
            keyPresses++;
        });

        // Track clicks
        document.addEventListener('click', function() {
            clicks++;
        });

        // Check behavior after 10 seconds
        setTimeout(function() {
            if (mouseMovements === 0 && keyPresses === 0 && clicks === 0) {
                botDetectionScore += 5;
            }
        }, 10000);
    }

    /**
     * Create honeypot elements that only bots would interact with
     */
    function createHoneypots() {
        // Create invisible input field
        const honeypotInput = document.createElement('input');
        honeypotInput.setAttribute('type', 'text');
        honeypotInput.setAttribute('name', 'website');
        honeypotInput.setAttribute('id', 'website');
        honeypotInput.setAttribute('style', honeypotStyle);
        honeypotInput.setAttribute('tabindex', '-1');
        honeypotInput.setAttribute('autocomplete', 'off');

        // Create invisible link
        const honeypotLink = document.createElement('a');
        honeypotLink.setAttribute('href', '/admin');
        honeypotLink.setAttribute('style', honeypotStyle);
        honeypotLink.textContent = 'Admin';

        // Add to DOM
        document.body.appendChild(honeypotInput);
        document.body.appendChild(honeypotLink);

        // Monitor honeypot interactions
        honeypotInput.addEventListener('focus', function() {
            botDetectionScore += 20;
            console.warn('Honeypot input interaction detected');
        });

        honeypotInput.addEventListener('input', function() {
            botDetectionScore += 25;
            console.warn('Honeypot input filled');
        });

        honeypotLink.addEventListener('click', function(e) {
            e.preventDefault();
            botDetectionScore += 25;
            console.warn('Honeypot link clicked');
        });
    }

    /**
     * Check timing patterns
     */
    function checkTimingPatterns() {
        window.addEventListener('load', function() {
            const loadTime = Date.now() - startTime;
            
            // Suspiciously fast loading (less than 100ms)
            if (loadTime < 100) {
                botDetectionScore += 5;
            }

            // Check if page is being accessed too quickly
            const lastVisit = localStorage.getItem('lastVisit');
            const currentTime = Date.now();
            
            if (lastVisit) {
                const timeDiff = currentTime - parseInt(lastVisit);
                // Visited less than 1 second ago
                if (timeDiff < 1000) {
                    botDetectionScore += 10;
                }
            }
            
            localStorage.setItem('lastVisit', currentTime.toString());
        });
    }

    /**
     * Rate limiting protection
     */
    function implementRateLimiting() {
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        const now = Date.now();
        const oneMinute = 60 * 1000;

        // Clean old visits (older than 1 minute)
        const recentVisits = visits.filter(visit => now - visit < oneMinute);

        // Add current visit
        recentVisits.push(now);

        // Check if too many visits in the last minute
        if (recentVisits.length > 10) {
            botDetectionScore += 15;
            console.warn('Rate limit exceeded');
        }

        localStorage.setItem('visits', JSON.stringify(recentVisits));
    }

    /**
     * Handle detected bots
     */
    function handleBotDetection() {
        if (botDetectionScore >= 20) {
            console.warn('Bot behavior detected. Score:', botDetectionScore);
            
            // Log the detection (in a real scenario, you might send this to analytics)
            if (window.gtag) {
                gtag('event', 'bot_detected', {
                    'event_category': 'security',
                    'event_label': 'bot_detection_score',
                    'value': botDetectionScore
                });
            }

            // Optional: Add subtle delays or limitations for suspected bots
            // Note: We avoid aggressive blocking to prevent false positives
        }
    }

    /**
     * Initialize bot protection
     */
    function initBotProtection() {
        // Run detection checks
        detectSuspiciousUserAgent();
        detectAutomationTools();
        
        // Set up monitoring
        monitorUserBehavior();
        createHoneypots();
        checkTimingPatterns();
        implementRateLimiting();

        // Check bot score periodically
        setInterval(handleBotDetection, 5000);

        console.log('Bot protection initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBotProtection);
    } else {
        initBotProtection();
    }

})();