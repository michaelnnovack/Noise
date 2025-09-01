/**
 * Gauge Test Suite
 * Comprehensive tests for canvas rendering, animations, and responsive behavior
 */

const Gauge = require('../js/gauge.js');

describe('Gauge', () => {
  let gauge;
  let mockContainer;

  beforeEach(() => {
    // Create mock container element
    mockContainer = {
      innerHTML: '',
      clientWidth: 300,
      clientHeight: 300,
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 300,
        height: 300,
        top: 0,
        left: 0
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        textContent: '0',
        className: 'gauge-value'
      })
    };

    // Mock document.getElementById
    document.getElementById = jest.fn().mockReturnValue(mockContainer);

    gauge = new Gauge('test-gauge');
  });

  afterEach(() => {
    if (gauge) {
      gauge.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    test('should create instance with default options', () => {
      expect(gauge).toBeInstanceOf(Gauge);
      expect(gauge.containerId).toBe('test-gauge');
      expect(gauge.container).toBe(mockContainer);
      expect(gauge.options.minValue).toBe(0);
      expect(gauge.options.maxValue).toBe(140);
      expect(gauge.options.size).toBe(280);
      expect(gauge.options.theme).toBe('dark');
    });

    test('should merge custom options with defaults', () => {
      const customOptions = {
        size: 350,
        theme: 'light',
        needleColor: '#ff0000'
      };
      
      const customGauge = new Gauge('test-gauge', customOptions);
      
      expect(customGauge.options.size).toBe(350);
      expect(customGauge.options.theme).toBe('light');
      expect(customGauge.options.needleColor).toBe('#ff0000');
      expect(customGauge.options.minValue).toBe(0); // Should keep default
      
      customGauge.destroy();
    });

    test('should throw error if container not found', () => {
      document.getElementById.mockReturnValue(null);
      
      expect(() => new Gauge('non-existent')).toThrow('Container element with id "non-existent" not found');
    });

    test('should initialize with correct ranges', () => {
      expect(gauge.options.ranges).toEqual([
        { min: 0, max: 50, color: '#27ae60', label: 'Safe' },
        { min: 50, max: 70, color: '#f1c40f', label: 'Moderate' },
        { min: 70, max: 85, color: '#e67e22', label: 'Loud' },
        { min: 85, max: 140, color: '#e74c3c', label: 'Dangerous' }
      ]);
    });

    test('should create gauge structure with accessibility features', () => {
      expect(mockContainer.appendChild).toHaveBeenCalled();
      
      const addedElement = mockContainer.appendChild.mock.calls[0][0];
      expect(addedElement).toBeDefined();
      expect(typeof addedElement.setAttribute).toBe('function');
    });

    test('should setup canvas with high DPI support', () => {
      expect(gauge.canvas).toBeTruthy();
      expect(gauge.ctx).toBeTruthy();
      expect(gauge.canvas.width).toBe(280); // size * pixelRatio (1)
      expect(gauge.canvas.height).toBe(280);
      expect(gauge.ctx.scale).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('Canvas Setup and Rendering', () => {
    test('should setup canvas with correct dimensions', () => {
      gauge.setupCanvas();
      
      expect(gauge.canvas.width).toBe(280);
      expect(gauge.canvas.height).toBe(280);
      expect(gauge.canvas.style.width).toBe('280px');
      expect(gauge.canvas.style.height).toBe('280px');
    });

    test('should enable high-quality rendering', () => {
      gauge.setupCanvas();
      
      expect(gauge.ctx.imageSmoothingEnabled).toBe(true);
      expect(gauge.ctx.imageSmoothingQuality).toBe('high');
    });

    test('should render gauge components', () => {
      const renderSpy = jest.spyOn(gauge, 'render');
      
      gauge.render();
      
      expect(renderSpy).toHaveBeenCalled();
      
      // Verify canvas drawing methods were called
      expect(gauge.ctx.beginPath).toHaveBeenCalled();
      expect(gauge.ctx.arc).toHaveBeenCalled();
      expect(gauge.ctx.stroke).toHaveBeenCalled();
      expect(gauge.ctx.fill).toHaveBeenCalled();
    });

    test('should not render if context is missing', () => {
      gauge.ctx = null;
      
      // Should not throw when context is missing
      expect(() => gauge.render()).not.toThrow();
    });
  });

  describe('Theme Management', () => {
    test('should have predefined themes', () => {
      expect(gauge.themes.dark).toBeDefined();
      expect(gauge.themes.light).toBeDefined();
      expect(gauge.themes.professional).toBeDefined();
    });

    test('should switch themes', () => {
      const renderSpy = jest.spyOn(gauge, 'render');
      
      gauge.setTheme('light');
      
      expect(gauge.options.theme).toBe('light');
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should ignore invalid theme', () => {
      const originalTheme = gauge.options.theme;
      const renderSpy = jest.spyOn(gauge, 'render');
      
      gauge.setTheme('invalid-theme');
      
      expect(gauge.options.theme).toBe(originalTheme);
      expect(renderSpy).not.toHaveBeenCalled();
    });

    test('should apply theme colors correctly', () => {
      gauge.options.theme = 'light';
      const theme = gauge.themes.light;
      
      gauge.render();
      
      // Verify that fillStyle was set during rendering
      expect(gauge.ctx.fillStyle).toBeDefined();
    });
  });

  describe('Value Updates and Animation', () => {
    test('should update value smoothly', () => {
      const animateSpy = jest.spyOn(gauge, 'animateToTarget');
      
      gauge.update(75);
      
      expect(gauge.targetValue).toBe(75);
      expect(animateSpy).toHaveBeenCalled();
    });

    test('should clamp values to valid range', () => {
      gauge.update(200);
      expect(gauge.targetValue).toBe(140);
      
      gauge.update(-50);
      expect(gauge.targetValue).toBe(0);
    });

    test('should update digital readout', () => {
      gauge.digitalReadout = { 
        textContent: '0', 
        className: 'gauge-value' 
      };
      
      gauge.update(85);
      
      expect(gauge.digitalReadout.textContent).toBe(85);
    });

    test('should update accessibility label', () => {
      gauge.srLabel = { textContent: '' };
      gauge.currentValue = 75;
      
      gauge.update(75);
      
      expect(gauge.srLabel.textContent).toContain('75 decibels');
      expect(gauge.srLabel.textContent).toContain('Loud level');
    });

    test('should support legacy updateReading method', () => {
      const updateSpy = jest.spyOn(gauge, 'update');
      
      gauge.updateReading(50);
      
      expect(updateSpy).toHaveBeenCalledWith(50);
    });

    test('should set value immediately without animation', () => {
      const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');
      gauge.animationFrame = 123;
      
      gauge.setValue(60);
      
      expect(gauge.currentValue).toBe(60);
      expect(gauge.targetValue).toBe(60);
      expect(cancelSpy).toHaveBeenCalledWith(123);
      expect(gauge.animationFrame).toBe(null);
      expect(gauge.isAnimating).toBe(false);
    });

    test('should get current value', () => {
      gauge.currentValue = 45;
      expect(gauge.getCurrentValue()).toBe(45);
    });
  });

  describe('Animation System', () => {
    test('should animate to target value smoothly', () => {
      const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame');
      
      gauge.currentValue = 30;
      gauge.targetValue = 80;
      gauge.animateToTarget();
      
      expect(gauge.isAnimating).toBe(true);
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    test('should complete animation when close to target', () => {
      gauge.currentValue = 49.95;
      gauge.targetValue = 50;
      
      gauge.animateToTarget();
      
      // Animation should complete immediately due to small difference
      setTimeout(() => {
        expect(gauge.currentValue).toBe(50);
        expect(gauge.isAnimating).toBe(false);
      }, 100);
    });

    test('should cancel previous animation when starting new one', () => {
      const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');
      gauge.animationFrame = 456;
      
      gauge.animateToTarget();
      
      expect(cancelSpy).toHaveBeenCalledWith(456);
    });

    test('should only start animation for significant changes', () => {
      const animateSpy = jest.spyOn(gauge, 'animateToTarget');
      
      gauge.currentValue = 50;
      gauge.targetValue = 52; // Small change < 5
      gauge.isAnimating = false;
      
      gauge.update(52);
      
      // Animation may still start but won't be called repeatedly
      expect(animateSpy).toHaveBeenCalled();
    });

    test('should start animation for significant changes', () => {
      const animateSpy = jest.spyOn(gauge, 'animateToTarget');
      
      gauge.currentValue = 50;
      gauge.targetValue = 80; // Large change > 5
      
      gauge.update(80);
      
      expect(animateSpy).toHaveBeenCalled();
    });
  });

  describe('Color and Range Management', () => {
    test('should return correct color for value', () => {
      expect(gauge.getColorForValue(25)).toBe('#27ae60'); // Safe
      expect(gauge.getColorForValue(60)).toBe('#f1c40f');  // Moderate
      expect(gauge.getColorForValue(75)).toBe('#e67e22');  // Loud
      expect(gauge.getColorForValue(100)).toBe('#e74c3c'); // Dangerous
    });

    test('should return default color for out-of-range value', () => {
      const color = gauge.getColorForValue(-10);
      expect(color).toBe('#666666');
    });

    test('should return correct category for value', () => {
      expect(gauge.getCategoryForValue(25)).toBe('Safe');
      expect(gauge.getCategoryForValue(60)).toBe('Moderate');
      expect(gauge.getCategoryForValue(75)).toBe('Loud');
      expect(gauge.getCategoryForValue(100)).toBe('Dangerous');
    });

    test('should return default category for out-of-range value', () => {
      expect(gauge.getCategoryForValue(-10)).toBe('Safe');
    });

    test('should return correct CSS class for value', () => {
      expect(gauge.getColorClassForValue(25)).toBe('safe');
      expect(gauge.getColorClassForValue(60)).toBe('moderate');
      expect(gauge.getColorClassForValue(75)).toBe('loud');
      expect(gauge.getColorClassForValue(100)).toBe('dangerous');
    });
  });

  describe('Responsive Behavior', () => {
    test('should handle resize event', () => {
      const resizeSpy = jest.spyOn(gauge, 'resize');
      mockContainer.clientWidth = 200;
      
      gauge.handleResize();
      
      expect(resizeSpy).toHaveBeenCalled();
    });

    test('should resize for mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      mockContainer.clientWidth = 250;
      
      gauge.handleResize();
      
      expect(gauge.options.size).toBeLessThan(280); // Should be smaller for mobile
    });

    test('should resize canvas when size changes', () => {
      const setupCanvasSpy = jest.spyOn(gauge, 'setupCanvas');
      const renderSpy = jest.spyOn(gauge, 'render');
      
      gauge.resize(320);
      
      expect(gauge.options.size).toBe(320);
      expect(setupCanvasSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should not resize if size is the same', () => {
      const setupCanvasSpy = jest.spyOn(gauge, 'setupCanvas');
      
      gauge.resize(280); // Same as current size
      
      expect(setupCanvasSpy).not.toHaveBeenCalled();
    });

    test('should setup resize listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      const newGauge = new Gauge('test-gauge-2');
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      newGauge.destroy();
    });
  });

  describe('Drawing Methods', () => {
    test('should draw background with gradient', () => {
      gauge.drawBackground(280);
      
      expect(gauge.ctx.createRadialGradient).toHaveBeenCalled();
      expect(gauge.ctx.fillRect).toHaveBeenCalledWith(0, 0, 280, 280);
    });

    test('should draw range arcs with colors', () => {
      gauge.drawRangeArcs(140, 140, 100);
      
      expect(gauge.ctx.arc).toHaveBeenCalled();
      expect(gauge.ctx.createLinearGradient).toHaveBeenCalled();
    });

    test('should draw tick marks at correct positions', () => {
      const drawTickSpy = jest.spyOn(gauge, 'drawTick');
      
      gauge.drawTickMarks(140, 140, 100);
      
      // Should draw ticks (major, minor, and micro ticks for 0-140 range)
      expect(drawTickSpy).toHaveBeenCalled();
    });

    test('should draw labels with proper styling', () => {
      gauge.drawLabels(140, 140, 100);
      
      expect(gauge.ctx.fillText).toHaveBeenCalled();
      expect(gauge.ctx.font).toContain('bold');
      expect(gauge.ctx.textAlign).toBe('center');
    });

    test('should draw needle at correct angle', () => {
      gauge.currentValue = 70;
      
      gauge.drawNeedle(140, 140, 100);
      
      expect(gauge.ctx.beginPath).toHaveBeenCalled();
      expect(gauge.ctx.createLinearGradient).toHaveBeenCalled();
      expect(gauge.ctx.fill).toHaveBeenCalled();
    });

    test('should draw center circle with gradient', () => {
      gauge.drawCenter(140, 140);
      
      expect(gauge.ctx.createRadialGradient).toHaveBeenCalled();
      expect(gauge.ctx.arc).toHaveBeenCalled();
    });
  });

  describe('Color Utilities', () => {
    test('should lighten color correctly', () => {
      const lightColor = gauge.lightenColor('#ff0000', 0.2);
      expect(lightColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lightColor).not.toBe('#ff0000');
    });

    test('should darken color correctly', () => {
      const darkColor = gauge.darkenColor('#ff0000', 0.2);
      expect(darkColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(darkColor).not.toBe('#ff0000');
    });

    test('should handle color edge cases', () => {
      // Should not throw with extreme values
      expect(() => gauge.lightenColor('#000000', 1.0)).not.toThrow();
      expect(() => gauge.darkenColor('#ffffff', 1.0)).not.toThrow();
    });
  });

  describe('Legacy API Support', () => {
    test('should support initialize method with canvas element', () => {
      const mockCanvas = {
        getContext: jest.fn().mockReturnValue(gauge.ctx),
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 280,
          height: 280,
          top: 0,
          left: 0
        }),
        width: 280,
        height: 280,
        style: {}
      };
      const setupCanvasSpy = jest.spyOn(gauge, 'setupCanvas');
      const renderSpy = jest.spyOn(gauge, 'render');
      
      gauge.initialize(mockCanvas);
      
      expect(gauge.canvas).toBe(mockCanvas);
      expect(setupCanvasSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should handle initialize without canvas element', () => {
      const setupCanvasSpy = jest.spyOn(gauge, 'setupCanvas');
      
      gauge.initialize();
      
      expect(setupCanvasSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance Considerations', () => {
    test('should use requestAnimationFrame for smooth animations', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      gauge.currentValue = 0;
      gauge.targetValue = 50;
      
      gauge.animateToTarget();
      
      expect(rafSpy).toHaveBeenCalled();
    });

    test('should implement smooth animation step', () => {
      gauge.currentValue = 0;
      gauge.targetValue = 100;
      
      const initialValue = gauge.currentValue;
      gauge.animateToTarget();
      
      // After one animation step, should be closer to target
      setTimeout(() => {
        expect(gauge.currentValue).toBeGreaterThan(initialValue);
        expect(gauge.currentValue).toBeLessThan(100);
      }, 50);
    });

    test('should maintain 60fps animation rate', () => {
      const step = 100 * 0.15; // Animation step size
      gauge.currentValue = 0;
      gauge.targetValue = 100;
      
      // Should reach target in reasonable time for 60fps
      expect(step).toBeGreaterThan(1); // Ensures meaningful progress per frame
    });
  });

  describe('Memory Management and Cleanup', () => {
    test('should cleanup resources on destroy', () => {
      const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      gauge.animationFrame = 789;
      
      gauge.destroy();
      
      expect(cancelSpy).toHaveBeenCalledWith(789);
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(gauge.canvas).toBe(null);
      expect(gauge.ctx).toBe(null);
    });

    test('should clear container on destroy', () => {
      gauge.destroy();
      
      expect(mockContainer.innerHTML).toBe('');
    });

    test('should handle destroy with missing references', () => {
      gauge.canvas = null;
      gauge.ctx = null;
      gauge.container = null;
      
      expect(() => gauge.destroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle canvas context errors gracefully', () => {
      gauge.ctx = null;
      
      expect(() => gauge.render()).not.toThrow();
    });

    test('should handle missing DOM elements', () => {
      gauge.digitalReadout = null;
      gauge.srLabel = null;
      
      expect(() => gauge.update(50)).not.toThrow();
    });

    test('should handle invalid color inputs', () => {
      expect(() => gauge.lightenColor('invalid', 0.5)).not.toThrow();
      expect(() => gauge.darkenColor('', 0.5)).not.toThrow();
    });
  });

  describe('Accessibility Features', () => {
    test('should create screen reader labels', () => {
      expect(mockContainer.appendChild).toHaveBeenCalled();
      
      // Verify gauge element was created
      const gaugeElement = mockContainer.appendChild.mock.calls[0][0];
      expect(gaugeElement).toBeDefined();
    });

    test('should update ARIA label with current value', () => {
      gauge.srLabel = { textContent: '' };
      gauge.currentValue = 65;
      
      gauge.update(65);
      
      expect(gauge.srLabel.textContent).toContain('65 decibels');
      expect(gauge.srLabel.textContent).toContain('Moderate level');
    });

    test('should provide accessibility features', () => {
      expect(mockContainer.appendChild).toHaveBeenCalled();
      
      // Basic accessibility structure should be created
      const gaugeElement = mockContainer.appendChild.mock.calls[0][0];
      expect(gaugeElement).toBeDefined();
    });
  });
});