import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiSun, FiCloud } from 'react-icons/fi';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/inventory', config);
      setInventory(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch inventory');
      setLoading(false);
    }
  };

  // Season icon helper
  const getSeasonIcon = (season) => {
    const icons = {
      spring: '',
      summer: '',
      autumn: '',
      winter: ''
    };
    return icons[season] || '';
  };

  // Stock status color
  const getStockStatusColor = (status) => {
    if (status === 'good') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-cardBg border border-gray-200 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4"></div>
        <h3 className="text-lg font-bold text-textMain mb-2">No Inventory Items Yet</h3>
        <p className="text-textLight">Add your first item to get started with smart inventory management!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inventory.map((item) => (
        <div
          key={item._id}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Item Info */}
            <div className="lg:col-span-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-textMain">{item.itemName}</h3>
                  <p className="text-sm text-textLight capitalize">{item.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStockStatusColor(item.stockStatus)}`}>
                  {item.stockStatus === 'good' ? '✓ Good' : item.stockStatus === 'medium' ? '⚠ Medium' : '🔴 Low'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-textLight">Current Stock:</span>
                  <span className="font-bold text-textMain">{item.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textLight">Daily Usage:</span>
                  <span className="font-semibold text-textMain">{item.dailyUsage} units/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textLight">Reorder Point:</span>
                  <span className="font-semibold text-primary">{item.reorderPoint} units</span>
                </div>
              </div>

              {item.needsReorder && (
                <div className="mt-4 bg-danger/10 border border-danger/30 rounded-lg p-3 flex items-center gap-2">
                  <FiAlertCircle className="text-danger shrink-0" />
                  <span className="text-sm text-danger font-semibold">Reorder Needed!</span>
                </div>
              )}
            </div>

            {/* Middle: Seasonal Multipliers */}
            <div className="lg:col-span-1 bg-cardBg rounded-lg p-4">
              <h4 className="text-sm font-bold text-textMain mb-3 flex items-center gap-2">
                <span></span>
                Seasonal Demand Pattern
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(item.seasonalMultipliers || {}).map(([season, multiplier]) => {
                  const isCurrentSeason = season === item.currentSeason;
                  const isTrending = multiplier > 1.2 ? 'up' : multiplier < 0.8 ? 'down' : 'stable';

                  // Smart highlighting logic with correct priority
                  // Smart highlighting logic - PRIORITY ORDER MATTERS!
                  let highlightColor = 'bg-white border-gray-200';

                  if (item.aiInsights?.demandPattern === 'all-year') {
                    // All-year items: ALL seasons BLUE
                    highlightColor = 'bg-blue-50 border-blue-300';
                  } else {
                    // Seasonal items: Peak/Low takes priority over current
                    const isPeakSeason = season === item.aiInsights?.peakSeason;
                    const isLowSeason = season === item.aiInsights?.lowSeason;

                    if (isPeakSeason && isCurrentSeason) {
                      // Peak + Current: GREEN with strong ring
                      highlightColor = 'bg-green-100 border-green-500 ring-4 ring-green-300';
                    } else if (isPeakSeason) {
                      // Peak only: GREEN
                      highlightColor = 'bg-green-100 border-green-400';
                    } else if (isLowSeason && isCurrentSeason) {
                      // Low + Current: RED with strong ring
                      highlightColor = 'bg-red-100 border-red-500 ring-4 ring-red-300';
                    } else if (isLowSeason) {
                      // Low only: RED  
                      highlightColor = 'bg-red-100 border-red-400';
                    } else if (isCurrentSeason) {
                      // Current only (neither peak nor low): BLUE with ring
                      highlightColor = 'bg-blue-50 border-blue-400 ring-2 ring-blue-300';
                    }
                  }

                  return (
                    <div
                      key={season}
                      className={`p-3 rounded-lg border transition-all ${highlightColor}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-textLight capitalize flex items-center gap-1">
                          {getSeasonIcon(season)} {season}
                          {isCurrentSeason && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">Now</span>}
                        </span>
                        {isTrending === 'up' && <FiTrendingUp className="text-success text-sm" />}
                        {isTrending === 'down' && <FiTrendingDown className="text-danger text-sm" />}
                      </div>
                      <p className="text-lg font-bold text-textMain">{multiplier}x</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: AI Insights */}
            {item.aiInsights && (
              <div className="lg:col-span-1 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
                <h4 className="text-sm font-bold text-accent mb-3 flex items-center gap-2">
                  <span></span>
                  AI Recommendations
                </h4>
                <p className="text-sm text-textMain leading-relaxed mb-3">
                  {item.aiInsights.recommendations}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-semibold ${item.aiInsights.demandPattern === 'high'
                    ? 'bg-success/20 text-success'
                    : item.aiInsights.demandPattern === 'low'
                      ? 'bg-danger/20 text-danger'
                      : item.aiInsights.demandPattern === 'all-year'
                        ? 'bg-info/20 text-info'
                        : 'bg-warning/20 text-warning'
                    }`}>
                    {item.aiInsights.demandPattern === 'high'
                      ? ` Peak: ${item.aiInsights.peakSeason}`
                      : item.aiInsights.demandPattern === 'low'
                        ? ` Low: ${item.aiInsights.lowSeason}`
                        : item.aiInsights.demandPattern === 'all-year'
                          ? ' All-year item'
                          : '↔ Medium demand'
                    }
                  </span>
                  <span className="text-textLight">
                    • Analyzed {new Date(item.aiInsights.lastAnalyzed).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;