import { useEffect, useState } from 'react';
import { AuthPage } from './pages/Auth.js';
import { GroupsPage } from './pages/Groups.js';
import type { User } from './types/index.js';

type Page = 'dashboard' | 'groups';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('groups');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Yellow House</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-700">Welcome, {user.name}</p>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={() => setCurrentPage('groups')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'groups'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentPage === 'groups' && <GroupsPage />}
        {currentPage === 'dashboard' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h2>
            <p className="text-gray-600">Welcome to Yellow House!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
