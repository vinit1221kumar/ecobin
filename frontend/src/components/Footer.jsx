import { useState } from 'react';

const Footer = () => {
  const [suggestion, setSuggestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission (you can connect this to your backend)
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setSuggestion('');
      setName('');
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <footer className="mt-auto relative" style={{ backgroundColor: '#020617' }}>
      {/* Wave transition above footer */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden" style={{ transform: 'translateY(-100%)' }}>
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          <path 
            d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z" 
            fill="#0F172A"
          />
          <path 
            d="M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z" 
            fill="#00B8A9"
            opacity="0.2"
          />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10" style={{ borderTop: '1px solid rgba(0, 184, 169, 0.3)', boxShadow: '0 -2px 10px rgba(0, 184, 169, 0.2)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#E2E8F0' }}>Contact Me</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" style={{ color: '#4CAF50' }}>📧</span>
                <div>
                  <p className="font-semibold" style={{ color: '#E2E8F0' }}>Email</p>
                  <a 
                    href="mailto:contact@ecobin.com" 
                    className="transition-colors"
                    style={{ color: '#E2E8F0' }}
                    onMouseEnter={(e) => e.target.style.color = '#00B8A9'}
                    onMouseLeave={(e) => e.target.style.color = '#E2E8F0'}
                  >
                    contact@ecobin.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl" style={{ color: '#4CAF50' }}>📱</span>
                <div>
                  <p className="font-semibold" style={{ color: '#E2E8F0' }}>Phone</p>
                  <a 
                    href="tel:+918881795602" 
                    className="transition-colors"
                    style={{ color: '#E2E8F0' }}
                    onMouseEnter={(e) => e.target.style.color = '#00B8A9'}
                    onMouseLeave={(e) => e.target.style.color = '#E2E8F0'}
                  >
                    +91 8881795602
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl" style={{ color: '#4CAF50' }}>📍</span>
                <div>
                  <p className="font-semibold" style={{ color: '#E2E8F0' }}>Address</p>
                  <p style={{ color: '#E2E8F0' }}>
                    Lovely Professional University<br />
                    Jalandhar, Punjab, India
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl" style={{ color: '#4CAF50' }}>🌐</span>
                <div>
                  <p className="font-semibold" style={{ color: '#E2E8F0' }}>Social Media</p>
                  <div className="flex gap-4 mt-2">
                    <a 
                      href="https://www.linkedin.com/in/vinit-kumar-singh" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ color: '#E2E8F0' }}
                      onMouseEnter={(e) => e.target.style.color = '#00B8A9'}
                      onMouseLeave={(e) => e.target.style.color = '#E2E8F0'}
                      aria-label="LinkedIn"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href="https://vinitt.netlify.app" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ color: '#E2E8F0' }}
                      onMouseEnter={(e) => e.target.style.color = '#00B8A9'}
                      onMouseLeave={(e) => e.target.style.color = '#E2E8F0'}
                      aria-label="Portfolio"
                    >
                      Portfolio
                    </a>
                    <a 
                      href="https://github.com/vinit1221kumar" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ color: '#E2E8F0' }}
                      onMouseEnter={(e) => e.target.style.color = '#00B8A9'}
                      onMouseLeave={(e) => e.target.style.color = '#E2E8F0'}
                      aria-label="GitHub"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestion Form */}
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#E2E8F0' }}>Send a Suggestion</h3>
            {submitted ? (
              <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', border: '1px solid #4CAF50' }}>
                <p style={{ color: '#4CAF50' }}>✓ Thank you for your suggestion! We'll review it soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#E2E8F0'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00B8A9';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#E2E8F0'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00B8A9';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="suggestion" className="block text-sm font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                    Your Suggestion
                  </label>
                  <textarea
                    id="suggestion"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all resize-none"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#E2E8F0'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00B8A9';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="Share your ideas, feedback, or suggestions..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#00B8A9',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#009688')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#00B8A9')}
                >
                  {loading ? 'Sending...' : 'Send Suggestion'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid #1E293B', backgroundColor: '#020617' }}>
          <p style={{ color: '#94A3B8' }}>
            © {new Date().getFullYear()} EcoBin. All rights reserved. | Made with 💚 for a greener future
          </p>
          <div className="mt-4">
            <a 
              href="/test-jenkins"
              className="inline-block px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(0, 184, 169, 0.2)',
                border: '1px solid #00B8A9',
                color: '#00B8A9'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00B8A9';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 184, 169, 0.2)';
                e.target.style.color = '#00B8A9';
              }}
            >
              🔧 Test Jenkins
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

