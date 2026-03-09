/* ================================================================
   OPTIMIZED FOR THE ALGORITHM — JavaScript
   Author: Lucas Rocchetti
   Course: CCT420, University of Toronto Mississauga

   TABLE OF CONTENTS:
   1. Scroll Progress Bar
   2. Scroll-Triggered Fade Animations
   3. Hero Particle Canvas
   4. Cycling Words
   5. Start Button Smooth Scroll
   6. ATS Scanner Interaction
   7. LeetCode Timer & Interaction
   8. LinkedIn Floating Notifications
   9. Identity Compression Slider
   10. Globe Network SVG
   11. Initialization
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initScrollAnimations();
    initHeroCanvas();
    initCyclingWords();
    initStartButton();
    initATSScanner();
    initLeetCode();
    initLinkedInNotifs();
    initCompressionSlider();
    initGlobe();
});


/* ================================================================
   1. SCROLL PROGRESS BAR
   ================================================================ */

function initProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}


/* ================================================================
   2. SCROLL-TRIGGERED FADE ANIMATIONS
   Uses IntersectionObserver for performant scroll detection.
   ================================================================ */

function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Respect custom delay if set via --delay CSS variable
                const delay = entry.target.style.getPropertyValue('--delay');
                if (delay) {
                    const ms = parseFloat(delay) * 1000;
                    setTimeout(() => entry.target.classList.add('visible'), ms);
                } else {
                    entry.target.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
}


/* ================================================================
   3. HERO PARTICLE CANVAS
   Ambient particle system with connecting lines.
   ================================================================ */

function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null };

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Track mouse for subtle parallax
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle count scales with screen size
    const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Slight attraction to mouse
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    this.vx += dx * 0.00005;
                    this.vy += dy * 0.00005;
                }
            }

            // Boundary wrapping
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            // Speed limit
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0.8) {
                this.vx *= 0.98;
                this.vy *= 0.98;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(74, 124, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        const connectionDistance = 140;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(74, 124, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Subtle grid overlay
    function drawGrid() {
        const gridSize = 60;
        ctx.strokeStyle = 'rgba(74, 124, 255, 0.03)';
        ctx.lineWidth = 0.5;

        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawConnections();
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animate();
        } else {
            cancelAnimationFrame(animationId);
        }
    }, { threshold: 0 });

    heroObserver.observe(document.getElementById('hero'));
}


/* ================================================================
   4. CYCLING WORDS
   Rotates through keywords in the hero section.
   ================================================================ */

function initCyclingWords() {
    const wordElement = document.getElementById('cycling-word');
    if (!wordElement) return;

    // EDIT: Add or remove cycling words here
    const words = [
        'optimize', 'scan', 'match', 'filter', 'perform',
        'refresh', 'translate', 'compress', 'submit', 'wait',
        'rank', 'parse', 'assess', 'standardize', 'display'
    ];

    let index = 0;

    setInterval(() => {
        wordElement.classList.add('fade-out');

        setTimeout(() => {
            index = (index + 1) % words.length;
            wordElement.textContent = words[index];
            wordElement.classList.remove('fade-out');
        }, 300);
    }, 2000);
}


/* ================================================================
   5. START BUTTON SMOOTH SCROLL
   ================================================================ */

function initStartButton() {
    const btn = document.getElementById('start-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const intro = document.getElementById('introduction');
        if (intro) {
            intro.scrollIntoView({ behavior: 'smooth' });
        }
    });
}


/* ================================================================
   6. ATS SCANNER INTERACTION
   Simulates resume scanning and optimization.
   ================================================================ */

function initATSScanner() {
    const scanBtn = document.getElementById('scan-btn');
    const optimizeBtn = document.getElementById('optimize-btn');
    const meterFill = document.getElementById('meter-fill');
    const meterValue = document.getElementById('meter-value');
    const resumeVersion = document.getElementById('resume-version');
    const resumeOriginal = document.getElementById('resume-original');
    const resumeOptimized = document.getElementById('resume-optimized');
    const atsLabels = document.getElementById('ats-labels');
    const resumePanel = document.querySelector('.resume-panel');

    if (!scanBtn) return;

    let scanned = false;
    let optimized = false;

    scanBtn.addEventListener('click', () => {
        if (scanned) return;
        scanned = true;
        scanBtn.disabled = true;

        // Add scanning animation
        const panelContent = resumePanel.querySelector('.panel-content');
        panelContent.classList.add('scanning');
        setTimeout(() => panelContent.classList.remove('scanning'), 1500);

        // Highlight keywords in job description
        const keywords = document.querySelectorAll('.keyword');
        keywords.forEach((kw, i) => {
            setTimeout(() => {
                kw.classList.add('highlighted');
            }, 200 + i * 200);
        });

        // Add missing keyword markers to original resume
        setTimeout(() => {
            const originalText = resumeOriginal.querySelector('p');
            // Mark the original as having missing keywords
            originalText.innerHTML = originalText.innerHTML +
                '<br><br><span class="kw-missing">Missing: React, Node.js, TypeScript, CI/CD, Agile, REST APIs, AWS, cross-functional, microservices</span>';
        }, 1200);

        // Animate match meter to low score
        setTimeout(() => {
            animateMeter(meterFill, meterValue, 31, 'low');
            optimizeBtn.disabled = false;
        }, 1500);

        // Show floating labels
        const labels = atsLabels.querySelectorAll('.ats-label');
        labels.forEach((label, i) => {
            setTimeout(() => {
                label.classList.add('visible');
            }, 2000 + i * 250);
        });
    });

    optimizeBtn.addEventListener('click', () => {
        if (optimized) return;
        optimized = true;
        optimizeBtn.disabled = true;

        // Switch resume text
        resumeOriginal.classList.remove('active');
        resumeOptimized.classList.add('active');
        resumeVersion.textContent = 'Optimized';
        resumeVersion.style.background = 'rgba(0, 200, 83, 0.15)';
        resumeVersion.style.color = '#00c853';

        // Animate match meter to high score
        setTimeout(() => {
            animateMeter(meterFill, meterValue, 89, 'high');
        }, 400);
    });

    function animateMeter(fill, valueEl, target, level) {
        let current = 0;
        fill.className = 'meter-fill';
        if (level === 'high') fill.classList.add('high');
        else if (level === 'medium') fill.classList.add('medium');

        fill.style.width = target + '%';

        // Animate the number
        const duration = 1200;
        const start = performance.now();

        function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.floor(eased * target);
            valueEl.textContent = current + '%';

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }
}


/* ================================================================
   7. LEETCODE TIMER & INTERACTION
   Timer starts on scroll, results appear on click.
   ================================================================ */

function initLeetCode() {
    const timerEl = document.getElementById('lc-timer');
    const runBtn = document.getElementById('run-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultsPanel = document.getElementById('lc-results');
    const reflectionEl = document.getElementById('lc-reflection');

    if (!timerEl) return;

    let timerInterval = null;
    let seconds = 0;
    let timerStarted = false;

    // Start timer when section is in view
    const lcObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !timerStarted) {
            timerStarted = true;
            timerInterval = setInterval(() => {
                seconds++;
                const min = Math.floor(seconds / 60).toString().padStart(2, '0');
                const sec = (seconds % 60).toString().padStart(2, '0');
                timerEl.textContent = min + ':' + sec;
            }, 1000);
        }
    }, { threshold: 0.3 });

    lcObserver.observe(document.getElementById('leetcode-scene'));

    // Run Code button
    runBtn.addEventListener('click', () => {
        runBtn.disabled = true;
        resultsPanel.classList.remove('hidden');
        resultsPanel.innerHTML = '<div style="color: var(--text-muted);">Running test cases...</div>';

        setTimeout(() => {
            resultsPanel.innerHTML = `
                <div style="color: var(--accent-green); margin-bottom: 4px;">&#10003; Test case 1: Passed</div>
                <div style="color: var(--accent-green); margin-bottom: 4px;">&#10003; Test case 2: Passed</div>
                <div style="color: var(--accent-green); margin-bottom: 4px;">&#10003; Test case 3: Passed</div>
                <div style="color: var(--text-muted); margin-top: 8px; font-size: 0.75rem;">3/3 test cases passed</div>
            `;
            runBtn.disabled = false;
        }, 1500);
    });

    // Submit button
    submitBtn.addEventListener('click', () => {
        submitBtn.disabled = true;
        runBtn.disabled = true;
        clearInterval(timerInterval);

        resultsPanel.classList.remove('hidden');
        resultsPanel.innerHTML = '<div style="color: var(--text-muted);">Submitting solution...</div>';

        setTimeout(() => {
            const runtime = Math.floor(Math.random() * 8) + 2;
            const memory = (Math.random() * 5 + 40).toFixed(1);
            const percentile = (Math.random() * 30 + 55).toFixed(1);

            resultsPanel.innerHTML = `
                <div class="result-accepted">&#10003; Accepted</div>
                <div class="result-metric">Runtime: <strong>${runtime} ms</strong></div>
                <div class="result-metric">Memory: <strong>${memory} MB</strong></div>
                <div class="result-percentile">Faster than ${percentile}% of submissions</div>
            `;

            // Show reflection
            setTimeout(() => {
                reflectionEl.classList.remove('hidden');
                reflectionEl.classList.add('visible');
            }, 800);
        }, 2000);
    });
}


/* ================================================================
   8. LINKEDIN FLOATING NOTIFICATIONS
   Notifications appear and disappear periodically.
   ================================================================ */

function initLinkedInNotifs() {
    const container = document.getElementById('floating-notifs');
    const notifCount = document.getElementById('notif-count');
    if (!container) return;

    // EDIT: Add or modify notification messages here
    const notifications = [
        '&#128065; A recruiter viewed your profile',
        '&#128188; Application viewed — Innovate Corp.',
        '&#128200; You appeared in 23 searches today',
        '&#128276; 4 new job recommendations',
        '&#128172; New message from Tech Recruiter',
        '&#128681; Application deadline approaching: DataSoft',
        '&#128101; 2 connections were hired this week',
        '&#128203; Your application has been reviewed',
        '&#128274; Application closed — NovaTech',
        '&#10060; Not selected — MegaSoft Inc.'
    ];

    let notifIndex = 0;
    let count = 3;
    let intervalId = null;

    // Start when section is visible
    const liObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            if (!intervalId) {
                intervalId = setInterval(showNotification, 3500);
            }
        } else {
            clearInterval(intervalId);
            intervalId = null;
        }
    }, { threshold: 0.2 });

    liObserver.observe(document.getElementById('linkedin-scene'));

    function showNotification() {
        const notif = document.createElement('div');
        notif.className = 'floating-notif';
        notif.innerHTML = notifications[notifIndex % notifications.length];
        container.appendChild(notif);

        count++;
        if (notifCount) notifCount.textContent = count;
        notifIndex++;

        // Remove after delay
        setTimeout(() => {
            notif.classList.add('exit');
            setTimeout(() => {
                if (notif.parentNode) notif.parentNode.removeChild(notif);
            }, 400);
        }, 3000);

        // Keep max 3 visible
        while (container.children.length > 3) {
            container.removeChild(container.firstChild);
        }
    }
}


/* ================================================================
   9. IDENTITY COMPRESSION SLIDER
   Transforms text from human to machine-readable.
   ================================================================ */

function initCompressionSlider() {
    const slider = document.getElementById('compression-slider');
    const lines = document.querySelectorAll('.comp-line');
    const meterValue = document.getElementById('comp-meter-value');

    if (!slider || lines.length === 0) return;

    // Initialize all lines with human text
    updateCompressionText(0);

    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        updateCompressionText(value);

        // Update meter
        if (meterValue) {
            meterValue.textContent = value + '%';
            // Color transition from blue to orange
            if (value > 60) {
                meterValue.style.color = '#ff8c00';
            } else {
                meterValue.style.color = '#4a7cff';
            }
        }

        // Update slider thumb color
        if (value > 60) {
            slider.style.setProperty('--thumb-color', '#ff8c00');
        }
    });

    function updateCompressionText(value) {
        lines.forEach(line => {
            const human = line.getAttribute('data-human');
            const machine = line.getAttribute('data-machine');
            const textEl = line.querySelector('.comp-text');

            if (value < 30) {
                textEl.textContent = human;
                line.removeAttribute('data-mode');
            } else if (value < 70) {
                // Blend: show partial transformation
                textEl.textContent = blendText(human, machine, value);
                line.removeAttribute('data-mode');
            } else {
                textEl.textContent = machine;
                line.setAttribute('data-mode', 'machine');
            }
        });
    }

    function blendText(human, machine, value) {
        // At 30-70%, show a transitional state
        // Split into words and mix
        const humanWords = human.split(' ');
        const machineWords = machine.split(' ');
        const ratio = (value - 30) / 40; // 0 to 1

        // Progressively replace human words with machine fragments
        const breakpoint = Math.floor(humanWords.length * ratio);
        const result = [];

        for (let i = 0; i < humanWords.length; i++) {
            if (i < breakpoint) {
                const machineIdx = Math.floor((i / humanWords.length) * machineWords.length);
                result.push(machineWords[machineIdx] || '...');
            } else {
                result.push(humanWords[i]);
            }
        }

        return result.join(' ');
    }
}


/* ================================================================
   10. GLOBE NETWORK SVG
   Generates nodes and animated connections for major tech hubs.
   ================================================================ */

function initGlobe() {
    const svg = document.getElementById('globe-svg');
    if (!svg) return;

    const connectionsGroup = document.getElementById('globe-connections');
    const nodesGroup = document.getElementById('globe-nodes');

    // EDIT: Add, remove, or reposition cities here.
    // Coordinates are on a 1000x500 viewBox.
    const cities = [
        { name: 'San Francisco', x: 110, y: 210 },
        { name: 'New York', x: 230, y: 200 },
        { name: 'Toronto', x: 225, y: 180 },
        { name: 'S\u00e3o Paulo', x: 300, y: 380 },
        { name: 'London', x: 460, y: 165 },
        { name: 'Berlin', x: 500, y: 160 },
        { name: 'Lagos', x: 465, y: 315 },
        { name: 'Dubai', x: 600, y: 250 },
        { name: 'Bangalore', x: 660, y: 295 },
        { name: 'Singapore', x: 720, y: 330 },
        { name: 'Beijing', x: 750, y: 200 },
        { name: 'Tokyo', x: 820, y: 200 },
        { name: 'Sydney', x: 840, y: 405 }
    ];

    // Generate connections (connect each city to 2-4 others)
    const connections = [];
    for (let i = 0; i < cities.length; i++) {
        const numConnections = 2 + Math.floor(Math.random() * 3);
        for (let c = 0; c < numConnections; c++) {
            const j = (i + 1 + Math.floor(Math.random() * (cities.length - 1))) % cities.length;
            // Avoid duplicate connections
            const exists = connections.some(
                conn => (conn[0] === i && conn[1] === j) || (conn[0] === j && conn[1] === i)
            );
            if (!exists) {
                connections.push([i, j]);
            }
        }
    }

    // Draw connections
    connections.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cities[i].x);
        line.setAttribute('y1', cities[i].y);
        line.setAttribute('x2', cities[j].x);
        line.setAttribute('y2', cities[j].y);
        line.setAttribute('class', 'globe-connection');
        // Randomize animation speed for visual variety
        line.style.animationDuration = (2 + Math.random() * 4) + 's';
        connectionsGroup.appendChild(line);
    });

    // Draw nodes and labels
    cities.forEach(city => {
        // Outer ring
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', city.x);
        ring.setAttribute('cy', city.y);
        ring.setAttribute('r', 8);
        ring.setAttribute('class', 'globe-node-ring');
        nodesGroup.appendChild(ring);

        // Inner dot
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', city.x);
        dot.setAttribute('cy', city.y);
        dot.setAttribute('r', 3);
        dot.setAttribute('class', 'globe-node');
        nodesGroup.appendChild(dot);

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', city.x);
        label.setAttribute('y', city.y + 18);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'globe-city-label');
        label.textContent = city.name;
        nodesGroup.appendChild(label);
    });

    // Pulse animation for nodes
    const nodeElements = nodesGroup.querySelectorAll('.globe-node');
    setInterval(() => {
        const randomNode = nodeElements[Math.floor(Math.random() * nodeElements.length)];
        randomNode.style.transition = 'r 0.3s ease, opacity 0.3s ease';
        randomNode.setAttribute('r', '5');
        randomNode.style.opacity = '1';
        setTimeout(() => {
            randomNode.setAttribute('r', '3');
            randomNode.style.opacity = '';
        }, 600);
    }, 1500);
}


/* ================================================================
   11. INITIALIZATION COMPLETE
   Additional utility: pause animations when tab is not visible.
   ================================================================ */

document.addEventListener('visibilitychange', () => {
    // Browser handles requestAnimationFrame pausing automatically,
    // but we can use this for interval-based animations if needed.
});
