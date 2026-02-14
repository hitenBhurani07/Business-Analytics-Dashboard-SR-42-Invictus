const Inventory = require('../models/Inventory');
const User = require('../models/User');
const aiService = require('../services/aiService');

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private
exports.addInventoryItem = async (req, res) => {
  try {
    const { itemName, quantity, dailyUsage, costPrice, sellingPrice, category } = req.body;
    const ownerId = req.user.id; // From auth middleware

    // Get user's business type
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate base reorder point (7 days of usage as default)
    const baseReorderPoint = Math.max(Math.ceil(dailyUsage * 7), 10);

    // Get initial AI analysis immediately
    const initialAnalysis = await aiService.analyzeSeasonalDemand(
      user.businessType,
      itemName,
      category || 'general',
      quantity,
      dailyUsage
    );

    // Create inventory item with initial AI insights
    const inventoryItem = await Inventory.create({
      ownerId,
      itemName,
      quantity,
      dailyUsage: dailyUsage || 0,
      costPrice,
      sellingPrice,
      category: category || 'general',
      baseReorderPoint,
      currentSeason: aiService.getCurrentSeason(),
      seasonalMultipliers: initialAnalysis.success ? initialAnalysis.data.seasonalMultipliers : { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
      aiInsights: initialAnalysis.success ? {
        lastAnalyzed: new Date(),
        recommendations: initialAnalysis.data.recommendations,
        demandPattern: initialAnalysis.data.demandPattern,
        peakSeason: initialAnalysis.data.peakSeason,
        lowSeason: initialAnalysis.data.lowSeason,
      } : {
        lastAnalyzed: new Date(),
        recommendations: 'Analyzing...',
        demandPattern: 'medium',
        peakSeason: 'spring',
        lowSeason: 'winter',
      },
    });

    // Calculate and update reorder point based on AI analysis
    if (initialAnalysis.success) {
      const currentSeason = aiService.getCurrentSeason();
      const currentMultiplier = initialAnalysis.data.seasonalMultipliers[currentSeason];
      const newReorderPoint = aiService.calculateReorderPoint(
        baseReorderPoint,
        currentMultiplier,
        dailyUsage
      );
      inventoryItem.reorderPoint = newReorderPoint;
      await inventoryItem.save();
    }

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully with AI analysis!',
      data: inventoryItem,
    });
  } catch (error) {
    console.error('Add Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add inventory item',
      error: error.message,
    });
  }
};

// @desc    Get all inventory items for a user
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const inventoryItems = await Inventory.find({ ownerId }).sort({ createdAt: -1 });

    // Check which items need reordering
    const itemsWithStatus = inventoryItems.map(item => ({
      ...item.toObject(),
      needsReorder: item.quantity <= item.reorderPoint,
      stockStatus: item.quantity <= item.reorderPoint 
        ? 'low' 
        : item.quantity <= item.reorderPoint * 1.5 
        ? 'medium' 
        : 'good',
    }));

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: itemsWithStatus,
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const inventoryItem = await Inventory.findOne({ _id: id, ownerId });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      inventoryItem[key] = req.body[key];
    });

    await inventoryItem.save();

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem,
    });
  } catch (error) {
    console.error('Update Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message,
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const inventoryItem = await Inventory.findOneAndDelete({ _id: id, ownerId });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    console.error('Delete Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message,
    });
  }
};

// @desc    Run AI analysis on single item
// @route   POST /api/inventory/:id/analyze
// @access  Private
exports.analyzeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const inventoryItem = await Inventory.findOne({ _id: id, ownerId });
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const user = await User.findById(ownerId);

    const analysis = await aiService.analyzeSeasonalDemand(
      user.businessType,
      inventoryItem.itemName,
      inventoryItem.category,
      inventoryItem.quantity,
      inventoryItem.dailyUsage
    );

    if (analysis.success) {
      const currentSeason = aiService.getCurrentSeason();
      const currentMultiplier = analysis.data.seasonalMultipliers[currentSeason];
      const newReorderPoint = aiService.calculateReorderPoint(
        inventoryItem.baseReorderPoint,
        currentMultiplier,
        inventoryItem.dailyUsage
      );

      inventoryItem.seasonalMultipliers = analysis.data.seasonalMultipliers;
      inventoryItem.reorderPoint = newReorderPoint;
      inventoryItem.currentSeason = currentSeason;
      inventoryItem.aiInsights = {
        lastAnalyzed: new Date(),
        recommendations: analysis.data.recommendations,
        demandPattern: analysis.data.demandPattern,
        peakSeason: analysis.data.peakSeason,
        lowSeason: analysis.data.lowSeason,
      };

      await inventoryItem.save();

      res.status(200).json({
        success: true,
        message: 'AI analysis completed successfully',
        data: {
          item: inventoryItem,
          analysis: analysis.data,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'AI analysis failed',
      });
    }
  } catch (error) {
    console.error('Analyze Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze item',
      error: error.message,
    });
  }
};

// @desc    Run AI analysis on all inventory items
// @route   POST /api/inventory/analyze-all
// @access  Private
exports.analyzeAllInventory = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const user = await User.findById(ownerId);
    const inventoryItems = await Inventory.find({ ownerId });

    if (inventoryItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No inventory items to analyze',
        data: [],
      });
    }

    const analysisResult = await aiService.analyzeAllInventory(
      ownerId,
      user.businessType,
      inventoryItems
    );

    if (analysisResult.success) {
      // Update all items in database
      const updatePromises = analysisResult.results.map(result => 
        Inventory.findByIdAndUpdate(result.itemId, {
          reorderPoint: result.newReorderPoint,
          seasonalMultipliers: result.seasonalMultipliers,
          currentSeason: result.currentSeason,
          aiInsights: result.aiInsights,
        })
      );

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'All inventory analyzed successfully',
        data: analysisResult.results,
        currentSeason: analysisResult.currentSeason,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Bulk analysis failed',
      });
    }
  } catch (error) {
    console.error('Analyze All Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze inventory',
      error: error.message,
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const lowStockItems = await Inventory.find({ 
      ownerId,
      $expr: { $lte: ['$quantity', '$reorderPoint'] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    console.error('Get Alerts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message,
    });
  }
};