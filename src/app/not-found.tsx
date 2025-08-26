import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <Link
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Noise Detector
        </Link>

        <div className="mt-6 text-sm text-gray-500">
          <p>Looking for noise measurement? Head to our homepage!</p>
        </div>
      </div>
    </div>
  );
}