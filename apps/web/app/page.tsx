export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Cherut
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Master Your Life System
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
