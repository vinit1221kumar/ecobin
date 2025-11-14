import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ElectricBorder from '../components/ElectricBorder';
import GlitchText from '../components/GlitchText';
import DecryptedText from '../components/DecryptedText';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'resident',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.address) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const user = await register(formData);
      
      // Redirect based on role (admin should use dedicated admin register page)
      if (user.role === 'collector') {
        navigate('/collector/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
              <DecryptedText text="Register" style={{ color: '#00E5FF' }} speed={100} />
            </h2>
            <p className="text-sm md:text-base" style={{ color: '#94A3B8' }}>Create your account to start managing e-waste</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password (min 6 characters)"
                minLength={6}
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="address" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter your complete address"
                rows="3"
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none resize-y min-h-20"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                style={{ backgroundColor: '#0F172A', border: '2px solid #334155', color: '#E2E8F0' }}
                onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              >
                <option value="resident" style={{ backgroundColor: '#0F172A', color: '#E2E8F0' }}>Resident</option>
                <option value="collector" style={{ backgroundColor: '#0F172A', color: '#E2E8F0' }}>Collector</option>
              </select>
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="text-center mt-6" style={{ color: '#94A3B8' }}>
            <p>
              Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: '#4CAF50' }}>Login here</Link>
            </p>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
};

export default Register;

