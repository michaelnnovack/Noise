/**
 * Analog Gauge Component for Noise Detector
 * Professional speedometer-style gauge with real-time dB monitoring
 * Optimized for user engagement and ad revenue retention
 */

class Gauge {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        
        // Configuration options - updated ranges per requirements
        this.options = {
            minValue: 0,
            maxValue: 140,
            size: 280,
            lineWidth: 25,
            needleColor: '#ffffff',
            ranges: [
                { min: 0, max: 50, color: '#27ae60', label: 'Safe' },
                { min: 50, max: 70, color: '#f1c40f', label: 'Moderate' },
                { min: 70, max: 85, color: '#e67e22', label: 'Loud' },
                { min: 85, max: 140, color: '#e74c3c', label: 'Dangerous' }
            ],
            theme: 'dark',
            ...options
        };
        
        this.currentValue = this.options.minValue;
        this.targetValue = this.options.minValue;
        this.animationFrame = null;
        this.isAnimating = false;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Theme configurations
        this.themes = {
            dark: {
                background: '#1a1a1a',
                textColor: '#ffffff',
                tickColor: '#ffffff',
                centerColor: '#ffffff'
            },
            light: {
                background: '#f8f9fa',
                textColor: '#2c3e50',
                tickColor: '#2c3e50',
                centerColor: '#2c3e50'
            },
            professional: {
                background: '#2c3e50',
                textColor: '#ecf0f1',
                tickColor: '#bdc3c7',
                centerColor: '#ecf0f1'
            }
        };
        
        this.init();
    }
    
    init() {
        try {
            // Validate container exists and has dimensions
            const containerRect = this.container.getBoundingClientRect();
            if (containerRect.width === 0 || containerRect.height === 0) {
                console.warn('Container has zero dimensions:', containerRect.width, 'x', containerRect.height);
                // Set a minimum size to prevent rendering issues
                this.options.size = Math.max(this.options.size, 280);
                
                // Force container to have a minimum size
                this.container.style.width = `${this.options.size}px`;
                this.container.style.height = `${this.options.size}px`;
            }
            
            this.createGaugeStructure();
            this.setupCanvas();
            this.render();
            this.setupResizeListener();
            console.log('Professional gauge initialized with enhanced features');
        } catch (error) {
            console.error('Gauge initialization failed:', error);
            throw error;
        }
    }
    
    setupCanvas() {
        // Setup high-DPI canvas for crisp rendering
        const rect = this.canvas.getBoundingClientRect();
        let size = this.options.size;
        
        // Ensure we have valid dimensions
        if (!size || size <= 0 || !isFinite(size)) {
            console.warn('Invalid or missing canvas size:', size, 'using fallback');
            size = 280; // Fallback size
            this.options.size = size;
        }
        
        // Validate lineWidth exists
        if (!this.options.lineWidth || this.options.lineWidth <= 0) {
            console.warn('Invalid lineWidth, using fallback');
            this.options.lineWidth = 25;
        }
        
        this.canvas.width = size * this.pixelRatio;
        this.canvas.height = size * this.pixelRatio;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;
        
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Enable crisp rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 150);
        });
    }
    
    handleResize() {
        const containerWidth = this.container.clientWidth;
        const isMobile = window.innerWidth <= 768;
        const newSize = isMobile ? Math.min(containerWidth - 40, 240) : Math.min(containerWidth - 40, 280);
        
        if (newSize !== this.options.size) {
            this.resize(newSize);
        }
    }
    
    createGaugeStructure() {
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Create main gauge container with enhanced styling
        const gaugeDiv = document.createElement('div');
        gaugeDiv.className = 'gauge-container professional-gauge';
        gaugeDiv.setAttribute('role', 'img');
        gaugeDiv.setAttribute('aria-label', `Real-time noise level gauge showing ${this.currentValue} decibels`);
        gaugeDiv.setAttribute('tabindex', '0');
        
        // Create canvas for drawing the gauge
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'gauge-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        
        this.ctx = this.canvas.getContext('2d');
        
        // Create digital readout overlay
        const digitalReadout = document.createElement('div');
        digitalReadout.className = 'gauge-digital-readout';
        digitalReadout.innerHTML = `
            <span class="gauge-value">${Math.round(this.currentValue)}</span>
            <span class="gauge-unit">dB</span>
        `;
        
        // Add canvas to container
        gaugeDiv.appendChild(this.canvas);
        gaugeDiv.appendChild(digitalReadout);
        
        // Add screen reader friendly text
        const srLabel = document.createElement('span');
        srLabel.className = 'gauge-sr-label';
        srLabel.textContent = `Current noise level: ${this.currentValue} decibels`;
        srLabel.setAttribute('aria-live', 'polite');
        srLabel.setAttribute('aria-atomic', 'true');
        gaugeDiv.appendChild(srLabel);
        
        this.container.appendChild(gaugeDiv);
        this.srLabel = srLabel;
        this.digitalReadout = digitalReadout.querySelector('.gauge-value');
    }
    
    render() {
        if (!this.ctx) return;
        
        // Validate and ensure we have valid dimensions
        const size = this.options.size || 280;
        const lineWidth = this.options.lineWidth || 25;
        
        if (!isFinite(size) || size <= 0) {
            console.error('Invalid gauge size:', size);
            return;
        }
        
        const center = size / 2;
        const radius = (size - lineWidth) / 2 - 15;
        
        // Final validation of calculated values
        if (!isFinite(center) || !isFinite(radius) || radius <= 0) {
            console.error('Invalid calculated dimensions:', { size, center, radius, lineWidth });
            return;
        }
        
        // Clear canvas with gradient background
        this.drawBackground(size);
        
        // Draw outer ring shadow for depth
        this.drawOuterShadow(center, center, radius);
        
        // Draw gauge background arcs with enhanced styling
        this.drawRangeArcs(center, center, radius);
        
        // Draw tick marks and labels with improved spacing
        this.drawTickMarks(center, center, radius);
        this.drawLabels(center, center, radius);
        
        // Draw needle with shadow and enhanced design
        this.drawNeedleShadow(center, center, radius);
        this.drawNeedle(center, center, radius);
        
        // Draw center circle with gradient
        this.drawCenter(center, center);
        
        // Draw range labels
        this.drawRangeLabels(center, center, radius);
    }
    
    drawBackground(size) {
        const theme = this.themes[this.options.theme];
        
        // Create radial gradient background
        const gradient = this.ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, theme.background);
        gradient.addColorStop(1, this.darkenColor(theme.background, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);
    }
    
    drawOuterShadow(centerX, centerY, radius) {
        // Add subtle outer shadow for depth
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius + this.options.lineWidth / 2, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawRangeArcs(centerX, centerY, radius) {
        // Validate all input parameters before proceeding
        if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(radius) || radius <= 0) {
            console.warn('Invalid parameters for drawRangeArcs:', { centerX, centerY, radius });
            return;
        }
        
        const startAngle = Math.PI * 0.75; // Start at 7:30 position
        const endAngle = Math.PI * 2.25; // End at 4:30 position
        const totalAngle = endAngle - startAngle;
        const valueRange = this.options.maxValue - this.options.minValue;
        
        // Validate value range
        if (!isFinite(valueRange) || valueRange <= 0) {
            console.warn('Invalid value range:', valueRange);
            return;
        }
        
        this.options.ranges.forEach((range, index) => {
            const rangeStart = startAngle + (range.min - this.options.minValue) / valueRange * totalAngle;
            const rangeEnd = startAngle + (range.max - this.options.minValue) / valueRange * totalAngle;
            
            // Validate angle calculations
            if (!isFinite(rangeStart) || !isFinite(rangeEnd)) {
                console.warn('Non-finite range angles, skipping range:', range);
                return;
            }
            
            // Create gradient for each range
            const x1 = centerX + Math.cos(rangeStart) * radius;
            const y1 = centerY + Math.sin(rangeStart) * radius;
            const x2 = centerX + Math.cos(rangeEnd) * radius;
            const y2 = centerY + Math.sin(rangeEnd) * radius;
            
            // Ensure all gradient coordinates are finite
            if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
                console.warn('Non-finite gradient coordinates, skipping range:', range);
                return;
            }
            
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            
            gradient.addColorStop(0, range.color);
            gradient.addColorStop(1, this.lightenColor(range.color, 0.2));
            
            // Draw background arc (darker)
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, rangeStart, rangeEnd);
            this.ctx.strokeStyle = this.darkenColor(range.color, 0.6);
            this.ctx.lineWidth = this.options.lineWidth + 4;
            this.ctx.stroke();
            
            // Draw main arc with gradient
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, rangeStart, rangeEnd);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = this.options.lineWidth;
            this.ctx.stroke();
            
            // Add inner highlight for 3D effect
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius - this.options.lineWidth / 4, rangeStart, rangeEnd);
            this.ctx.strokeStyle = this.lightenColor(range.color, 0.4);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    drawTickMarks(centerX, centerY, radius) {
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;
        const valueRange = this.options.maxValue - this.options.minValue;
        const theme = this.themes[this.options.theme];
        
        // Major ticks (every 20 dB)
        for (let value = this.options.minValue; value <= this.options.maxValue; value += 20) {
            const angle = startAngle + (value - this.options.minValue) / valueRange * totalAngle;
            this.drawTick(centerX, centerY, radius, angle, 18, 3, theme.tickColor, true);
        }
        
        // Minor ticks (every 10 dB)
        for (let value = this.options.minValue; value <= this.options.maxValue; value += 10) {
            if (value % 20 !== 0) {
                const angle = startAngle + (value - this.options.minValue) / valueRange * totalAngle;
                this.drawTick(centerX, centerY, radius, angle, 10, 2, this.lightenColor(theme.tickColor, 0.3), false);
            }
        }
        
        // Micro ticks (every 5 dB) for enhanced precision
        for (let value = this.options.minValue; value <= this.options.maxValue; value += 5) {
            if (value % 10 !== 0) {
                const angle = startAngle + (value - this.options.minValue) / valueRange * totalAngle;
                this.drawTick(centerX, centerY, radius, angle, 6, 1, this.lightenColor(theme.tickColor, 0.5), false);
            }
        }
    }
    
    drawTick(centerX, centerY, radius, angle, length, width, color, isMajor = false) {
        const innerRadius = radius - length;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        
        // Add shadow for major ticks
        if (isMajor) {
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        
        if (isMajor) {
            this.ctx.restore();
        }
    }
    
    drawLabels(centerX, centerY, radius) {
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;
        const valueRange = this.options.maxValue - this.options.minValue;
        const labelRadius = radius - 45;
        const theme = this.themes[this.options.theme];
        
        // Modern font stack for better readability
        this.ctx.fillStyle = theme.textColor;
        this.ctx.font = 'bold 14px "Segoe UI", "Roboto", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow for better contrast
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // Draw value labels (every 20 dB)
        for (let value = this.options.minValue; value <= this.options.maxValue; value += 20) {
            const angle = startAngle + (value - this.options.minValue) / valueRange * totalAngle;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;
            
            this.ctx.fillText(value.toString(), x, y);
        }
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawRangeLabels(centerX, centerY, radius) {
        const theme = this.themes[this.options.theme];
        const labelRadius = radius + 35;
        
        this.ctx.fillStyle = theme.textColor;
        this.ctx.font = 'bold 11px "Segoe UI", "Roboto", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Position range labels around the gauge
        const positions = [
            { label: 'SAFE', angle: Math.PI * 0.9, color: '#27ae60' },
            { label: 'MODERATE', angle: Math.PI * 1.3, color: '#f1c40f' },
            { label: 'LOUD', angle: Math.PI * 1.7, color: '#e67e22' },
            { label: 'DANGEROUS', angle: Math.PI * 2.1, color: '#e74c3c' }
        ];
        
        positions.forEach(pos => {
            const x = centerX + Math.cos(pos.angle) * labelRadius;
            const y = centerY + Math.sin(pos.angle) * labelRadius;
            
            this.ctx.fillStyle = pos.color;
            this.ctx.fillText(pos.label, x, y);
        });
    }
    
    drawNeedleShadow(centerX, centerY, radius) {
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;
        const valueRange = this.options.maxValue - this.options.minValue;
        
        const needleAngle = startAngle + (this.currentValue - this.options.minValue) / valueRange * totalAngle;
        const needleLength = radius - 40;
        
        // Draw needle shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        const tipX = centerX + Math.cos(needleAngle) * needleLength;
        const tipY = centerY + Math.sin(needleAngle) * needleLength;
        
        const baseAngle1 = needleAngle + Math.PI / 2;
        const baseAngle2 = needleAngle - Math.PI / 2;
        const baseRadius = 4;
        
        const base1X = centerX + Math.cos(baseAngle1) * baseRadius;
        const base1Y = centerY + Math.sin(baseAngle1) * baseRadius;
        const base2X = centerX + Math.cos(baseAngle2) * baseRadius;
        const base2Y = centerY + Math.sin(baseAngle2) * baseRadius;
        
        this.ctx.beginPath();
        this.ctx.moveTo(tipX, tipY);
        this.ctx.lineTo(base1X, base1Y);
        this.ctx.lineTo(base2X, base2Y);
        this.ctx.closePath();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawNeedle(centerX, centerY, radius) {
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;
        const valueRange = this.options.maxValue - this.options.minValue;
        const theme = this.themes[this.options.theme];
        
        // Calculate needle angle based on current value
        const needleAngle = startAngle + (this.currentValue - this.options.minValue) / valueRange * totalAngle;
        
        // Enhanced needle dimensions
        const needleLength = radius - 40;
        const needleWidth = 4;
        const tailLength = 20;
        
        // Calculate needle tip position
        const tipX = centerX + Math.cos(needleAngle) * needleLength;
        const tipY = centerY + Math.sin(needleAngle) * needleLength;
        
        // Calculate needle tail position
        const tailX = centerX - Math.cos(needleAngle) * tailLength;
        const tailY = centerY - Math.sin(needleAngle) * tailLength;
        
        // Calculate needle base positions
        const baseAngle1 = needleAngle + Math.PI / 2;
        const baseAngle2 = needleAngle - Math.PI / 2;
        const baseRadius = needleWidth;
        
        const base1X = centerX + Math.cos(baseAngle1) * baseRadius;
        const base1Y = centerY + Math.sin(baseAngle1) * baseRadius;
        const base2X = centerX + Math.cos(baseAngle2) * baseRadius;
        const base2Y = centerY + Math.sin(baseAngle2) * baseRadius;
        
        // Create needle gradient
        const needleGradient = this.ctx.createLinearGradient(tailX, tailY, tipX, tipY);
        needleGradient.addColorStop(0, theme.centerColor);
        needleGradient.addColorStop(0.7, '#ffffff');
        needleGradient.addColorStop(1, '#ff4444');
        
        // Draw main needle body
        this.ctx.beginPath();
        this.ctx.moveTo(tipX, tipY);
        this.ctx.lineTo(base1X, base1Y);
        this.ctx.lineTo(tailX, tailY);
        this.ctx.lineTo(base2X, base2Y);
        this.ctx.closePath();
        
        this.ctx.fillStyle = needleGradient;
        this.ctx.fill();
        
        // Add needle outline
        this.ctx.strokeStyle = this.darkenColor(theme.centerColor, 0.4);
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Add needle tip highlight
        this.ctx.beginPath();
        this.ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawCenter(centerX, centerY) {
        const theme = this.themes[this.options.theme];
        
        // Draw center circle shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Create radial gradient for center
        const centerGradient = this.ctx.createRadialGradient(
            centerX - 2, centerY - 2, 0,
            centerX, centerY, 12
        );
        centerGradient.addColorStop(0, '#ffffff');
        centerGradient.addColorStop(0.7, theme.centerColor);
        centerGradient.addColorStop(1, this.darkenColor(theme.centerColor, 0.3));
        
        // Draw outer center ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGradient;
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Draw inner center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        
        // Add center ring highlight
        this.ctx.strokeStyle = this.lightenColor(theme.centerColor, 0.3);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    update(value) {
        // Smooth the value change for better visual experience
        this.targetValue = Math.max(this.options.minValue, Math.min(this.options.maxValue, value));
        
        // Only start animation if not already animating or if significant change
        if (!this.isAnimating || Math.abs(this.targetValue - this.currentValue) > 5) {
            this.animateToTarget();
        }
        
        // Update digital readout
        if (this.digitalReadout) {
            this.digitalReadout.textContent = Math.round(value);
            this.digitalReadout.className = `gauge-value ${this.getColorClassForValue(value)}`;
        }
        
        // Update accessibility label
        if (this.srLabel) {
            const roundedValue = Math.round(this.currentValue);
            const category = this.getCategoryForValue(roundedValue);
            this.srLabel.textContent = `Current noise level: ${roundedValue} decibels, ${category} level`;
        }
    }
    
    // Method required by specification
    updateReading(dbValue) {
        this.update(dbValue);
    }
    
    animateToTarget() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.isAnimating = true;
        const animate = () => {
            const diff = this.targetValue - this.currentValue;
            const step = diff * 0.15; // Faster, smoother animation for 60fps
            
            if (Math.abs(diff) > 0.1) {
                this.currentValue += step;
                this.render();
                
                // Continue animation at 60fps
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.currentValue = this.targetValue;
                this.render();
                this.isAnimating = false;
                this.animationFrame = null;
            }
        };
        
        animate();
    }
    
    setValue(value) {
        // Immediately set value without animation
        this.currentValue = Math.max(this.options.minValue, Math.min(this.options.maxValue, value));
        this.targetValue = this.currentValue;
        
        // Cancel any ongoing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
            this.isAnimating = false;
        }
        
        this.render();
    }
    
    getCurrentValue() {
        return this.currentValue;
    }
    
    getColorForValue(value) {
        for (const range of this.options.ranges) {
            if (value >= range.min && value <= range.max) {
                return range.color;
            }
        }
        return '#666666'; // Default color
    }
    
    resize(newSize) {
        if (newSize && newSize !== this.options.size) {
            this.options.size = newSize;
            this.setupCanvas();
            this.render();
        }
    }
    
    // Method required by specification
    initialize(canvasElement) {
        if (canvasElement) {
            this.canvas = canvasElement;
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.render();
        }
    }
    
    // Method required by specification
    setTheme(colorScheme) {
        if (this.themes[colorScheme]) {
            this.options.theme = colorScheme;
            this.render();
        }
    }
    
    destroy() {
        // Cancel any ongoing animations
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remove resize listener
        window.removeEventListener('resize', this.handleResize);
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Clear references
        this.canvas = null;
        this.ctx = null;
        this.digitalReadout = null;
        this.srLabel = null;
    }
    
    // Utility methods for color manipulation
    lightenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000
            + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100
            + (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    darkenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000
            + (G > 0 ? G : 0) * 0x100
            + (B > 0 ? B : 0))
            .toString(16).slice(1);
    }
    
    getColorClassForValue(value) {
        for (const range of this.options.ranges) {
            if (value >= range.min && value <= range.max) {
                return range.label.toLowerCase();
            }
        }
        return 'safe';
    }
    
    getCategoryForValue(value) {
        for (const range of this.options.ranges) {
            if (value >= range.min && value <= range.max) {
                return range.label;
            }
        }
        return 'Safe';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gauge;
}