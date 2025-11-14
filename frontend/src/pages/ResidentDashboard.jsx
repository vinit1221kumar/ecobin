import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pickupAPI, creditsAPI, partnersAPI, notificationAPI } from '../services/api';
import ShiningText from '../components/ShiningText';
import ElectricBorder from '../components/ElectricBorder';
import NavigationBar from '../components/NavigationBar';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [pickups, setPickups] = useState([]);
  const [credits, setCredits] = useState({ balance: 0, transactions: [] });
  const [partners, setPartners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pickup form state
  const [pickupForm, setPickupForm] = useState({
    category: '',
    weight: '',
    quantity: '',
    photo: null,
    preferredDate: '',
    preferredTime: '',
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'history') {
      loadPickups();
    } else if (activeTab === 'wallet') {
      loadCredits();
      loadPartners();
    } else if (activeTab === 'notifications') {
      loadNotifications();
    } else if (activeTab === 'profile') {
      // Profile data is loaded from user context
    }
    // Load unread count on mount and periodically
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const data = await pickupAPI.getMy();
      setPickups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCredits = async () => {
    try {
      setLoading(true);
      const data = await creditsAPI.getMy();
      setCredits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const data = await partnersAPI.getAll();
      setPartners(data);
    } catch (err) {
      console.error('Failed to load partners:', err);
      // Fallback to empty array if API fails
      setPartners([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getEcoLevel = (credits) => {
    if (credits >= 500) return { name: 'Green Warrior', color: '#4CAF50', emoji: '🌳' };
    if (credits >= 200) return { name: 'Eco Champion', color: '#00B8A9', emoji: '🌿' };
    if (credits >= 100) return { name: 'Eco Saver', color: '#FFD54F', emoji: '🌱' };
    if (credits >= 50) return { name: 'Eco Starter', color: '#FF9800', emoji: '🌍' };
    return { name: 'Eco Beginner', color: '#9E9E9E', emoji: '♻️' };
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await pickupAPI.create(pickupForm);
      alert('Pickup scheduled successfully!');
      setPickupForm({
        category: '',
        weight: '',
        quantity: '',
        photo: null,
        preferredDate: '',
        preferredTime: '',
        description: '',
      });
      if (activeTab === 'history') {
        loadPickups();
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (partnerId, creditsAmount) => {
    if (!window.confirm(`Redeem ${creditsAmount} credits for this eco-friendly product?`)) return;

    try {
      setLoading(true);
      await creditsAPI.redeem({ partnerId, credits: creditsAmount });
      alert('Credits redeemed successfully!');
      loadCredits();
    } catch (err) {
      setError(err.message || 'Failed to redeem credits');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'assigned') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'accepted' || statusLower === 'reached') return 'bg-green-100 text-green-800';
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <NavigationBar />

      <div className="flex overflow-x-auto max-w-7xl mx-auto shadow-md" style={{ backgroundColor: '#0F172A', borderBottom: '3px solid #4CAF50' }}>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'schedule'
              ? 'text-white border-b-[#81D4FA]'
              : 'text-[#94A3B8] hover:bg-[rgba(76,175,80,0.2)] hover:text-[#4CAF50]'
          }`}
          style={activeTab === 'schedule' ? { backgroundColor: '#4CAF50' } : {}}
          onClick={() => setActiveTab('schedule')}
        >
          ♻️ Request Pickup
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'history'
              ? 'text-white border-b-[#81D4FA]'
              : 'text-[#94A3B8] hover:bg-[rgba(76,175,80,0.2)] hover:text-[#4CAF50]'
          }`}
          style={activeTab === 'history' ? { backgroundColor: '#4CAF50' } : {}}
          onClick={() => setActiveTab('history')}
        >
          📦 My Pickups
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'wallet'
              ? 'text-white border-b-[#81D4FA]'
              : 'text-[#94A3B8] hover:bg-[rgba(76,175,80,0.2)] hover:text-[#4CAF50]'
          }`}
          style={activeTab === 'wallet' ? { backgroundColor: '#4CAF50' } : {}}
          onClick={() => setActiveTab('wallet')}
        >
          💰 My Credits
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold relative ${
            activeTab === 'notifications'
              ? 'text-white border-b-[#81D4FA]'
              : 'text-[#94A3B8] hover:bg-[rgba(76,175,80,0.2)] hover:text-[#4CAF50]'
          }`}
          style={activeTab === 'notifications' ? { backgroundColor: '#4CAF50' } : {}}
          onClick={() => setActiveTab('notifications')}
        >
          📢 Notifications
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'profile'
              ? 'text-white border-b-[#81D4FA]'
              : 'text-[#94A3B8] hover:bg-[rgba(76,175,80,0.2)] hover:text-[#4CAF50]'
          }`}
          style={activeTab === 'profile' ? { backgroundColor: '#4CAF50' } : {}}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 px-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
        )}

        {activeTab === 'schedule' && (
          <ElectricBorder>
            <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
              <style>{`
                input[type="number"]::placeholder,
                input[type="number"]::-webkit-input-placeholder,
                input[type="number"]::-moz-placeholder,
                input[type="number"]:-ms-input-placeholder {
                  color: #94A3B8 !important;
                  opacity: 1 !important;
                }
              `}</style>
              <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#4CAF50' }}>
                <ShiningText text="Schedule E-Waste Pickup" style={{ color: '#4CAF50' }} />
              </h2>
            <form onSubmit={handlePickupSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Category *</label>
                <select
                  value={pickupForm.category}
                  onChange={(e) => setPickupForm({ ...pickupForm, category: e.target.value })}
                  required
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ 
                    border: '2px solid #81D4FA', 
                    backgroundColor: '#1E293B',
                    color: '#E2E8F0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                >
                  <option value="" style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}>Select category</option>
                  <option value="mobile" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>Mobile</option>
                  <option value="laptop" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>Laptop</option>
                  <option value="tv" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>TV</option>
                  <option value="computer" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>Computer</option>
                  <option value="mixed" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>Mixed</option>
                  <option value="other" style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Approx Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pickupForm.weight}
                    onChange={(e) => setPickupForm({ ...pickupForm, weight: e.target.value })}
                    placeholder="e.g., 5.5"
                    className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                    style={{ 
                      border: '2px solid #81D4FA', 
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                    onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Quantity</label>
                  <input
                    type="number"
                    value={pickupForm.quantity}
                    onChange={(e) => setPickupForm({ ...pickupForm, quantity: e.target.value })}
                    placeholder="e.g., 2"
                    className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                    style={{ 
                      border: '2px solid #81D4FA', 
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                    onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPickupForm({ ...pickupForm, photo: e.target.files[0] })}
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ border: '2px solid #81D4FA', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Preferred Date *</label>
                  <input
                    type="date"
                    value={pickupForm.preferredDate}
                    onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                    style={{ border: '2px solid #81D4FA', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                    onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                    onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Preferred Time *</label>
                  <input
                    type="time"
                    value={pickupForm.preferredTime}
                    onChange={(e) => setPickupForm({ ...pickupForm, preferredTime: e.target.value })}
                    required
                    className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                    style={{ border: '2px solid #81D4FA', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                    onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                    onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Description</label>
                <textarea
                  value={pickupForm.description}
                  onChange={(e) => setPickupForm({ ...pickupForm, description: e.target.value })}
                  placeholder="Additional details about the e-waste..."
                  rows="3"
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none resize-y min-h-20"
                  style={{ border: '2px solid #81D4FA', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#81D4FA'}
                />
              </div>

              <button 
                type="submit" 
                className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#81D4FA'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Schedule Pickup'}
              </button>
            </form>
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'history' && (
          <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
            <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#4CAF50' }}>Pickup History</h2>
            {loading ? (
              <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
            ) : pickups.length === 0 ? (
              <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No pickups scheduled yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {pickups.map((pickup) => (
                  <div key={pickup._id} className="rounded-lg p-5 transition-all duration-300" style={{ backgroundColor: '#1E293B', border: '2px solid #334155' }}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold capitalize text-lg" style={{ color: '#81D4FA' }}>{pickup.category}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClasses(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Time:</strong> {pickup.preferredTime}</p>
                      {pickup.weight && <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Weight:</strong> {pickup.weight} kg</p>}
                      {pickup.quantity && <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Quantity:</strong> {pickup.quantity}</p>}
                      {pickup.creditsEarned && (
                        <p className="m-0 font-semibold" style={{ color: '#4CAF50' }}>
                          <strong>Credits Earned:</strong> {pickup.creditsEarned} 💚
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="flex flex-col gap-8">
            <ElectricBorder>
              <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
                <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#4CAF50' }}>Green Credit Wallet</h2>
              <div className="text-white p-8 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81D4FA 100%)' }}>
                <div className="text-center">
                  <span className="block text-base opacity-90 mb-2">Total Credits</span>
                  <span className="block text-5xl md:text-6xl font-bold">{credits.balance || 0} 💚</span>
                </div>
              </div>

              <h3 className="mt-6 mb-4 text-2xl font-semibold" style={{ color: '#81D4FA' }}>Transaction History</h3>
              {loading ? (
                <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
              ) : credits.transactions?.length === 0 ? (
                <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No transactions yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {credits.transactions?.map((tx, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#1E293B', border: '2px solid #334155' }}>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold capitalize" style={{ color: '#81D4FA' }}>{tx.type}</span>
                        <span className="text-sm" style={{ color: '#94A3B8' }}>
                          {new Date(tx.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-xl font-semibold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.amount} 💚
                      </span>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </ElectricBorder>

            <ElectricBorder>
              <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
                <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#4CAF50' }}>Redeem for Eco-Friendly Products</h2>
                <p className="mb-4" style={{ color: '#E2E8F0' }}>Redeem your green credits for sustainable, eco-friendly products from our trusted partners!</p>
                {partners.length === 0 ? (
                  <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No eco-friendly products available at the moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {partners.map((partner) => {
                      const isEcoStore = partner.name.includes('EcoStore');
                      const isGreenLife = partner.name.includes('GreenLife');
                      const partnerBadge = isEcoStore ? 'EcoStore' : isGreenLife ? 'GreenLife' : 'EcoBag';
                      const badgeColor = isEcoStore ? '#00B8A9' : isGreenLife ? '#4CAF50' : '#FF9800';
                      
                      return (
                        <div 
                          key={partner._id} 
                          className="flex flex-col p-6 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" 
                          style={{ 
                            backgroundColor: '#1E293B', 
                            border: `2px solid ${badgeColor}40`,
                            boxShadow: `0 0 10px ${badgeColor}20`
                          }}
                          onMouseEnter={(e) => { 
                            e.currentTarget.style.borderColor = `${badgeColor}80`;
                            e.currentTarget.style.boxShadow = `0 0 20px ${badgeColor}40`;
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.borderColor = `${badgeColor}40`;
                            e.currentTarget.style.boxShadow = `0 0 10px ${badgeColor}20`;
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                              style={{ 
                                backgroundColor: `${badgeColor}20`,
                                color: badgeColor,
                                border: `1px solid ${badgeColor}60`
                              }}
                            >
                              {partnerBadge}
                            </span>
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: badgeColor }}
                            >
                              {partner.creditsRequired} 💚
                            </span>
                          </div>
                          <h4 className="m-0 mb-2 text-lg font-semibold" style={{ color: '#81D4FA' }}>
                            {partner.name.replace(`${partnerBadge} - `, '')}
                          </h4>
                          <p className="m-0 mb-4 text-sm flex-grow" style={{ color: '#E2E8F0' }}>
                            {partner.description || 'Eco-friendly product redemption'}
                          </p>
                          <button
                            className="w-full px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            style={{ backgroundColor: '#4CAF50' }}
                            onMouseEnter={(e) => {
                              if (!e.target.disabled) {
                                e.target.style.backgroundColor = '#81D4FA';
                                e.target.style.boxShadow = `0 0 15px ${badgeColor}60`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#4CAF50';
                              e.target.style.boxShadow = 'none';
                            }}
                            onClick={() => handleRedeem(partner._id, partner.creditsRequired)}
                            disabled={credits.balance < partner.creditsRequired}
                          >
                            {credits.balance < partner.creditsRequired 
                              ? `Need ${partner.creditsRequired - credits.balance} more credits`
                              : `Redeem ${partner.creditsRequired} Credits`
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ElectricBorder>
          </div>
        )}

        {activeTab === 'notifications' && (
          <ElectricBorder>
            <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold" style={{ color: '#4CAF50' }}>
                  <ShiningText text="📢 Notifications" style={{ color: '#4CAF50' }} />
                </h2>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                    style={{ backgroundColor: '#4CAF50' }}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No notifications yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        !notification.isRead ? 'border-l-4' : ''
                      }`}
                      style={{
                        backgroundColor: notification.isRead ? '#1E293B' : '#0F172A',
                        borderLeftColor: !notification.isRead ? '#4CAF50' : 'transparent',
                        border: '1px solid #334155'
                      }}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="m-0 mb-1 font-semibold" style={{ color: '#81D4FA' }}>{notification.title}</h4>
                          <p className="m-0 text-sm" style={{ color: '#E2E8F0' }}>{notification.message}</p>
                          <p className="m-0 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="ml-4 w-2 h-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'profile' && (
          <ElectricBorder>
            <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #4CAF50' }}>
              <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#4CAF50' }}>
                <ShiningText text="👤 Resident Profile" style={{ color: '#4CAF50' }} />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#1E293B', border: '2px solid #4CAF50' }}>
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#81D4FA' }}>Personal Information</h3>
                  <div className="flex flex-col gap-3">
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Name:</strong> {user?.name}</p>
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Email:</strong> {user?.email}</p>
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Address:</strong> {user?.address || 'Not provided'}</p>
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Role:</strong> Resident</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#1E293B', border: '2px solid #FFD54F' }}>
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#FFD54F' }}>Eco-Level Badge</h3>
                  {(() => {
                    const ecoLevel = getEcoLevel(credits.balance || 0);
                    return (
                      <div className="text-center">
                        <div className="text-6xl mb-4">{ecoLevel.emoji}</div>
                        <h4 className="text-2xl font-bold mb-2" style={{ color: ecoLevel.color }}>
                          {ecoLevel.name}
                        </h4>
                        <p className="text-lg mb-4" style={{ color: '#E2E8F0' }}>
                          {credits.balance || 0} 💚 Credits
                        </p>
                        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
                          <p className="m-0 text-sm" style={{ color: '#94A3B8' }}>
                            {ecoLevel.name === 'Green Warrior' 
                              ? 'You are a true environmental champion! 🌳'
                              : ecoLevel.name === 'Eco Champion'
                              ? 'Keep up the great work! 🌿'
                              : ecoLevel.name === 'Eco Saver'
                              ? 'You\'re making a difference! 🌱'
                              : ecoLevel.name === 'Eco Starter'
                              ? 'Great start on your eco journey! 🌍'
                              : 'Welcome to the eco community! ♻️'
                            }
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-6 p-6 rounded-lg" style={{ backgroundColor: '#1E293B', border: '2px solid #00B8A9' }}>
                <h3 className="mb-4 text-xl font-bold" style={{ color: '#00B8A9' }}>Pickup Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold m-0" style={{ color: '#4CAF50' }}>{pickups.length}</p>
                    <p className="text-sm m-0 mt-1" style={{ color: '#94A3B8' }}>Total Pickups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold m-0" style={{ color: '#4CAF50' }}>
                      {pickups.filter(p => p.status === 'completed').length}
                    </p>
                    <p className="text-sm m-0 mt-1" style={{ color: '#94A3B8' }}>Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold m-0" style={{ color: '#4CAF50' }}>{credits.balance || 0}</p>
                    <p className="text-sm m-0 mt-1" style={{ color: '#94A3B8' }}>Total Credits</p>
                  </div>
                </div>
              </div>
            </div>
          </ElectricBorder>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;
