import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { BlogPost } from './components/BlogPost';
import { BlogManager } from './components/BlogManager';
import { Subscribers } from './components/Subscribers';
import { Button } from './components/ui/button';
import { login, verifyAuth } from './lib/api';
import { LogOut } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [currentPage, setCurrentPage] = useState<'writing' | 'subscribers'>('writing');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await verifyAuth();
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (password: string) => {
    try {
      const response = await login(password);
      localStorage.setItem('auth_token', response.token);
      setIsAuthenticated(true);
      setLoginError('');
    } catch (error: any) {
      setLoginError(error.message || 'Incorrect password');
      setTimeout(() => setLoginError(''), 5000);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <Routes>
      <Route path="/blog/:id" element={<BlogPost />} />

      <Route path="*" element={
        !isAuthenticated ? (
          <Login onLogin={handleLogin} error={loginError} />
        ) : (
          <div className="min-h-screen bg-background">
            <div className="border-b border-border/20 bg-background sticky top-0 z-50">
              <div className="max-w-[1400px] mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button
                      variant={currentPage === 'writing' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage('writing')}
                      className="h-8 px-3"
                    >
                      Writing
                    </Button>
                    <Button
                      variant={currentPage === 'subscribers' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage('subscribers')}
                      className="h-8 px-3"
                    >
                      Subscribers
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      setIsAuthenticated(false);
                    }}
                    className="h-8 px-3 text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 py-10">
              {currentPage === 'writing' && <BlogManager />}
              {currentPage === 'subscribers' && <Subscribers />}
            </div>
          </div>
        )
      } />
    </Routes>
  );
}

export default App;
