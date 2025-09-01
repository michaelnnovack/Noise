/**
 * Jest Test Setup for Noise Detector App
 * Configures mocks for Web Audio API, Canvas, and browser APIs
 */

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.createMediaStreamSource = jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn()
    });
    this.createAnalyser = jest.fn().mockReturnValue({
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.3,
      minDecibels: -100,
      maxDecibels: -10,
      getByteTimeDomainData: jest.fn(),
      getByteFrequencyData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    });
    this.createGain = jest.fn().mockReturnValue({
      gain: { value: 1.0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    });
    this.resume = jest.fn().mockResolvedValue(undefined);
    this.close = jest.fn().mockResolvedValue(undefined);
    this.addEventListener = jest.fn();
  }
}

// Create a mock constructor function that can be used with jest.fn()
const MockAudioContextConstructor = jest.fn().mockImplementation(() => {
  const instance = new MockAudioContext();
  return instance;
});

global.AudioContext = MockAudioContextConstructor;

global.webkitAudioContext = MockAudioContextConstructor;

// Mock MediaDevices API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([
        {
          kind: 'audio',
          stop: jest.fn()
        }
      ])
    })
  }
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn().mockReturnValue(16.67) // Simulate 60fps timing
  }
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(callback => {
  return setTimeout(callback, 16); // ~60fps
});

global.cancelAnimationFrame = jest.fn().mockImplementation(id => {
  clearTimeout(id);
});

// Mock Canvas and CanvasRenderingContext2D
const mockContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
  scale: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fillRect: jest.fn(),
  createLinearGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn()
  }),
  createRadialGradient: jest.fn().mockReturnValue({
    addColorStop: jest.fn()
  }),
  // Mock properties
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt',
  font: '12px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low'
};

HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
  width: 280,
  height: 280,
  top: 0,
  left: 0,
  right: 280,
  bottom: 280
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock window properties
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768
});

// Mock DOM elements
document.getElementById = jest.fn().mockReturnValue({
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
  querySelector: jest.fn()
});

// Mock UserAgent for browser detection tests
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
});

// Utility functions for tests
global.createMockAudioData = (length = 1024, amplitude = 0.1) => {
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    // Generate sine wave with specified amplitude - higher amplitude = higher dB
    data[i] = Math.round(128 + amplitude * 127 * Math.sin(2 * Math.PI * i / length));
  }
  return data;
};

global.createMockFrequencyData = (length = 1024, baseLevel = 50) => {
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    // Generate decreasing frequency spectrum
    data[i] = Math.max(0, baseLevel - (i * 0.1) + Math.random() * 20);
  }
  return data;
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  performance.now.mockReturnValue(16.67);
  
  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  
  // Reset canvas context
  Object.keys(mockContext).forEach(key => {
    if (typeof mockContext[key] === 'function') {
      mockContext[key].mockClear();
    }
  });
  
  // Reset AudioContext constructor mock
  MockAudioContextConstructor.mockClear();
  MockAudioContextConstructor.mockImplementation(() => {
    const instance = new MockAudioContext();
    return instance;
  });
  
  // Ensure window properties are available  
  global.window = global.window || {};
  Object.defineProperty(global.window, 'AudioContext', {
    value: MockAudioContextConstructor,
    writable: true,
    configurable: true
  });
  Object.defineProperty(global.window, 'webkitAudioContext', {
    value: MockAudioContextConstructor,
    writable: true,
    configurable: true
  });
  
  // Ensure global AudioContext is also properly set
  global.AudioContext = MockAudioContextConstructor;
  global.webkitAudioContext = MockAudioContextConstructor;
});

// Console error/warn suppression for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Clean up after tests
afterAll(() => {
  global.console = originalConsole;
});