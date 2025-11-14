import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlitchText from './GlitchText';
import ShiningText from './ShiningText';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Navigate to landing page first
    navigate('/', { replace: true });
    // Clear user state after navigation
    logout();
  };

  const getRoleAccent = () => {
    if (!user) return '#00B8A9';
    if (user.role === 'admin') return '#00B8A9';
    if (user.role === 'collector') return '#FFB300';
    if (user.role === 'resident') return '#4CAF50';
    return '#00B8A9';
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleEmoji = () => {
    if (!user) return '👋';
    if (user.role === 'admin') return '👑';
    if (user.role === 'collector') return '🚛';
    if (user.role === 'resident') return '🏠';
    return '👋';
  };

  const getRoleTitle = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'collector') return 'Collector';
    if (user.role === 'resident') return 'Resident';
    return '';
  };

  const roleAccent = getRoleAccent();
  const isDashboard = location.pathname.includes('/dashboard');
  const greeting = getTimeBasedGreeting();
  const roleEmoji = getRoleEmoji();
  const roleTitle = getRoleTitle();

  return (
    <nav className="sticky top-0 z-50 mb-4">
      <div 
        className="px-6 py-4 relative"
        style={{
          backgroundColor: '#0F172A',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <GlitchText 
              text="🌱 EcoBin" 
              style={{ 
                color: roleAccent,
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }} 
            />
          </Link>
          
          <div className="flex items-center gap-4 flex-wrap">
            {user ? (
              <>
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${roleAccent}40`,
                    boxShadow: `0 0 15px ${roleAccent}20`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${roleAccent}80`;
                    e.currentTarget.style.boxShadow = `0 0 20px ${roleAccent}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${roleAccent}40`;
                    e.currentTarget.style.boxShadow = `0 0 15px ${roleAccent}20`;
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{roleEmoji}</span>
                  <div className="flex flex-col">
                    <span style={{ 
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      lineHeight: '1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {greeting}, {roleTitle}
                    </span>
                    <div style={{ 
                      fontSize: '0.95rem',
                      lineHeight: '1.2',
                      fontWeight: 'bold'
                    }}>
                      <ShiningText 
                        text={user.name} 
                        className="font-bold"
                        style={{ 
                          color: roleAccent,
                          textShadow: `0 0 10px ${roleAccent}60`
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isDashboard && (
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="px-4 py-2 text-sm md:text-base font-semibold rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#E2E8F0',
                      border: `1px solid ${roleAccent}`,
                      boxShadow: `0 0 10px ${roleAccent}40`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = roleAccent;
                      e.target.style.boxShadow = `0 0 15px ${roleAccent}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#E2E8F0';
                      e.target.style.boxShadow = `0 0 10px ${roleAccent}40`;
                    }}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm md:text-base font-semibold rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#E2E8F0',
                    border: `1px solid ${roleAccent}`,
                    boxShadow: `0 0 10px ${roleAccent}40`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = roleAccent;
                    e.target.style.boxShadow = `0 0 15px ${roleAccent}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#E2E8F0';
                    e.target.style.boxShadow = `0 0 10px ${roleAccent}40`;
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 text-sm md:text-base font-semibold rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#E2E8F0',
                    border: '1px solid #00B8A9',
                    boxShadow: '0 0 10px rgba(0, 184, 169, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#00B8A9';
                    e.target.style.boxShadow = '0 0 15px rgba(0, 184, 169, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#E2E8F0';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 184, 169, 0.4)';
                  }}
                >
                  Login as Admin
                </Link>
                <Link
                  to="/admin/register"
                  className="px-4 py-2 text-sm md:text-base font-semibold rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: '#00B8A9',
                    color: '#FFFFFF',
                    boxShadow: '0 0 15px rgba(0, 184, 169, 0.6)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 0 25px rgba(0, 184, 169, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 0 15px rgba(0, 184, 169, 0.6)';
                  }}
                >
                  Register as Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

