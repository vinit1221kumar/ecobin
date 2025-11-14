import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ElectricBorder from '../components/ElectricBorder';
import GlitchText from '../components/GlitchText';
import BlurText from '../components/BlurText';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role (admin should use dedicated admin login page)
      if (user.role === 'collector') {
        navigate('/collector/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={{ backgroundColor: '#0F172A' }}>
      <ElectricBorder className="w-full max-w-md" color="blue">
        <div className="rounded-lg p-10" style={{ backgroundColor: '#1E293B', border: '2px solid #334155' }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl mb-2" style={{ color: '#4CAF50' }}>
              <GlitchText text="🌱 EcoBin" style={{ color: '#4CAF50' }} />
            </h1>
            <h2 className="text-3xl md:text-4xl mb-2" style={{ color: '#00E5FF' }}>
              <BlurText text="Login" style={{ color: '#00E5FF' }} blurAmount={3} />
            </h2>
            <p className="text-sm md:text-base" style={{ color: '#94A3B8' }}>Welcome back! Please login to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <button 
              type="submit" 
              className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
              style={{ backgroundColor: '#4CAF50', boxShadow: '0 0 15px rgba(76, 175, 80, 0.6)' }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 0 25px rgba(76, 175, 80, 1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.6)';
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-6" style={{ color: '#94A3B8' }}>
            <p>
              Don't have an account? <Link to="/register" className="font-semibold hover:underline" style={{ color: '#4CAF50' }}>Register here</Link>
            </p>
            <p className="mt-2">
              <Link to="/" className="font-semibold hover:underline text-sm" style={{ color: '#4CAF50' }}>Back to Home</Link>
            </p>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
};

export default Login;

