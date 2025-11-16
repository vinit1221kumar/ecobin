import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, notificationAPI, fileAPI } from '../services/api';
import ShiningText from '../components/ShiningText';
import FuzzyText from '../components/FuzzyText';
import ElectricBorder from '../components/ElectricBorder';
import NavigationBar from '../components/NavigationBar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState(null);
  const [topContributors, setTopContributors] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [assignForm, setAssignForm] = useState({ collectorId: '' });
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [partnerForm, setPartnerForm] = useState({ name: '', description: '', creditsRequired: '' });
  const [editingPartner, setEditingPartner] = useState(null);

  const [creditsForm, setCreditsForm] = useState({ credits: '', description: '', action: 'add' });
  const [selectedUserForCredits, setSelectedUserForCredits] = useState(null);
  
  // New forms
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'resident', address: '', phone: '' });
  const [settingsForm, setSettingsForm] = useState({ rewardRatePerKg: 1, eWasteCategories: [], pickupLimits: {}, regionCoverage: [] });

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats();
      loadTopContributors();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'pickups') {
      loadPickups();
      loadUsers(); // Load users to get collectors for assignment
    } else if (activeTab === 'partners') {
      loadPartners();
    } else if (activeTab === 'analytics') {
      loadStats();
    } else if (activeTab === 'rewards') {
      loadTopContributors();
      loadSettings();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPickups = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllPickups();
      setPickups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPartners();
      setPartners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTopContributors = async () => {
    try {
      const response = await adminAPI.getTopContributors(10);
      setTopContributors(response);
    } catch (err) {
      console.error('Failed to load top contributors:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response);
      setSettingsForm({
        rewardRatePerKg: response.rewardRatePerKg || 1,
        eWasteCategories: response.eWasteCategories || [],
        pickupLimits: response.pickupLimits || {},
        regionCoverage: response.regionCoverage || [],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.createUser(userForm);
      alert('User created successfully!');
      setUserForm({ name: '', email: '', password: '', role: 'resident', address: '', phone: '' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await adminAPI.deleteUser(userId);
      alert('User deleted successfully!');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePickupStatus = async (pickupId, status) => {
    try {
      setLoading(true);
      const updatedPickup = await adminAPI.updatePickupStatus(pickupId, { status });
      alert('Pickup status updated successfully!');
      
      // If resetting to pending, also clear the selected pickup to show updated state
      if (status === 'pending') {
        setSelectedPickup(null);
      } else if (selectedPickup && selectedPickup._id === pickupId) {
        // Update the selected pickup with new data
        setSelectedPickup(updatedPickup);
      }
      
      await loadPickups();
      
      // Reload stats if on overview tab
      if (activeTab === 'overview') {
        await loadStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.updateSettings(settingsForm);
      alert('Settings updated successfully!');
      await loadSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = async (userId, isActive) => {
    try {
      setLoading(true);
      await adminAPI.updateUser(userId, { isActive: !isActive });
      await loadUsers();
      if (activeTab === 'analytics') {
        await loadStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCollector = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;

    try {
      setLoading(true);
      await adminAPI.assignCollector(selectedPickup._id, assignForm);
      alert('Collector assigned successfully!');
      setAssignForm({ collectorId: '' });
      setSelectedPickup(null);
      await loadPickups();
      if (activeTab === 'analytics') {
        await loadStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignCollector = async () => {
    if (!selectedPickup) return;

    const confirmRemoval = window.confirm('Remove the assigned collector from this pickup?');
    if (!confirmRemoval) return;

    try {
      setLoading(true);
      await adminAPI.unassignCollector(selectedPickup._id);
      alert('Collector removed successfully!');
      setAssignForm({ collectorId: '' });
      setSelectedPickup(null);
      await loadPickups();
      if (activeTab === 'analytics') {
        await loadStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingPartner) {
        await adminAPI.updatePartner(editingPartner._id, partnerForm);
      } else {
        await adminAPI.createPartner(partnerForm);
      }
      alert(`Partner ${editingPartner ? 'updated' : 'created'} successfully!`);
      setPartnerForm({ name: '', description: '', creditsRequired: '' });
      setEditingPartner(null);
      loadPartners();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;

    try {
      setLoading(true);
      await adminAPI.deletePartner(id);
      loadPartners();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleAssignCredits = async (e) => {
    e.preventDefault();
    if (!selectedUserForCredits) return;

    const creditAmount = parseFloat(creditsForm.credits);
    
    // Validate credits are in multiples of 5
    if (creditAmount % 5 !== 0) {
      setError('Credits must be in multiples of 5');
      return;
    }

    // Check if deducting and user has enough credits
    if (creditsForm.action === 'deduct' && selectedUserForCredits.credits < creditAmount) {
      setError('User does not have enough credits to deduct');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminAPI.assignCredits(selectedUserForCredits._id, {
        credits: creditAmount,
        description: creditsForm.description,
        action: creditsForm.action,
      });
      alert(`Credits ${creditsForm.action === 'deduct' ? 'deducted' : 'assigned'} successfully!`);
      setCreditsForm({ credits: '', description: '', action: 'add' });
      setSelectedUserForCredits(null);
      await loadUsers();
      if (activeTab === 'analytics') {
        await loadStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const collectors = users.filter(u => u.role === 'collector');
  const residents = users.filter(u => u.role === 'resident');

  // Helper function to get accessible image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a presigned URL, return as is
    if (imageUrl.includes('?X-Amz-Algorithm')) {
      return imageUrl;
    }
    
    // If it's a MinIO direct URL, convert to proxy URL
    if (imageUrl.includes('/ecobin/') || imageUrl.includes('localhost:9000') || imageUrl.includes('minio')) {
      // Extract filename from URL
      let filename = imageUrl;
      if (imageUrl.includes('/ecobin/')) {
        filename = imageUrl.split('/ecobin/')[1];
      } else if (imageUrl.includes('/')) {
        filename = imageUrl.split('/').pop();
      }
      // Remove query parameters
      filename = filename.split('?')[0];
      // Use backend proxy endpoint
      return fileAPI.getFile(filename);
    }
    
    return imageUrl;
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

      <div className="flex overflow-x-auto max-w-7xl mx-auto shadow-lg" style={{ backgroundColor: '#0F172A', borderBottom: '4px solid #00B8A9' }}>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'overview'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'users'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'pickups'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('pickups')}
        >
          📦 Pickup Management
        </button>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'rewards'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('rewards')}
        >
          🏆 Reward System
        </button>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'partners'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('partners')}
        >
          Partner Management
        </button>
        <button
          className={`px-6 py-4 border-b-[4px] border-transparent transition-all duration-300 whitespace-nowrap text-base font-semibold ${
            activeTab === 'settings'
              ? 'text-white border-b-[#FFD54F] bg-[#00B8A9]/30'
              : 'text-teal-200 hover:bg-[#00B8A9]/40 hover:text-white'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 px-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <ElectricBorder>
              <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg" style={{ border: '2px solid #00B8A9' }}>
                <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                  <ShiningText text="📊 Overview Dashboard" style={{ color: '#00B8A9' }} />
                </h2>
                {loading ? (
                  <div className="text-center py-8 font-semibold" style={{ color: '#E2E8F0' }}>Loading analytics...</div>
                ) : stats ? (
                  <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #00B8A9 0%, #004D40 100%)' }}>
                        <div className="absolute top-0 right-0 text-9xl opacity-10">👥</div>
                        <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">Total Residents</h3>
                        <p className="text-6xl font-bold m-0 mb-2">{stats.totalResidents || 0}</p>
                      </div>
                      <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB300 100%)' }}>
                        <div className="absolute top-0 right-0 text-9xl opacity-10">🚛</div>
                        <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">Total Collectors</h3>
                        <p className="text-6xl font-bold m-0 mb-2">{stats.totalCollectors || 0}</p>
                      </div>
                      <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
                        <div className="absolute top-0 right-0 text-9xl opacity-10">📦</div>
                        <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">Total Pickups</h3>
                        <p className="text-6xl font-bold m-0 mb-2">{stats.totalPickups || 0}</p>
                      </div>
                      <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #00B8A9 0%, #004D40 100%)' }}>
                        <div className="absolute top-0 right-0 text-9xl opacity-10">♻️</div>
                        <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">E-Waste Collected</h3>
                        <p className="text-6xl font-bold m-0 mb-2">{stats.totalWaste || 0}</p>
                        <p className="text-xl opacity-90">kilograms</p>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                        <h4 className="text-xl font-bold mb-4" style={{ color: '#00B8A9' }}>Pickup Status Distribution</h4>
                        {stats.pickupStatus && (
                          <Doughnut
                            data={{
                              labels: Object.keys(stats.pickupStatus),
                              datasets: [{
                                data: Object.values(stats.pickupStatus),
                                backgroundColor: ['#FFD54F', '#00B8A9', '#4CAF50', '#FF9800', '#F44336', '#9E9E9E'],
                              }],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
                                legend: { position: 'bottom', labels: { color: '#E2E8F0' } },
                              },
                            }}
                          />
                        )}
                      </div>
                      <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                        <h4 className="text-xl font-bold mb-4" style={{ color: '#FFD54F' }}>Credits Summary</h4>
                        {stats.creditSummary && (
                          <Bar
                            data={{
                              labels: ['Earned', 'Redeemed', 'Net'],
                              datasets: [{
                                label: 'Credits',
                                data: [stats.creditSummary.earned, stats.creditSummary.redeemed, stats.creditSummary.net],
                                backgroundColor: ['#4CAF50', '#F44336', '#00B8A9'],
                              }],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
                                legend: { display: false },
                              },
                              scales: {
                                y: { ticks: { color: '#E2E8F0' }, grid: { color: '#334155' } },
                                x: { ticks: { color: '#E2E8F0' }, grid: { color: '#334155' } },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                        <h4 className="text-lg font-bold m-0 mb-2" style={{ color: '#00B8A9' }}>Total Rewards Distributed</h4>
                        <p className="text-4xl font-bold m-0" style={{ color: '#E2E8F0' }}>{stats.totalCredits || 0} 💚</p>
                      </div>
                      <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                        <h4 className="text-lg font-bold m-0 mb-2" style={{ color: '#FFD54F' }}>Completed Pickups</h4>
                        <p className="text-4xl font-bold m-0" style={{ color: '#E2E8F0' }}>{stats.completedPickups || 0}</p>
                      </div>
                      <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #4CAF50' }}>
                        <h4 className="text-lg font-bold m-0 mb-2" style={{ color: '#4CAF50' }}>Active Users</h4>
                        <p className="text-4xl font-bold m-0" style={{ color: '#E2E8F0' }}>{stats.activeUsers || 0}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl font-semibold" style={{ color: '#E2E8F0' }}>No analytics data available</p>
                  </div>
                )}
              </div>
            </ElectricBorder>
          </div>
        )}

        {activeTab === 'users' && (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg mb-8" style={{ border: '2px solid #00B8A9' }}>
              <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                <ShiningText text="User Management" style={{ color: '#00B8A9' }} />
              </h2>
            {selectedUserForCredits ? (
              <div>
                <button
                  className="px-6 py-2 text-base font-semibold rounded-lg bg-transparent transition-all duration-300 hover:text-white hover:border-transparent mb-4"
                  style={{ color: '#00B8A9', border: '2px solid #00B8A9' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#00B8A9'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#00B8A9'; }}
                  onClick={() => {
                    setSelectedUserForCredits(null);
                    setCreditsForm({ credits: '', description: '' });
                  }}
                >
                  ← Back to List
                </button>
                <form onSubmit={handleAssignCredits} className="flex flex-col gap-5">
                  <h3 className="mt-6 mb-4 text-2xl font-bold" style={{ color: '#00B8A9' }}>Manage Credits for {selectedUserForCredits.name}</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Action *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="action"
                          value="add"
                          checked={creditsForm.action === 'add'}
                          onChange={(e) => setCreditsForm({ ...creditsForm, action: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span style={{ color: '#4CAF50' }}>Add Credits (Reward)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="action"
                          value="deduct"
                          checked={creditsForm.action === 'deduct'}
                          onChange={(e) => setCreditsForm({ ...creditsForm, action: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span style={{ color: '#F44336' }}>Deduct Credits (Violation)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Credits (Green Points) - Must be in multiples of 5 *</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={creditsForm.credits}
                      onChange={(e) => setCreditsForm({ ...creditsForm, credits: e.target.value })}
                      required
                      placeholder="Enter credits amount (5, 10, 15, 20...)"
                      className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                      style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      onFocus={(e) => e.target.style.borderColor = '#004D40'}
                      onBlur={(e) => e.target.style.borderColor = '#00B8A9'}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Reason/Description *</label>
                    <textarea
                      value={creditsForm.description}
                      onChange={(e) => setCreditsForm({ ...creditsForm, description: e.target.value })}
                      rows="3"
                      required
                      placeholder={creditsForm.action === 'deduct' ? 'Explain the rule violation...' : 'Reason for reward...'}
                      className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none resize-y min-h-20"
                      style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      onFocus={(e) => e.target.style.borderColor = '#004D40'}
                      onBlur={(e) => e.target.style.borderColor = '#00B8A9'}
                    />
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #334155' }}>
                    <p className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>
                      Current Credits: <span style={{ color: '#FFD54F' }}>{selectedUserForCredits.credits || 0} 💚</span>
                    </p>
                    {creditsForm.credits && (
                      <p className="mt-2 text-sm" style={{ color: '#94A3B8' }}>
                        After {creditsForm.action}: <span style={{ color: creditsForm.action === 'add' ? '#4CAF50' : '#F44336' }}>
                          {creditsForm.action === 'add' 
                            ? (selectedUserForCredits.credits || 0) + parseInt(creditsForm.credits || 0)
                            : (selectedUserForCredits.credits || 0) - parseInt(creditsForm.credits || 0)
                          } 💚
                        </span>
                      </p>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                    style={{ backgroundColor: creditsForm.action === 'deduct' ? '#F44336' : '#00B8A9' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = creditsForm.action === 'deduct' ? '#D32F2F' : '#004D40'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = creditsForm.action === 'deduct' ? '#F44336' : '#00B8A9'}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : creditsForm.action === 'deduct' ? 'Deduct Credits' : 'Add Credits'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Create User Form */}
                <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                  <h3 className="mb-4 text-2xl font-bold" style={{ color: '#00B8A9' }}>Add New User</h3>
                  <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Name *</label>
                        <input
                          type="text"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          required
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Email *</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          required
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Password *</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          required
                          minLength={6}
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Role *</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                          required
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        >
                          <option value="resident">Resident</option>
                          <option value="collector">Collector</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {userForm.role !== 'admin' && (
                        <div className="flex flex-col gap-2">
                          <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Address</label>
                          <input
                            type="text"
                            value={userForm.address}
                            onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                            className="p-3 rounded-lg"
                            style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                          />
                        </div>
                      )}
                      {userForm.role === 'admin' && (
                        <div className="flex flex-col gap-2">
                          <label className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Phone</label>
                          <input
                            type="text"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                            className="p-3 rounded-lg"
                            style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300"
                      style={{ backgroundColor: '#00B8A9' }}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create User'}
                    </button>
                  </form>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-600">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-4">
                      <thead>
                        <tr style={{ backgroundColor: '#004D40', color: 'white' }}>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Name</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Email</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Role</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Credits</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Status</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id} className="transition-colors" style={{ backgroundColor: u._id % 2 === 0 ? '#0F172A' : '#1E293B' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 184, 169, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = u._id % 2 === 0 ? '#0F172A' : '#1E293B'}>
                            <td className="p-4 text-left border-b font-medium" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{u.name}</td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{u.email}</td>
                            <td className="p-4 text-left border-b capitalize font-semibold" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{u.role}</td>
                            <td className="p-4 text-left border-b font-semibold" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{u.credits || 0} 💚</td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155' }}>
                              <span className="font-semibold" style={{ color: u.isActive ? '#4CAF50' : '#F44336' }}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155' }}>
                              <div className="flex gap-2 flex-wrap">
                                {(u.role === 'resident' || u.role === 'collector') && (
                                  <button
                                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-md"
                                    style={{ backgroundColor: '#FFD54F', color: '#1E293B' }}
                                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#FFC107'; e.target.style.color = '#1E293B'; }}
                                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#FFD54F'; e.target.style.color = '#1E293B'; }}
                                    onClick={() => setSelectedUserForCredits(u)}
                                  >
                                    Assign Credits
                                  </button>
                                )}
                                {u.role !== 'admin' && (
                                  <>
                                    <button
                                      className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md"
                                      style={{ backgroundColor: '#00B8A9' }}
                                      onMouseEnter={(e) => e.target.style.backgroundColor = '#004D40'}
                                      onMouseLeave={(e) => e.target.style.backgroundColor = '#00B8A9'}
                                      onClick={() => handleUserToggle(u._id, u.isActive)}
                                    >
                                      {u.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                      className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md"
                                      style={{ backgroundColor: '#F44336' }}
                                      onMouseEnter={(e) => e.target.style.backgroundColor = '#D32F2F'}
                                      onMouseLeave={(e) => e.target.style.backgroundColor = '#F44336'}
                                      onClick={() => handleDeleteUser(u._id)}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                {u.role === 'admin' && (
                                  <span className="px-4 py-2 text-sm font-semibold rounded-lg" style={{ backgroundColor: '#334155', color: '#94A3B8' }}>
                                    Cannot Modify
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'pickups' && (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg mb-8" style={{ border: '2px solid #00B8A9' }}>
              <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                <ShiningText text="Pickup Management" style={{ color: '#00B8A9' }} />
              </h2>
            {selectedPickup ? (
              <div>
                <button
                  className="px-6 py-2 text-base font-semibold rounded-lg transition-all duration-300 mb-4"
                  style={{ backgroundColor: 'transparent', color: '#E2E8F0', border: '2px solid #E2E8F0' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#E2E8F0'; e.target.style.color = '#1E293B'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#E2E8F0'; }}
                  onClick={() => setSelectedPickup(null)}
                >
                  ← Back to List
                </button>
                <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                  <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                    <strong style={{ color: '#FFD54F' }}>Resident:</strong> <span style={{ color: '#E2E8F0' }}>{selectedPickup.resident?.name}</span>
                  </div>
                  <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                    <strong style={{ color: '#FFD54F' }}>Category:</strong> <span className="capitalize" style={{ color: '#E2E8F0' }}>{selectedPickup.category}</span>
                  </div>
                  <div className="py-3" style={{ borderBottom: '1px solid #334155' }}>
                    <strong style={{ color: '#FFD54F' }}>Status:</strong>{' '}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClasses(selectedPickup.status)}`}>
                      {selectedPickup.status}
                    </span>
                  </div>
                  <div className="py-3">
                    <strong style={{ color: '#FFD54F' }}>Assigned Collector:</strong>{' '}
                    <span style={{ color: '#E2E8F0' }}>{selectedPickup.collector?.name || 'Not assigned'}</span>
                  </div>
                  {(selectedPickup.photo || selectedPickup.proofPhoto) && (
                    <div className="py-3 flex flex-col gap-4">
                      <strong style={{ color: '#FFD54F' }}>Photos for Comparison:</strong>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Resident's Photo */}
                        {selectedPickup.photo && (
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-semibold" style={{ color: '#4CAF50' }}>
                              📸 Resident's Photo
                            </div>
                            <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
                              <img
                                src={getImageUrl(selectedPickup.photo)}
                                alt={`Resident's photo for ${selectedPickup.category}`}
                                className="w-full h-auto object-cover"
                                style={{ backgroundColor: '#0F172A', minHeight: '200px' }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
                                }}
                              />
                            </div>
                            <a
                              href={getImageUrl(selectedPickup.photo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline text-center"
                              style={{ color: '#4CAF50' }}
                            >
                              View full image
                            </a>
                          </div>
                        )}
                        
                        {/* Collector's Proof Photo */}
                        {selectedPickup.proofPhoto ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-semibold" style={{ color: '#FF9800' }}>
                              📸 Collector's Proof Photo
                            </div>
                            <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
                              <img
                                src={getImageUrl(selectedPickup.proofPhoto)}
                                alt={`Collector's proof photo for ${selectedPickup.category}`}
                                className="w-full h-auto object-cover"
                                style={{ backgroundColor: '#0F172A', minHeight: '200px' }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
                                }}
                              />
                            </div>
                            <a
                              href={getImageUrl(selectedPickup.proofPhoto)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline text-center"
                              style={{ color: '#FF9800' }}
                            >
                              View full image
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-center justify-center p-8 rounded-lg border" style={{ borderColor: '#334155', backgroundColor: '#0F172A', minHeight: '200px' }}>
                            <div className="text-4xl mb-2">📷</div>
                            <div className="text-sm" style={{ color: '#94A3B8' }}>
                              Collector's proof photo not uploaded yet
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleAssignCollector} className="flex flex-col gap-5">
                  <h3 className="mt-6 mb-4 text-2xl font-bold" style={{ color: '#E2E8F0' }}>
                    {selectedPickup.collector ? 'Manage Collector' : 'Assign Collector'}
                  </h3>
                  {(() => {
                    // Check if collector has accepted (status is 'accepted' or beyond)
                    const isCollectorAccepted = selectedPickup.status && ['accepted', 'reached', 'in_progress', 'completed'].includes(selectedPickup.status);
                    return (
                      <>
                        {selectedPickup.collector && (
                          <>
                            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                              <p style={{ color: '#FFD54F' }}>
                                <strong>Current Collector:</strong> {selectedPickup.collector.name}
                              </p>
                              {isCollectorAccepted ? (
                                <p className="text-sm mt-1" style={{ color: '#FF9800' }}>
                                  ⚠️ Collector has accepted this pickup. Cannot remove or change collector.
                                </p>
                              ) : (
                                <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                                  Select a new collector below to reassign this pickup
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="mb-4 self-start px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: isCollectorAccepted ? '#9E9E9E' : '#F44336' }}
                              onMouseEnter={(e) => !isCollectorAccepted && (e.target.style.backgroundColor = '#D32F2F')}
                              onMouseLeave={(e) => !isCollectorAccepted && (e.target.style.backgroundColor = '#F44336')}
                              onClick={handleUnassignCollector}
                              disabled={isCollectorAccepted || loading}
                            >
                              Remove Collector
                            </button>
                          </>
                        )}
                        <div className="flex flex-col gap-2">
                          <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>
                            {selectedPickup.collector ? 'New Collector *' : 'Collector *'}
                          </label>
                          <select
                            value={assignForm.collectorId}
                            onChange={(e) => setAssignForm({ collectorId: e.target.value })}
                            required
                            disabled={isCollectorAccepted || loading}
                            className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ border: '2px solid #00B8A9', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                            onFocus={(e) => !isCollectorAccepted && (e.target.style.borderColor = '#FFD54F')}
                            onBlur={(e) => !isCollectorAccepted && (e.target.style.borderColor = '#00B8A9')}
                          >
                            <option value="">Select collector</option>
                            {collectors.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name} ({c.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button 
                          type="submit" 
                          className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                          style={{ backgroundColor: '#00B8A9' }}
                          onMouseEnter={(e) => !isCollectorAccepted && !loading && (e.target.style.backgroundColor = '#FFD54F')}
                          onMouseLeave={(e) => !isCollectorAccepted && !loading && (e.target.style.backgroundColor = '#00B8A9')}
                          disabled={isCollectorAccepted || loading}
                        >
                          {loading ? 'Processing...' : selectedPickup.collector ? 'Reassign Collector' : 'Assign Collector'}
                        </button>
                        {isCollectorAccepted && (
                          <p className="text-sm mt-2" style={{ color: '#FF9800' }}>
                            ℹ️ This pickup has been accepted by the collector. To change the collector, please reset the status to 'pending' first.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </form>

                {/* Status Management */}
                <div className="mt-6 p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#FFD54F' }}>Update Pickup Status</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedPickup.status !== 'in_progress' && selectedPickup.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdatePickupStatus(selectedPickup._id, 'in_progress')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                        style={{ backgroundColor: '#FF9800' }}
                        disabled={loading}
                      >
                        Mark as In Progress
                      </button>
                    )}
                    {selectedPickup.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdatePickupStatus(selectedPickup._id, 'completed')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                        style={{ backgroundColor: '#4CAF50' }}
                        disabled={loading}
                      >
                        Mark as Completed
                      </button>
                    )}
                    {selectedPickup.status !== 'pending' && (
                      <button
                        onClick={() => handleUpdatePickupStatus(selectedPickup._id, 'pending')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300"
                        style={{ backgroundColor: '#9E9E9E' }}
                        disabled={loading}
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-4">
                      <thead>
                        <tr style={{ backgroundColor: '#004D40', color: 'white' }}>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Resident</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Photo</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Category</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Date</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Status</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Collector</th>
                          <th className="p-4 text-left border-b" style={{ borderColor: '#00B8A9' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickups.map((p, idx) => (
                          <tr key={p._id} className="transition-colors" style={{ backgroundColor: idx % 2 === 0 ? '#0F172A' : '#1E293B' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 184, 169, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#0F172A' : '#1E293B'}>
                            <td className="p-4 text-left border-b font-medium" style={{ borderColor: '#334155', color: '#E2E8F0' }}>
                              {p.resident?.name || (typeof p.resident === 'string' ? 'Loading...' : 'Unknown Resident')}
                            </td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155', color: '#E2E8F0' }}>
                              {p.photo ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
                                    <img
                                      src={getImageUrl(p.photo)}
                                      alt={`E-waste item ${p.category}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image';
                                      }}
                                    />
                                  </div>
                                  <a
                                    href={getImageUrl(p.photo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline"
                                    style={{ color: '#00B8A9' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFD54F'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#00B8A9'}
                                  >
                                    View
                                  </a>
                                </div>
                              ) : (
                                <span style={{ color: '#94A3B8' }}>No photo</span>
                              )}
                            </td>
                            <td className="p-4 text-left border-b capitalize" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{p.category}</td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{new Date(p.preferredDate).toLocaleDateString()}</td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155' }}>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClasses(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155', color: '#E2E8F0' }}>{p.collector?.name || 'Not assigned'}</td>
                            <td className="p-4 text-left border-b" style={{ borderColor: '#334155' }}>
                              <button
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md"
                                style={{ backgroundColor: '#00B8A9' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD54F'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#00B8A9'}
                                onClick={() => setSelectedPickup(p)}
                              >
                                {p.collector ? 'Manage Collector' : 'Assign Collector'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'partners' && (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg mb-8" style={{ border: '2px solid #00B8A9' }}>
              <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                <ShiningText text="Partner Management" style={{ color: '#00B8A9' }} />
              </h2>
            <form onSubmit={handlePartnerSubmit} className="flex flex-col gap-5">
              <h3 className="mt-6 mb-4 text-2xl font-bold" style={{ color: '#E2E8F0' }}>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h3>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Name *</label>
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  required
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ border: '2px solid #00B8A9', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD54F'}
                  onBlur={(e) => e.target.style.borderColor = '#00B8A9'}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Description</label>
                <textarea
                  value={partnerForm.description}
                  onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                  rows="3"
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none resize-y min-h-20"
                  style={{ border: '2px solid #00B8A9', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD54F'}
                  onBlur={(e) => e.target.style.borderColor = '#00B8A9'}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm md:text-base" style={{ color: '#E2E8F0' }}>Credits Required *</label>
                <input
                  type="number"
                  value={partnerForm.creditsRequired}
                  onChange={(e) => setPartnerForm({ ...partnerForm, creditsRequired: e.target.value })}
                  required
                  className="p-3 rounded-lg text-base font-sans transition-colors focus:outline-none"
                  style={{ border: '2px solid #00B8A9', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD54F'}
                  onBlur={(e) => e.target.style.borderColor = '#00B8A9'}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                  style={{ backgroundColor: '#00B8A9' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD54F'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00B8A9'}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingPartner ? 'Update Partner' : 'Create Partner'}
                </button>
                {editingPartner && (
                  <button
                    type="button"
                    className="px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300"
                    style={{ backgroundColor: 'transparent', color: '#E2E8F0', border: '2px solid #E2E8F0' }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#E2E8F0'; e.target.style.color = '#1E293B'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#E2E8F0'; }}
                    onClick={() => {
                      setEditingPartner(null);
                      setPartnerForm({ name: '', description: '', creditsRequired: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="mt-8 text-2xl font-bold" style={{ color: '#E2E8F0' }}>Existing Partners</h3>
            {loading ? (
              <div className="text-center py-8" style={{ color: '#E2E8F0' }}>Loading...</div>
            ) : (
              <div className="flex flex-col gap-4 mt-6">
                {partners.map((partner) => (
                  <div key={partner._id} className="flex justify-between items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                    <div className="flex flex-col">
                      <h4 className="m-0 mb-2 text-lg font-bold" style={{ color: '#FFD54F' }}>{partner.name}</h4>
                      <p className="m-1" style={{ color: '#E2E8F0' }}>{partner.description}</p>
                      <p className="m-1 font-semibold" style={{ color: '#E2E8F0' }}><strong>Credits Required:</strong> {partner.creditsRequired}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md"
                        style={{ backgroundColor: '#00B8A9' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD54F'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#00B8A9'}
                        onClick={() => {
                          setEditingPartner(partner);
                          setPartnerForm({
                            name: partner.name,
                            description: partner.description,
                            creditsRequired: partner.creditsRequired,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-md"
                        style={{ backgroundColor: '#DC2626' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#B91C1C'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#DC2626'}
                        onClick={() => handleDeletePartner(partner._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'rewards' && (
          <div className="flex flex-col gap-6">
            <ElectricBorder>
              <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg" style={{ border: '2px solid #00B8A9' }}>
                <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                  <ShiningText text="🏆 Reward System" style={{ color: '#00B8A9' }} />
                </h2>
                
                {/* Reward Rate Setting */}
                <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                  <h3 className="mb-4 text-2xl font-bold" style={{ color: '#FFD54F' }}>Set Reward Rate</h3>
                  {settings && (
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-lg" style={{ color: '#E2E8F0' }}>Credits per kg:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={settingsForm.rewardRatePerKg}
                        onChange={(e) => setSettingsForm({ ...settingsForm, rewardRatePerKg: parseFloat(e.target.value) || 0 })}
                        className="p-3 rounded-lg w-32"
                        style={{ border: '2px solid #FFD54F', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      />
                      <button
                        onClick={handleUpdateSettings}
                        className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300"
                        style={{ backgroundColor: '#FFD54F', color: '#1E293B' }}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Update Rate'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Top Contributors */}
                <div>
                  <h3 className="mb-4 text-2xl font-bold" style={{ color: '#00B8A9' }}>Top Contributors</h3>
                  {topContributors ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                        <h4 className="mb-4 text-xl font-bold" style={{ color: '#00B8A9' }}>Top by Credits</h4>
                        {topContributors.topByCredits && topContributors.topByCredits.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {topContributors.topByCredits.map((user, idx) => (
                              <div key={user._id} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold" style={{ color: '#FFD54F' }}>#{idx + 1}</span>
                                  <div>
                                    <p className="m-0 font-semibold" style={{ color: '#E2E8F0' }}>{user.name}</p>
                                    <p className="m-0 text-sm" style={{ color: '#94A3B8' }}>{user.email}</p>
                                  </div>
                                </div>
                                <span className="text-xl font-bold" style={{ color: '#4CAF50' }}>{user.credits || 0} 💚</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#94A3B8' }}>No contributors yet</p>
                        )}
                      </div>
                      <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                        <h4 className="mb-4 text-xl font-bold" style={{ color: '#FFD54F' }}>Top by Pickups</h4>
                        {topContributors.topByPickups && topContributors.topByPickups.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {topContributors.topByPickups.map((user, idx) => (
                              <div key={user._id || idx} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold" style={{ color: '#FFD54F' }}>#{idx + 1}</span>
                                  <div>
                                    <p className="m-0 font-semibold" style={{ color: '#E2E8F0' }}>{user.name}</p>
                                    <p className="m-0 text-sm" style={{ color: '#94A3B8' }}>{user.email}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="m-0 font-semibold" style={{ color: '#E2E8F0' }}>{user.pickupCount || 0} pickups</p>
                                  <p className="m-0 text-sm" style={{ color: '#94A3B8' }}>{user.totalWeight || 0} kg</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#94A3B8' }}>No pickups yet</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#94A3B8' }}>Loading top contributors...</p>
                  )}
                </div>
              </div>
            </ElectricBorder>
          </div>
        )}

        {activeTab === 'settings' && (
          <ElectricBorder>
            <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg mb-8" style={{ border: '2px solid #00B8A9' }}>
              <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                <ShiningText text="⚙️ Settings" style={{ color: '#00B8A9' }} />
              </h2>
              {settings ? (
                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-6">
                  {/* E-Waste Categories */}
                  <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                    <h3 className="mb-4 text-xl font-bold" style={{ color: '#00B8A9' }}>E-Waste Categories</h3>
                    <div className="flex flex-wrap gap-3">
                      {settingsForm.eWasteCategories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
                          <span style={{ color: '#E2E8F0' }}>{cat}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCats = settingsForm.eWasteCategories.filter((_, i) => i !== idx);
                              setSettingsForm({ ...settingsForm, eWasteCategories: newCats });
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new category"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const newCat = e.target.value.trim();
                            if (newCat && !settingsForm.eWasteCategories.includes(newCat)) {
                              setSettingsForm({ ...settingsForm, eWasteCategories: [...settingsForm.eWasteCategories, newCat] });
                              e.target.value = '';
                            }
                          }
                        }}
                        className="p-3 rounded-lg flex-1"
                        style={{ border: '2px solid #00B8A9', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      />
                    </div>
                  </div>

                  {/* Pickup Limits */}
                  <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                    <h3 className="mb-4 text-xl font-bold" style={{ color: '#FFD54F' }}>Pickup Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold" style={{ color: '#E2E8F0' }}>Max Pickups Per Day</label>
                        <input
                          type="number"
                          min="1"
                          value={settingsForm.pickupLimits.maxPickupsPerDay || 10}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            pickupLimits: { ...settingsForm.pickupLimits, maxPickupsPerDay: parseInt(e.target.value) || 10 }
                          })}
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #FFD54F', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold" style={{ color: '#E2E8F0' }}>Max Pickups Per Collector</label>
                        <input
                          type="number"
                          min="1"
                          value={settingsForm.pickupLimits.maxPickupsPerCollector || 5}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            pickupLimits: { ...settingsForm.pickupLimits, maxPickupsPerCollector: parseInt(e.target.value) || 5 }
                          })}
                          className="p-3 rounded-lg"
                          style={{ border: '2px solid #FFD54F', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Region Coverage */}
                  <div className="p-6 rounded-lg" style={{ backgroundColor: '#0F172A', border: '2px solid #4CAF50' }}>
                    <h3 className="mb-4 text-xl font-bold" style={{ color: '#4CAF50' }}>Region Coverage</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {settingsForm.regionCoverage.map((region, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
                          <span style={{ color: '#E2E8F0' }}>{region}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newRegions = settingsForm.regionCoverage.filter((_, i) => i !== idx);
                              setSettingsForm({ ...settingsForm, regionCoverage: newRegions });
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new region"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const newRegion = e.target.value.trim();
                            if (newRegion && !settingsForm.regionCoverage.includes(newRegion)) {
                              setSettingsForm({ ...settingsForm, regionCoverage: [...settingsForm.regionCoverage, newRegion] });
                              e.target.value = '';
                            }
                          }
                        }}
                        className="p-3 rounded-lg flex-1"
                        style={{ border: '2px solid #4CAF50', backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 text-base font-semibold rounded-lg text-white transition-all duration-300"
                    style={{ backgroundColor: '#00B8A9' }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              ) : (
                <p style={{ color: '#94A3B8' }}>Loading settings...</p>
              )}
            </div>
          </ElectricBorder>
        )}

        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            <ElectricBorder>
              <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg" style={{ border: '2px solid #00B8A9' }}>
                <h2 className="mb-6 text-3xl font-bold" style={{ color: '#00B8A9' }}>
                  <ShiningText text="📊 System Analytics" style={{ color: '#00B8A9' }} />
                </h2>
              {loading ? (
                <div className="text-center py-8 font-semibold" style={{ color: '#E2E8F0' }}>Loading analytics...</div>
              ) : stats ? (
                <>
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #00B8A9 0%, #004D40 100%)' }}>
                      <div className="absolute top-0 right-0 text-9xl opacity-10">♻️</div>
                      <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">E-Waste Collected</h3>
                      <p className="text-6xl font-bold m-0 mb-2">
                        {stats.totalWaste || 0}
                      </p>
                      <p className="text-xl opacity-90">kilograms</p>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-75">🌍 Environmental Impact</p>
                      </div>
                    </div>

                    <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
                      <div className="absolute top-0 right-0 text-9xl opacity-10">📦</div>
                      <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">Total Pickups</h3>
                      <p className="text-6xl font-bold m-0 mb-2">
                        {stats.totalPickups || 0}
                      </p>
                      <p className="text-xl opacity-90">
                        {stats.completedPickups || 0} completed
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-75">
                          {stats.totalPickups > 0 ? Math.round((stats.completedPickups / stats.totalPickups) * 100) : 0}% Success Rate
                        </p>
                      </div>
                    </div>

                    <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #FFD54F 0%, #FFA000 100%)' }}>
                      <div className="absolute top-0 right-0 text-9xl opacity-10">💚</div>
                      <h3 className="m-0 mb-2 text-sm opacity-80 font-semibold uppercase tracking-wide" style={{ color: '#1E293B' }}>Credits Distributed</h3>
                      <p className="text-6xl font-bold m-0 mb-2" style={{ color: '#1E293B' }}>
                        {stats.totalCredits || 0}
                      </p>
                      <p className="text-xl opacity-90" style={{ color: '#1E293B' }}>green points</p>
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(30, 41, 59, 0.2)' }}>
                        <p className="text-sm opacity-75" style={{ color: '#1E293B' }}>🎁 Rewards Program</p>
                      </div>
                    </div>

                    <div className="relative overflow-hidden text-white p-8 rounded-xl text-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)' }}>
                      <div className="absolute top-0 right-0 text-9xl opacity-10">👥</div>
                      <h3 className="m-0 mb-2 text-sm opacity-80 text-white font-semibold uppercase tracking-wide">Active Users</h3>
                      <p className="text-6xl font-bold m-0 mb-2">
                        {stats.activeUsers || 0}
                      </p>
                      <p className="text-xl opacity-90">registered</p>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-75">🚀 Growing Community</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #00B8A9' }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🎯</div>
                        <div>
                          <h4 className="text-lg font-bold m-0" style={{ color: '#00B8A9' }}>Completion Rate</h4>
                          <p className="text-sm m-0" style={{ color: '#94A3B8' }}>Pickup success metrics</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold" style={{ color: '#E2E8F0' }}>
                          {stats.totalPickups > 0 ? Math.round((stats.completedPickups / stats.totalPickups) * 100) : 0}%
                        </p>
                        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>
                          {stats.completedPickups || 0} of {stats.totalPickups || 0} pickups completed
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #FFD54F' }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">⚖️</div>
                        <div>
                          <h4 className="text-lg font-bold m-0" style={{ color: '#FFD54F' }}>Avg Waste/Pickup</h4>
                          <p className="text-sm m-0" style={{ color: '#94A3B8' }}>Per collection average</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold" style={{ color: '#E2E8F0' }}>
                          {stats.completedPickups > 0 ? (stats.totalWaste / stats.completedPickups).toFixed(1) : 0} kg
                        </p>
                        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>
                          Average per completed pickup
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl" style={{ backgroundColor: '#0F172A', border: '2px solid #4CAF50' }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🌟</div>
                        <div>
                          <h4 className="text-lg font-bold m-0" style={{ color: '#4CAF50' }}>Avg Credits/User</h4>
                          <p className="text-sm m-0" style={{ color: '#94A3B8' }}>User engagement level</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold" style={{ color: '#E2E8F0' }}>
                          {stats.activeUsers > 0 ? Math.round(stats.totalCredits / stats.activeUsers) : 0} 💚
                        </p>
                        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>
                          Credits per active user
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl font-semibold" style={{ color: '#E2E8F0' }}>No analytics data available</p>
                  <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>Start managing pickups to see statistics</p>
                </div>
              )}
              </div>
            </ElectricBorder>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
