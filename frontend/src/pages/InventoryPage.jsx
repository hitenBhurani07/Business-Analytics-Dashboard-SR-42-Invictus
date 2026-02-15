import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppNavbar from '../components/AppNavbar';
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
    <div className="min-h-screen bg-white">
      <AppNavbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 pt-24">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.totalItems || 0}
            </h3>
            <p className="text-sm text-slate-600">Inventory Items</p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-2xl text-red-600" />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Alert
              </span>
            </div>
            <h3 className="text-3xl font-bold text-red-600 mb-1">
              {stats?.lowStock || 0}
            </h3>
            <p className="text-sm text-slate-600">Need Reordering</p>
          </div>

          {/* Seasonal Impact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-2xl text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Winter
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.avgSeasonalMultiplier || 0}x
            </h3>
            <p className="text-sm text-slate-600">Avg Seasonal Demand</p>
          </div>

        </div>

        {/* Action Buttons Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
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
              className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="text-lg" />
              <span className="text-sm font-medium">Refresh</span>
            </button>

          </div>
        </div>

        {/* AI Feature Info Banner */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl"></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Smart Seasonal Reorder Points - AI Powered
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Our AI automatically analyzes your inventory items and adjusts reorder points based on seasonal demand patterns. 
                For example: <strong>Cold Drinks</strong> reorder point increases in summer (2.0x) and decreases in winter (0.6x). 
                No manual adjustments needed!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white px-3 py-1 rounded-full text-slate-900 font-semibold">
                 Summer: High demand items
                </span>
                <span className="text-xs bg-white px-3 py-1 rounded-full text-slate-900 font-semibold">
                  Winter: Cold season items
                </span>
                <span className="text-xs bg-white px-3 py-1 rounded-full text-slate-900 font-semibold">
                  Spring/ Autumn: Transitional patterns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Your Inventory</h2>
            <p className="text-slate-700">Manage items with AI-powered seasonal insights</p>
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
