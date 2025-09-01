# Noise Detector Web App

A browser-based noise level detector that provides real-time decibel measurements with educational content and strategic monetization.

## 🎯 Project Overview

This application enables users to measure ambient noise levels using their device's microphone, providing:

- **Real-time decibel measurements** with visual gauge display
- **Educational content** about noise levels and health effects
- **Device calibration** for improved accuracy
- **Measurement history** and classification system
- **Mobile-responsive design** for all devices

## 🚀 Quick Start

### Prerequisites

- Modern web browser with microphone support
- Node.js 16+ (for development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/noise-detector-web-app.git
   cd noise-detector-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Allow microphone permissions when prompted

### Production Build

```bash
npm run build
npm start
```

## 📱 Browser Compatibility

- **Chrome** 66+
- **Firefox** 60+
- **Safari** 11.1+
- **Edge** 79+
- **Mobile browsers** with Web Audio API support

## 🏗️ Project Structure

```
noise-detector/
├── index.html              # Main application
├── privacy.html            # Privacy policy
├── terms.html             # Terms of service
├── css/
│   ├── styles.css         # Main styles
│   ├── gauge.css          # Gauge component styles
│   └── responsive.css     # Mobile responsiveness
├── js/
│   ├── main.js            # App initialization
│   ├── audio-processor.js # Web Audio API integration
│   ├── gauge.js           # Visual gauge component
│   ├── classifier.js      # Noise classification
│   ├── calibration.js     # Device calibration
│   ├── monetization.js    # Ad integration
│   └── analytics.js       # Tracking and analytics
├── assets/
│   ├── icons/             # App icons and favicons
│   └── sounds/            # Sample sounds for testing
├── data/
│   └── noise-levels.json  # Classification reference data
└── docs/
    └── CLAUDE.md          # Development guide
```

## 📊 Features

### Phase 1: Core Functionality ✅
- [x] Microphone access and audio processing
- [x] Real-time dB calculations
- [x] Analog gauge visualization
- [x] Basic timer and controls
- [x] Responsive design

### Phase 2: Enhanced UX (In Development)
- [ ] Noise level classification
- [ ] Health warnings and safety information
- [ ] Color-coded dB ranges
- [ ] Measurement history

### Phase 3: Calibration (Planned)
- [ ] Clap detection for calibration
- [ ] Device-specific calibration storage
- [ ] Calibration confidence indicators

### Phase 4: Monetization (Planned)
- [ ] Google AdSense integration
- [ ] Video ad-gated premium features
- [ ] Extended measurement modes
- [ ] Affiliate marketing integration

### Phase 5: Optimization (Planned)
- [ ] SEO optimization
- [ ] Performance improvements
- [ ] Social sharing features
- [ ] Analytics integration

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:watch

# Lint code
npm run lint
npm run lint:fix

# Validate HTML
npm run validate

# Run Lighthouse performance audit
npm run lighthouse

# Build for production
npm run build

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Vercel
npm run deploy:vercel
```

## 🔧 Configuration

### Audio Processing Settings

The app uses Web Audio API with these default settings:
- **FFT Size**: 2048
- **Smoothing**: 0.8
- **dB Range**: 25-120 dB
- **Update Rate**: 60 FPS

### Measurement Limits

- **Free Usage**: 30 seconds
- **Premium (Ad-gated)**: 5 minutes
- **Calibration**: Hand clap detection at ~65 dB reference

## 🎨 Design System

### Color Palette

- **Quiet** (25-50 dB): `#27ae60` (Green)
- **Moderate** (50-70 dB): `#f1c40f` (Yellow)
- **Loud** (70-85 dB): `#e67e22` (Orange)
- **Dangerous** (85+ dB): `#e74c3c` (Red)

### Typography

- **Primary Font**: System font stack
- **Headings**: Bold weights
- **Body**: Regular weight, 1.6 line height

## 📈 Performance Targets

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Bundle Size**: <200KB total
- **Lighthouse Score**: 90+ across all metrics

## 🔒 Privacy & Security

- **No data storage**: Audio processing happens locally
- **No tracking**: Minimal analytics for app improvement only
- **Secure**: HTTPS required for microphone access
- **Transparent**: Clear privacy policy and permissions

## 🤝 Contributing

This project follows a phased development approach. See `CLAUDE.md` for detailed implementation phases and requirements.

### Development Workflow

1. Create feature branch from `main`
2. Implement according to phase requirements
3. Test across target browsers
4. Submit PR with validation checklist

### Code Standards

- ES6+ JavaScript
- Mobile-first CSS
- Semantic HTML
- Accessibility compliance (WCAG 2.1 AA)

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with browser/device details
- Include console errors and steps to reproduce

---

**Built with ❤️ for noise awareness and hearing health**