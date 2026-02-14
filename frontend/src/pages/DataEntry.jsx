import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DataEntry = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    const navigate = useNavigate();
    
    // Inventory state
    const [inventory, setInventory] = useState([]);
    const [inventoryForm, setInventoryForm] = useState({ itemName: '', quantity: '', costPrice: '', sellingPrice: '' });
    
    // Sales state
    const [sales, setSales] = useState([]);
    const [salesForm, setSalesForm] = useState({ itemName: '', quantity: '', totalAmount: '' });
    
    // Expense state
    const [expenses, setExpenses] = useState([]);
    const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: '' });
    
    // Loading and error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingType, setEditingType] = useState(null);

    const token = localStorage.getItem('token');

    // Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => setListening(true);
            recognitionRef.current.onend = () => setListening(false);

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        interimTranscript += transcript + ' ';
                    }
                }
                setTranscript(interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                setError(`Speech recognition error: ${event.error}`);
            };
        }
    }, []);

    // Fetch data on mount and tab change
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [inventoryRes, salesRes, expenseRes] = await Promise.all([
                axios.get('http://localhost:5000/api/data/inventory', { headers }),
                axios.get('http://localhost:5000/api/data/sales', { headers }),
                axios.get('http://localhost:5000/api/data/expenses', { headers }),
            ]);
            setInventory(inventoryRes.data);
            setSales(salesRes.data);
            setExpenses(expenseRes.data);
        } catch (err) {
            setError('Failed to fetch data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !listening) {
            setTranscript('');
            setError('');
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && listening) {
            recognitionRef.current.stop();
        }
    };

    // Handle voice input processing
    const processVoiceInput = (text) => {
        if (!text.trim()) {
            setError('No speech detected');
            return;
        }

        // Simple voice parsing logic - can be enhanced
        const words = text.toLowerCase().trim().split(/\s+/);
        
        if (activeTab === 'inventory') {
            // Example: "add pen quantity 100 cost 5 sell 8"
            processInventoryVoice(words);
        } else if (activeTab === 'sales') {
            // Example: "sell pen quantity 10 amount 80"
            processSalesVoice(words);
        } else if (activeTab === 'expenses') {
            // Example: "expense rent 500 category rent"
            processExpenseVoice(words);
        }
    };

    const processInventoryVoice = (words) => {
        let newForm = { ...inventoryForm };
        for (let i = 0; i < words.length; i++) {
            if (words[i] === 'item' && i + 1 < words.length) {
                newForm.itemName = words[++i];
            } else if (words[i] === 'quantity' && i + 1 < words.length) {
                newForm.quantity = words[++i];
            } else if ((words[i] === 'cost' || words[i] === 'price') && i + 1 < words.length) {
                newForm.costPrice = words[++i];
            } else if ((words[i] === 'sell' || words[i] === 'selling') && i + 1 < words.length) {
                newForm.sellingPrice = words[++i];
            }
        }
        setInventoryForm(newForm);
    };

    const processSalesVoice = (words) => {
        let newForm = { ...salesForm };
        for (let i = 0; i < words.length; i++) {
            if (words[i] === 'item' && i + 1 < words.length) {
                newForm.itemName = words[++i];
            } else if (words[i] === 'quantity' && i + 1 < words.length) {
                newForm.quantity = words[++i];
            } else if ((words[i] === 'amount' || words[i] === 'total') && i + 1 < words.length) {
                newForm.totalAmount = words[++i];
            }
        }
        setSalesForm(newForm);
    };

    const processExpenseVoice = (words) => {
        let newForm = { ...expenseForm };
        for (let i = 0; i < words.length; i++) {
            if (words[i] === 'title' && i + 1 < words.length) {
                newForm.title = words[++i];
            } else if (words[i] === 'amount' && i + 1 < words.length) {
                newForm.amount = words[++i];
            } else if (words[i] === 'category' && i + 1 < words.length) {
                newForm.category = words[++i];
            }
        }
        setExpenseForm(newForm);
    };

    // Handle form submissions
    const handleInventorySubmit = async (e) => {
        e.preventDefault();
        if (!inventoryForm.itemName || !inventoryForm.quantity || !inventoryForm.costPrice || !inventoryForm.sellingPrice) {
            setError('Please fill all fields');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (editingId && editingType === 'inventory') {
                await axios.put(`http://localhost:5000/api/data/inventory/${editingId}`, inventoryForm, { headers });
                setEditingId(null);
                setEditingType(null);
            } else {
                await axios.post('http://localhost:5000/api/data/inventory', inventoryForm, { headers });
            }
            setInventoryForm({ itemName: '', quantity: '', costPrice: '', sellingPrice: '' });
            fetchAllData();
            setError('');
        } catch (err) {
            setError('Error saving inventory: ' + err.message);
        }
    };

    const handleSalesSubmit = async (e) => {
        e.preventDefault();
        if (!salesForm.itemName || !salesForm.quantity || !salesForm.totalAmount) {
            setError('Please fill all fields');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (editingId && editingType === 'sales') {
                await axios.put(`http://localhost:5000/api/data/sales/${editingId}`, salesForm, { headers });
                setEditingId(null);
                setEditingType(null);
            } else {
                await axios.post('http://localhost:5000/api/data/sales', salesForm, { headers });
            }
            setSalesForm({ itemName: '', quantity: '', totalAmount: '' });
            fetchAllData();
            setError('');
        } catch (err) {
            setError('Error saving sales: ' + err.message);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseForm.title || !expenseForm.amount || !expenseForm.category) {
            setError('Please fill all fields');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (editingId && editingType === 'expense') {
                await axios.put(`http://localhost:5000/api/data/expenses/${editingId}`, expenseForm, { headers });
                setEditingId(null);
                setEditingType(null);
            } else {
                await axios.post('http://localhost:5000/api/data/expenses', expenseForm, { headers });
            }
            setExpenseForm({ title: '', amount: '', category: '' });
            fetchAllData();
            setError('');
        } catch (err) {
            setError('Error saving expense: ' + err.message);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const endpoint = type === 'inventory' ? 'inventory' : type === 'sales' ? 'sales' : 'expenses';
            await axios.delete(`http://localhost:5000/api/data/${endpoint}/${id}`, { headers });
            fetchAllData();
        } catch (err) {
            setError('Error deleting record: ' + err.message);
        }
    };

    const handleEdit = (record, type) => {
        setEditingId(record._id);
        setEditingType(type);
        if (type === 'inventory') {
            setInventoryForm(record);
        } else if (type === 'sales') {
            setSalesForm(record);
        } else if (type === 'expense') {
            setExpenseForm(record);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB'}}>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold" style={{color: '#111827'}}>Data Entry with Voice</h1>
                    <div className="space-x-2 flex">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold transition"
                        >
                            ← Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/dead-stock-alerts')}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold transition"
                        >
                            ⚠️ Dead Stock
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-4 p-4 rounded" style={{backgroundColor: '#FEE2E2', borderColor: '#EF4444', border: '1px solid #EF4444', color: '#991B1B'}}>
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            style={activeTab === 'inventory' ? {backgroundColor: '#2563EB', color: '#FFFFFF'} : {backgroundColor: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB'}}
                            className="px-6 py-2 rounded-lg font-semibold transition"
                        >
                            📦 Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            style={activeTab === 'sales' ? {backgroundColor: '#2563EB', color: '#FFFFFF'} : {backgroundColor: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB'}}
                            className="px-6 py-2 rounded-lg font-semibold transition"
                        >
                            💰 Sales
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            style={activeTab === 'expenses' ? {backgroundColor: '#2563EB', color: '#FFFFFF'} : {backgroundColor: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB'}}
                            className="px-6 py-2 rounded-lg font-semibold transition"
                        >
                            💸 Expenses
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-6">Loading...</div>
                    ) : (
                        <>
                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <div className="shadow rounded-lg p-6" style={{backgroundColor: '#FFFFFF'}}>
                                    <h2 className="text-2xl font-semibold mb-6" style={{color: '#111827'}}>Inventory Management</h2>

                                    {/* Voice Input Section */}
                                    <div className="mb-8 p-4 rounded-lg" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}}>
                                        <h3 className="text-lg font-semibold mb-3">🎤 Voice Input</h3>
                                        <div className="flex space-x-2 mb-3">
                                            <button
                                                onClick={startListening}
                                                disabled={listening}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Start Recording
                                            </button>
                                            <button
                                                onClick={stopListening}
                                                disabled={!listening}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Stop Recording
                                            </button>
                                            <button
                                                onClick={() => processVoiceInput(transcript)}
                                                disabled={!transcript}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Process Speech
                                            </button>
                                        </div>
                                        {listening && <p className="text-sm text-blue-600 font-semibold">Listening...</p>}
                                        {transcript && <p className="text-sm text-gray-700">Heard: "{transcript}"</p>}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Try saying: "item pen quantity 100 cost 5 sell 8"
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleInventorySubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Item Name"
                                                value={inventoryForm.itemName}
                                                onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                value={inventoryForm.quantity}
                                                onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Cost Price"
                                                value={inventoryForm.costPrice}
                                                onChange={(e) => setInventoryForm({ ...inventoryForm, costPrice: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Selling Price"
                                                value={inventoryForm.sellingPrice}
                                                onChange={(e) => setInventoryForm({ ...inventoryForm, sellingPrice: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="mt-4 w-full px-4 py-2 text-white rounded font-semibold"
                                            style={{backgroundColor: '#2563EB'}}
                                        >
                                            {editingId && editingType === 'inventory' ? 'Update Inventory' : 'Add Inventory'}
                                        </button>
                                    </form>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 border-b">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Item Name</th>
                                                    <th className="px-4 py-2 text-left">Quantity</th>
                                                    <th className="px-4 py-2 text-left">Cost Price</th>
                                                    <th className="px-4 py-2 text-left">Selling Price</th>
                                                    <th className="px-4 py-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.map((item) => (
                                                    <tr key={item._id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{item.itemName}</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">${item.costPrice}</td>
                                                        <td className="px-4 py-2">${item.sellingPrice}</td>
                                                        <td className="px-4 py-2 space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(item, 'inventory')}
                                                                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id, 'inventory')}
                                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {inventory.length === 0 && <p className="text-center py-4 text-gray-500">No inventory records</p>}
                                    </div>
                                </div>
                            )}

                            {/* SALES TAB */}
                            {activeTab === 'sales' && (
                                <div className="shadow rounded-lg p-6" style={{backgroundColor: '#FFFFFF'}}>
                                    <h2 className="text-2xl font-semibold mb-6" style={{color: '#111827'}}>Sales Management</h2>

                                    {/* Voice Input Section */}
                                    <div className="mb-8 p-4 rounded-lg" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}}>
                                        <h3 className="text-lg font-semibold mb-3">🎤 Voice Input</h3>
                                        <div className="flex space-x-2 mb-3">
                                            <button
                                                onClick={startListening}
                                                disabled={listening}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Start Recording
                                            </button>
                                            <button
                                                onClick={stopListening}
                                                disabled={!listening}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Stop Recording
                                            </button>
                                            <button
                                                onClick={() => processVoiceInput(transcript)}
                                                disabled={!transcript}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Process Speech
                                            </button>
                                        </div>
                                        {listening && <p className="text-sm text-blue-600 font-semibold">Listening...</p>}
                                        {transcript && <p className="text-sm text-gray-700">Heard: "{transcript}"</p>}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Try saying: "item pen quantity 10 amount 80"
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSalesSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Item Name"
                                                value={salesForm.itemName}
                                                onChange={(e) => setSalesForm({ ...salesForm, itemName: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                value={salesForm.quantity}
                                                onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Total Amount"
                                                value={salesForm.totalAmount}
                                                onChange={(e) => setSalesForm({ ...salesForm, totalAmount: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="mt-4 w-full px-4 py-2 text-white rounded font-semibold"
                                            style={{backgroundColor: '#2563EB'}}
                                        >
                                            {editingId && editingType === 'sales' ? 'Update Sales' : 'Add Sales'}
                                        </button>
                                    </form>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b" style={{backgroundColor: '#F9FAFB'}}>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Item Name</th>
                                                    <th className="px-4 py-2 text-left">Quantity</th>
                                                    <th className="px-4 py-2 text-left">Total Amount</th>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                    <th className="px-4 py-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sales.map((item) => (
                                                    <tr key={item._id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{item.itemName}</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">${item.totalAmount}</td>
                                                        <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(item, 'sales')}
                                                                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id, 'sales')}
                                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {sales.length === 0 && <p className="text-center py-4 text-gray-500">No sales records</p>}
                                    </div>
                                </div>
                            )}

                            {/* EXPENSES TAB */}
                            {activeTab === 'expenses' && (
                                <div className="shadow rounded-lg p-6" style={{backgroundColor: '#FFFFFF'}}>
                                    <h2 className="text-2xl font-semibold mb-6" style={{color: '#111827'}}>Expense Management</h2>

                                    {/* Voice Input Section */}
                                    <div className="mb-8 p-4 rounded-lg" style={{backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB'}}>
                                        <h3 className="text-lg font-semibold mb-3">🎤 Voice Input</h3>
                                        <div className="flex space-x-2 mb-3">
                                            <button
                                                onClick={startListening}
                                                disabled={listening}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Start Recording
                                            </button>
                                            <button
                                                onClick={stopListening}
                                                disabled={!listening}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Stop Recording
                                            </button>
                                            <button
                                                onClick={() => processVoiceInput(transcript)}
                                                disabled={!transcript}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Process Speech
                                            </button>
                                        </div>
                                        {listening && <p className="text-sm text-blue-600 font-semibold">Listening...</p>}
                                        {transcript && <p className="text-sm text-gray-700">Heard: "{transcript}"</p>}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Try saying: "title rent amount 500 category rent"
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleExpenseSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={expenseForm.title}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={expenseForm.amount}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                            <select
                                                value={expenseForm.category}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Salaries">Salaries</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Office Supplies">Office Supplies</option>
                                                <option value="Travel">Travel</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            className="mt-4 w-full px-4 py-2 text-white rounded font-semibold"
                                            style={{backgroundColor: '#2563EB'}}
                                        >
                                            {editingId && editingType === 'expense' ? 'Update Expense' : 'Add Expense'}
                                        </button>
                                    </form>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b" style={{backgroundColor: '#F9FAFB'}}>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Title</th>
                                                    <th className="px-4 py-2 text-left">Amount</th>
                                                    <th className="px-4 py-2 text-left">Category</th>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                    <th className="px-4 py-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((item) => (
                                                    <tr key={item._id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{item.title}</td>
                                                        <td className="px-4 py-2">${item.amount}</td>
                                                        <td className="px-4 py-2">{item.category}</td>
                                                        <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(item, 'expense')}
                                                                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id, 'expense')}
                                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {expenses.length === 0 && <p className="text-center py-4 text-gray-500">No expense records</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DataEntry;
