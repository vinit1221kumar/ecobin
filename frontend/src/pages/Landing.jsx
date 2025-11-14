import { Link } from 'react-router-dom';
import GlitchText from '../components/GlitchText';
import TypeText from '../components/TypeText';
import ShiningText from '../components/ShiningText';
import SplitText from '../components/SplitText';
import BlurText from '../components/BlurText';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <NavigationBar />
      {/* Hero Section with Gradient */}
      <div className="py-20 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #00B8A9 100%)' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg" style={{ color: '#E2E8F0' }}>
            <GlitchText text="🌱 EcoBin" style={{ color: '#E2E8F0' }} />
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-semibold" style={{ color: '#E2E8F0' }}>
            <TypeText text="Smart E-Waste Management for a Greener Future" speed={80} style={{ color: '#E2E8F0' }} />
          </p>
          <p className="text-lg md:text-xl leading-relaxed mb-12" style={{ color: '#E2E8F0', opacity: 0.95 }}>
            <ShiningText text="EcoBin connects residents, collectors, and organizations to create a sustainable" style={{ color: '#E2E8F0' }} />
            <br />
            <span style={{ opacity: 0.9 }}>e-waste management ecosystem. Turn your electronic waste into green credits and</span>
            <br />
            <span style={{ opacity: 0.9 }}>contribute to environmental conservation.</span>
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/register" 
              className="px-8 py-3.5 text-lg font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
              style={{ 
                backgroundColor: '#4CAF50',
                boxShadow: '0 0 15px rgba(76, 175, 80, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 0 25px rgba(76, 175, 80, 1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.6)';
              }}
            >
              <span className="relative z-10">
                <SplitText text="Register" className="font-semibold" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3.5 text-lg font-semibold rounded-lg bg-transparent text-white border-2 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
              style={{ 
                borderColor: '#00B8A9',
                boxShadow: '0 0 10px rgba(0, 184, 169, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 184, 169, 0.1)';
                e.target.style.boxShadow = '0 0 20px rgba(0, 184, 169, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.boxShadow = '0 0 10px rgba(0, 184, 169, 0.4)';
              }}
            >
              <span className="relative z-10">
                <SplitText text="Login" className="font-semibold" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 px-4" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl mb-12 font-bold" style={{ color: '#E2E8F0' }}>
            <ShiningText text="Why E-Waste Management?" style={{ color: '#E2E8F0' }} />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B8A9]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <div className="text-5xl mb-4 relative z-10">🌍</div>
              <h3 className="mb-4 text-xl font-semibold relative z-10" style={{ color: '#E2E8F0' }}>
                <BlurText text="Environmental Protection" style={{ color: '#E2E8F0' }} blurAmount={2} />
              </h3>
              <p className="leading-relaxed relative z-10" style={{ color: '#94A3B8' }}>
                Proper e-waste disposal prevents toxic materials from contaminating 
                soil and water, protecting our ecosystem.
              </p>
            </div>
            <div className="p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B8A9]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <div className="text-5xl mb-4 relative z-10">♻️</div>
              <h3 className="mb-4 text-xl font-semibold relative z-10" style={{ color: '#E2E8F0' }}>
                <BlurText text="Resource Recovery" style={{ color: '#E2E8F0' }} blurAmount={2} />
              </h3>
              <p className="leading-relaxed relative z-10" style={{ color: '#94A3B8' }}>
                Valuable materials like gold, silver, and copper can be recovered 
                and reused, reducing the need for mining.
              </p>
            </div>
            <div className="p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B8A9]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <div className="text-5xl mb-4 relative z-10">💚</div>
              <h3 className="mb-4 text-xl font-semibold relative z-10" style={{ color: '#E2E8F0' }}>
                <BlurText text="Green Credits" style={{ color: '#E2E8F0' }} blurAmount={2} />
              </h3>
              <p className="leading-relaxed relative z-10" style={{ color: '#94A3B8' }}>
                Earn rewards for responsible disposal. Redeem credits with our 
                partner shops and NGOs.
              </p>
            </div>
            <div className="p-8 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B8A9]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <div className="text-5xl mb-4 relative z-10">📱</div>
              <h3 className="mb-4 text-xl font-semibold relative z-10" style={{ color: '#E2E8F0' }}>
                <BlurText text="Easy & Convenient" style={{ color: '#E2E8F0' }} blurAmount={2} />
              </h3>
              <p className="leading-relaxed relative z-10" style={{ color: '#94A3B8' }}>
                Schedule pickups from your home with just a few clicks. 
                Track your e-waste journey from collection to recycling.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Landing;

