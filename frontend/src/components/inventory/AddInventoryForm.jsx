import { useState } from 'react';
import axios from 'axios';
import { FiX, FiPackage } from 'react-icons/fi';

const AddInventoryForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        quantity: '',
        dailyUsage: '',
        costPrice: '',
        sellingPrice: '',
        category: 'beverages'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        { value: 'beverages', label: ' Beverages', hint: 'Cold drinks, juices, tea, coffee' },
        { value: 'food', label: ' Food Items', hint: 'Snacks, meals, ingredients' },
        { value: 'clothing', label: ' Clothing', hint: 'Summer/winter wear, accessories' },
        { value: 'electronics', label: ' Electronics', hint: 'Gadgets, appliances' },
        { value: 'groceries', label: ' Groceries', hint: 'Daily essentials, provisions' },
        { value: 'stationery', label: ' Stationery', hint: 'Office supplies, books' },
        { value: 'cosmetics', label: ' Cosmetics', hint: 'Beauty products, toiletries' },
        { value: 'hardware', label: ' Hardware', hint: 'Tools, equipment' },
        { value: 'general', label: ' General', hint: 'Other items' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const payload = {
                itemName: formData.itemName,
                quantity: Number(formData.quantity),
                dailyUsage: Number(formData.dailyUsage),
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                category: formData.category
            };

            await axios.post('http://localhost:5000/api/inventory', payload, config);

            // Reset form
            setFormData({
                itemName: '',
                quantity: '',
                dailyUsage: '',
                costPrice: '',
                sellingPrice: '',
                category: 'beverages'
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add inventory item');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-accent p-6 text-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FiPackage className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Add Inventory Item</h2>
                            <p className="text-sm text-black/80">AI will analyze seasonal patterns automatically</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <FiX className="text-2xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {error && (
                        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-bold text-textMain mb-2">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Cold Drink, Hot Coffee, T-Shirt"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                        <p className="text-xs text-textLight mt-1">AI will detect seasonal patterns based on the name</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-textMain mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-textLight mt-1">
                            {categories.find(c => c.value === formData.category)?.hint}
                        </p>
                    </div>

                    {/* Quantity and Daily Usage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-textMain mb-2">
                                Current Stock *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="100"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <p className="text-xs text-textLight mt-1">Units in stock</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-textMain mb-2">
                                Daily Usage *
                            </label>
                            <input
                                type="number"
                                name="dailyUsage"
                                value={formData.dailyUsage}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="15"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <p className="text-xs text-textLight mt-1">Average units sold/day</p>
                        </div>
                    </div>

                    {/* Cost and Selling Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-textMain mb-2">
                                Cost Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight">₹</span>
                                <input
                                    type="number"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="20.00"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-xs text-textLight mt-1">Purchase cost per unit</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-textMain mb-2">
                                Selling Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight">₹</span>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    value={formData.sellingPrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="40.00"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-xs text-textLight mt-1">Sale price per unit</p>
                        </div>
                    </div>

                    {/* Profit Margin Preview */}
                    {formData.costPrice && formData.sellingPrice && (
                        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-textMain">Profit Margin:</span>
                                <span className="text-lg font-bold text-success">
                                    ₹{(Number(formData.sellingPrice) - Number(formData.costPrice)).toFixed(2)}
                                    {' '}
                                    ({(((Number(formData.sellingPrice) - Number(formData.costPrice)) / Number(formData.costPrice)) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* AI Notice */}
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl"></span>
                            <div>
                                <h4 className="font-bold text-textMain text-sm mb-1">AI Analysis</h4>
                                <p className="text-xs text-textLight leading-relaxed">
                                    After adding this item, our AI will automatically analyze seasonal demand patterns
                                    based on your business type and item category. Reorder points will be adjusted
                                    according to current season.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-textMain rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Adding...
                                </span>
                            ) : (
                                'Add Item'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddInventoryForm;