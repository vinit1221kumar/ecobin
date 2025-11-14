import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pickupAPI, creditsAPI, partnersAPI, notificationAPI } from '../services/api';
import ShiningText from '../components/ShiningText';
import ElectricBorder from '../components/ElectricBorder';
import NavigationBar from '../components/NavigationBar';

const CollectorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pickups');
  const [pickups, setPickups] = useState([]);
  const [completedPickups, setCompletedPickups] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [credits, setCredits] = useState({ balance: 0, transactions: [] });
  const [partners, setPartners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: '',
    proofPhoto: null,
  });

  useEffect(() => {
    if (activeTab === 'pickups') {
      loadPickups();
    } else if (activeTab === 'history') {
      loadCompletedPickups();
    } else if (activeTab === 'wallet') {
      loadCredits();
      loadPartners();
    } else if (activeTab === 'notifications') {
      loadNotifications();
    } else if (activeTab === 'profile') {
      loadProfileStats();
    }
    // Load unread count on mount and periodically
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const data = await pickupAPI.getAssigned();
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
      setPartners([]);
    }
  };

  const loadCompletedPickups = async () => {
    try {
      setLoading(true);
      const data = await pickupAPI.getAssigned();
      setCompletedPickups(data.filter(p => p.status === 'completed'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const loadProfileStats = async () => {
    try {
      const data = await pickupAPI.getAssigned();
      const completed = data.filter(p => p.status === 'completed');
      const totalWeight = completed.reduce((sum, p) => sum + (p.weight || 0), 0);
      // Stats will be calculated in the component
    } catch (err) {
      console.error('Failed to load profile stats:', err);
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

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;

    setError('');
    setLoading(true);

    try {
      await pickupAPI.updateStatus(selectedPickup._id, statusForm);
      alert('Status updated successfully!');
      setSelectedPickup(null);
      setStatusForm({ status: '', notes: '', proofPhoto: null });
      loadPickups();
    } catch (err) {
      setError(err.message || 'Failed to update status');
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

      <div className="flex overflow-x-auto max-w-7xl mx-auto shadow-md" style={{ backgroundColor: '#0F172A', borderBottom: '3px solid #FF9800' }}>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'pickups'
              ? 'text-white border-b-[#FFB300]'
              : 'text-[#94A3B8] hover:bg-[rgba(255,152,0,0.2)] hover:text-[#FF9800]'
          }`}
          style={activeTab === 'pickups' ? { backgroundColor: '#FF9800' } : {}}
          onClick={() => setActiveTab('pickups')}
        >
          🗺️ Assigned Pickups
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'history'
              ? 'text-white border-b-[#FFB300]'
              : 'text-[#94A3B8] hover:bg-[rgba(255,152,0,0.2)] hover:text-[#FF9800]'
          }`}
          style={activeTab === 'history' ? { backgroundColor: '#FF9800' } : {}}
          onClick={() => setActiveTab('history')}
        >
          🕒 History
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold relative ${
            activeTab === 'notifications'
              ? 'text-white border-b-[#FFB300]'
              : 'text-[#94A3B8] hover:bg-[rgba(255,152,0,0.2)] hover:text-[#FF9800]'
          }`}
          style={activeTab === 'notifications' ? { backgroundColor: '#FF9800' } : {}}
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
              ? 'text-white border-b-[#FFB300]'
              : 'text-[#94A3B8] hover:bg-[rgba(255,152,0,0.2)] hover:text-[#FF9800]'
          }`}
          style={activeTab === 'profile' ? { backgroundColor: '#FF9800' } : {}}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`px-6 py-4 border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'wallet'
              ? 'text-white border-b-[#FFB300]'
              : 'text-[#94A3B8] hover:bg-[rgba(255,152,0,0.2)] hover:text-[#FF9800]'
          }`}
          style={activeTab === 'wallet' ? { backgroundColor: '#FF9800' } : {}}
          onClick={() => setActiveTab('wallet')}
        >
          Green Credits
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 px-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
        )}

        {selectedPickup ? (
          <div className="bg-[#1E293B] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
            <button
              className="px-6 py-2 text-base font-semibold rounded-lg bg-transparent transition-all duration-300 mb-4"
              style={{ color: '#FF9800', border: '2px solid #FF9800' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#FF9800'; e.target.style.color = 'white'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#FF9800'; }}
              onClick={() => setSelectedPickup(null)}
            >
              ← Back to List
            </button>
            <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#E2E8F0' }}>
              <ShiningText text="Pickup Details" style={{ color: '#E2E8F0' }} />
            </h2>
            <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#0F172A', border: '2px solid #FF9800' }}>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Resident:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.resident?.name}</span>
              </div>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Address:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.resident?.address}</span>
              </div>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Category:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.category}</span>
              </div>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Pickup Date:</strong> <span style={{ color: '#E2E8F0' }}>{new Date(selectedPickup.preferredDate).toLocaleDateString()}</span>
              </div>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Pickup Time:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.preferredTime}</span>
              </div>
              <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                <strong style={{ color: '#FFB300' }}>Status:</strong>{' '}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClasses(selectedPickup.status)}`}>
                  {selectedPickup.status}
                </span>
              </div>
              {selectedPickup.description && (
                <div className="py-3">
                  <strong style={{ color: '#FFB300' }}>Description:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.description}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleStatusUpdate} className="flex flex-col gap-5">
              <h3 className="mt-6 mb-4 text-2xl font-semibold" style={{ color: '#E2E8F0' }}>Update Status</h3>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Status *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  required
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ border: '2px solid #FF9800', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB300'}
                  onBlur={(e) => e.target.style.borderColor = '#FF9800'}
                >
                  <option value="">Select status</option>
                  <option value="accepted">Accepted</option>
                  <option value="reached">Reached</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Upload Proof Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStatusForm({ ...statusForm, proofPhoto: e.target.files[0] })}
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ border: '2px solid #FF9800', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB300'}
                  onBlur={(e) => e.target.style.borderColor = '#FF9800'}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Notes</label>
                <textarea
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="Add any notes about the pickup..."
                  rows="3"
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none resize-y min-h-20"
                  style={{ border: '2px solid #FF9800', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFB300'}
                  onBlur={(e) => e.target.style.borderColor = '#FF9800'}
                />
              </div>

              <button 
                type="submit" 
                className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                style={{ backgroundColor: '#FF9800' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F57C00'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FF9800'}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        ) : activeTab === 'pickups' ? (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
              <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#E2E8F0' }}>
                <ShiningText text="Assigned Pickups" style={{ color: '#E2E8F0' }} />
              </h2>
            {loading ? (
              <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
            ) : pickups.length === 0 ? (
              <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No pickups assigned yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {pickups.map((pickup) => (
                  <div
                    key={pickup._id}
                    className="rounded-lg p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ backgroundColor: '#0F172A', border: '2px solid #334155' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.2)'; e.currentTarget.style.borderColor = '#FF9800'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0F172A'; e.currentTarget.style.borderColor = '#334155'; }}
                    onClick={() => setSelectedPickup(pickup)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold capitalize text-lg" style={{ color: '#FFB300' }}>{pickup.category}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClasses(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Resident:</strong> {pickup.resident?.name}</p>
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Address:</strong> {pickup.resident?.address}</p>
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                      <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Time:</strong> {pickup.preferredTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </ElectricBorder>
        ) : activeTab === 'wallet' ? (
          <div className="flex flex-col gap-8">
            <ElectricBorder>
              <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
                <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#FF9800' }}>Green Credit Wallet</h2>
                <div className="text-white p-8 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB300 100%)' }}>
                  <div className="text-center">
                    <span className="block text-base opacity-90 mb-2">Total Credits</span>
                    <span className="block text-5xl md:text-6xl font-bold">{credits.balance || 0} 💚</span>
                  </div>
                </div>

                <h3 className="mt-6 mb-4 text-2xl font-semibold" style={{ color: '#FFB300' }}>Transaction History</h3>
                {loading ? (
                  <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
                ) : credits.transactions?.length === 0 ? (
                  <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No transactions yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {credits.transactions?.map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#1E293B', border: '2px solid #334155' }}>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold capitalize" style={{ color: '#FFB300' }}>{tx.type}</span>
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
              <div className="bg-[#0F172A] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
                <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#FF9800' }}>Redeem for Eco-Friendly Products</h2>
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
                          <h4 className="m-0 mb-2 text-lg font-semibold" style={{ color: '#FFB300' }}>
                            {partner.name.replace(`${partnerBadge} - `, '')}
                          </h4>
                          <p className="m-0 mb-4 text-sm flex-grow" style={{ color: '#E2E8F0' }}>
                            {partner.description || 'Eco-friendly product redemption'}
                          </p>
                          <button
                            className="w-full px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            style={{ backgroundColor: '#FF9800' }}
                            onMouseEnter={(e) => {
                              if (!e.target.disabled) {
                                e.target.style.backgroundColor = '#FFB300';
                                e.target.style.boxShadow = `0 0 15px ${badgeColor}60`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#FF9800';
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
        ) : activeTab === 'history' ? (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
              <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#E2E8F0' }}>
                <ShiningText text="🕒 Completed Pickups History" style={{ color: '#E2E8F0' }} />
              </h2>
              {loading ? (
                <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
              ) : completedPickups.length === 0 ? (
                <p className="text-center py-8 italic" style={{ color: '#94A3B8' }}>No completed pickups yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {completedPickups.map((pickup) => (
                    <div
                      key={pickup._id}
                      className="rounded-lg p-5 transition-all duration-300"
                      style={{ backgroundColor: '#0F172A', border: '2px solid #334155' }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold capitalize text-lg" style={{ color: '#FFB300' }}>{pickup.category}</span>
                        <span className="text-sm" style={{ color: '#94A3B8' }}>
                          {new Date(pickup.updatedAt || pickup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Resident:</strong> {pickup.resident?.name}</p>
                        <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Weight:</strong> {pickup.weight || 'N/A'} kg</p>
                        {pickup.creditsEarned > 0 && (
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
          </ElectricBorder>
        ) : activeTab === 'notifications' ? (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold" style={{ color: '#E2E8F0' }}>
                  <ShiningText text="📢 Notifications" style={{ color: '#E2E8F0' }} />
                </h2>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                    style={{ backgroundColor: '#00B8A9' }}
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
                        backgroundColor: notification.isRead ? '#0F172A' : '#1E293B',
                        borderLeftColor: !notification.isRead ? '#FF9800' : 'transparent',
                        border: '1px solid #334155'
                      }}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="m-0 mb-1 font-semibold" style={{ color: '#FFB300' }}>{notification.title}</h4>
                          <p className="m-0 text-sm" style={{ color: '#E2E8F0' }}>{notification.message}</p>
                          <p className="m-0 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="ml-4 w-2 h-2 rounded-full bg-orange-500"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ElectricBorder>
        ) : activeTab === 'profile' ? (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-md mb-8" style={{ border: '2px solid #FF9800' }}>
              <h2 className="mb-6 text-3xl font-semibold" style={{ color: '#E2E8F0' }}>
                <ShiningText text="👤 Collector Profile" style={{ color: '#E2E8F0' }} />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #FF9800' }}>
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#FFB300' }}>Personal Information</h3>
                  <div className="flex flex-col gap-3">
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Name:</strong> {user?.name}</p>
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Email:</strong> {user?.email}</p>
                    <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Role:</strong> Collector</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #4CAF50' }}>
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#4CAF50' }}>Performance Stats</h3>
                  {(() => {
                    const allPickups = pickups.length > 0 ? pickups : completedPickups;
                    const completed = allPickups.filter(p => p.status === 'completed');
                    const totalPickups = completed.length;
                    const totalWeight = completed.reduce((sum, p) => sum + (p.weight || 0), 0);
                    return (
                      <div className="flex flex-col gap-3">
                        <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Total Pickups:</strong> {totalPickups}</p>
                        <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Total Weight Collected:</strong> {totalWeight.toFixed(1)} kg</p>
                        <p className="m-0" style={{ color: '#E2E8F0' }}><strong>Credits Earned:</strong> {credits.balance || 0} 💚</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </ElectricBorder>
        ) : null}
      </div>
    </div>
  );
};

export default CollectorDashboard;
