export default function Forbidden({ message, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
        <h1 className="text-lg font-medium mb-2">403 — Forbidden</h1>
        <p className="text-sm text-gray-600 mb-6">
          {message ?? "You do not have access to this resource."}
        </p>
        <div className="flex justify-center gap-3">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 text-sm"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
