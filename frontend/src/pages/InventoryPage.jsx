import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryList from '../components/inventory/InventoryList';
import AddInventoryForm from '../components/inventory/AddInventoryForm';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const InventoryPage = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/inventory', config);
      
      // Calculate stats from inventory data
      const items = response.data.data;
      const lowStock = items.filter(item => item.needsReorder).length;
      const totalItems = items.length;
      const avgMultiplier = items.reduce((sum, item) => {
        const currentMultiplier = item.seasonalMultipliers?.[item.currentSeason] || 1;
        return sum + currentMultiplier;
      }, 0) / (totalItems || 1);

      setStats({
        totalItems,
        lowStock,
        avgSeasonalMultiplier: avgMultiplier.toFixed(2)
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('http://localhost:5000/api/inventory/analyze-all', {}, config);
      
      // Refresh inventory list
      setRefreshKey(prev => prev + 1);
      
      alert(' AI analysis completed for all items!');
    } catch (err) {
      console.error(err);
      alert(' Failed to analyze inventory');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-cardBg">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-textLight hover:text-primary transition-colors"
            >
              ← Back to Dashboard
            </button>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                
              </div>
              <h1 className="text-xl font-bold text-textMain">
                Smart Inventory <span className="text-primary">Manager</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="text-sm text-textLight hover:text-danger font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <span className="text-xs font-semibold text-textLight bg-gray-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-textMain mb-1">
              {stats?.totalItems || 0}
            </h3>
            <p className="text-sm text-textLight">Inventory Items</p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-2xl text-danger" />
              </div>
              <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded-full">
                Alert
              </span>
            </div>
            <h3 className="text-3xl font-bold text-danger mb-1">
              {stats?.lowStock || 0}
            </h3>
            <p className="text-sm text-textLight">Need Reordering</p>
          </div>

          {/* Seasonal Impact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-2xl text-accent" />
              </div>
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                Winter
              </span>
            </div>
            <h3 className="text-3xl font-bold text-accent mb-1">
              {stats?.avgSeasonalMultiplier || '1.0'}x
            </h3>
            <p className="text-sm text-textLight">Avg Seasonal Demand</p>
          </div>

        </div>

        {/* Action Buttons Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FiPlus className="text-xl" />
                Add New Item
              </button>

              <button
                onClick={handleAnalyzeAll}
                disabled={analyzing || stats?.totalItems === 0}
                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="text-xl"></span>
                    Run AI Analysis
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="text-textLight hover:text-primary transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="text-lg" />
              <span className="text-sm font-medium">Refresh</span>
            </button>

          </div>
        </div>

        {/* AI Feature Info Banner */}
        <div className="bg-linear-to-r from-accent/10 via-primary/10 to-secondary/10 border border-accent/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl"></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-textMain mb-2">
                Smart Seasonal Reorder Points - AI Powered
              </h3>
              <p className="text-sm text-textLight leading-relaxed mb-3">
                Our AI automatically analyzes your inventory items and adjusts reorder points based on seasonal demand patterns. 
                For example: <strong>Cold Drinks</strong> reorder point increases in summer (2.0x) and decreases in winter (0.6x). 
                No manual adjustments needed!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white px-3 py-1 rounded-full text-textMain font-semibold">
                 Summer: High demand items
                </span>
                <span className="text-xs bg-white px-3 py-1 rounded-full text-textMain font-semibold">
                  Winter: Cold season items
                </span>
                <span className="text-xs bg-white px-3 py-1 rounded-full text-textMain font-semibold">
                  Spring/ Autumn: Transitional patterns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-textMain">Your Inventory</h2>
            <p className="text-textLight">Manage items with AI-powered seasonal insights</p>
          </div>
          <InventoryList key={refreshKey} />
        </div>

      </main>

      {/* Add Inventory Form Modal */}
      <AddInventoryForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

    </div>
  );
};

export default InventoryPage;