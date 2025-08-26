# Noise Detector - Real-Time Sound Level Monitor

A modern web application that measures environmental noise levels using your device's microphone. Built with Next.js, TypeScript, Tailwind CSS, and Supabase for real-time decibel measurement and data persistence.

## Features

### 🎯 Core Functionality
- **Real-time decibel measurement** using Web Audio API
- **Single and continuous monitoring modes**
- **Sound level categorization** (Whisper, Quiet, Normal, Loud, Very Loud, Dangerous)
- **Visual and audio alerts** when thresholds are exceeded
- **Customizable warning thresholds** (30-120 dB range)

### 👤 User Features
- **Guest mode** for quick measurements without account
- **User authentication** via Supabase Auth
- **Persistent measurement history** for logged-in users
- **Custom threshold settings** saved to user profile
- **Data export** to CSV format

### 📊 Data Visualization
- **Interactive charts** showing noise levels over time
- **Historical data filters** (last hour, day, week, month)
- **Recent measurements list** with timestamps
- **Sound level reference guide** with examples

### 💰 Monetization & Premium Features
- **Interstitial ads** shown every 10 measurements (non-intrusive timing)
- **Rewarded video ads** for 24-hour premium access
- **Premium benefits**: Extended measurement history (unlimited vs 20), advanced analytics
- **User-controlled ad experience** - users can choose when to watch rewarded ads

### 🔒 Privacy & Security
- **Local audio processing** - no audio data transmitted
- **HTTPS required** for microphone access
- **Row-level security** in database
- **Privacy-first design**

## Technical Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with react-chartjs-2
- **Audio Processing**: Web Audio API
- **Monetization**: Google AdSense (Interstitial & Rewarded Ads)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd noise-detector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and add your actual values:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual Supabase credentials from your project dashboard.

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL in `supabase-schema.sql` in the SQL Editor
   - Enable Row Level Security
   - Configure authentication settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables
- **profiles**: User profiles with custom settings
- **measurements**: Noise level measurements with timestamps

### Key Features
- Row Level Security (RLS) enabled
- Automatic profile creation on user signup
- Foreign key constraints for data integrity
- Indexes for optimal query performance

## Browser Compatibility

### Primary Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- **HTTPS required** for microphone access
- **Web Audio API support**
- **Modern JavaScript features** (ES2020+)

## Performance Optimizations

- **Client-side audio processing** to minimize latency
- **Efficient measurement storage** (100ms intervals for continuous mode)
- **Optimized chart rendering** with Chart.js
- **Lazy loading** for non-critical components
- **Package optimization** with Next.js experimental features

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in project settings
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## Privacy & Data Handling

- **Audio data never leaves your device**
- **Only decibel measurements are stored**
- **User data is encrypted and secured**
- **GDPR compliant data practices**
- **Full data export available**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OSHA noise exposure guidelines
- Web Audio API specification
- Chart.js community
- Supabase team

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include browser and device information

---

Built with ❤️ for hearing health awareness
