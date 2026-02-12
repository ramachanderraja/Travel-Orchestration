import React, { useState, useRef, useEffect } from 'react';
import { ExpenseItem } from '../types';
import { analyzeReceipt, generateExpenseSummary } from '../services/geminiService';
import { UploadCloud, Receipt, Plus, Trash2, Loader2, Camera, Calendar, Sparkles, CreditCard, MapPin, ChevronDown, Check, Filter, X, AlertCircle } from 'lucide-react';

const INITIAL_CATEGORIES = ['Meals', 'Transport', 'Accommodation', 'Flights', 'Supplies', 'Entertainment', 'General'];
const KNOWN_MERCHANTS = ['Uber', 'Lyft', 'Hilton', 'Marriott', 'Starbucks', 'Delta Airlines', 'Amazon', 'Shell', 'Airbnb', 'United Airlines', 'Hyatt'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY'];

const formatCurrency = (amount: number, currencyCode: string = 'INR') => {
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(amount);
    } catch (e) {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

const getCurrencySymbol = (currencyCode: string = 'INR') => {
    try {
        return (0).toLocaleString('en-IN', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
    } catch (e) {
        return currencyCode;
    }
};

// Reusable Category Dropdown with Search & Create
const CategorySelect = ({ value, onChange, options, onAddOption }: { value: string, onChange: (val: string) => void, options: string[], onAddOption: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (cat: string) => {
      onChange(cat);
      setIsOpen(false);
      setSearch('');
  };

  const handleCreate = () => {
      if (search && !options.includes(search)) {
          onAddOption(search);
          onChange(search);
          setIsOpen(false);
          setSearch('');
      }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
       <div 
         className="flex items-center justify-between w-full border-b border-transparent hover:border-gray-300 focus-within:border-blue-500 pb-1 text-sm cursor-pointer min-h-[28px]"
         onClick={() => setIsOpen(!isOpen)}
       >
         <span className={`block truncate ${!value ? "text-gray-400" : "text-gray-900"}`}>{value || "Select Category"}</span>
         <ChevronDown size={14} className="text-gray-400 ml-1 flex-shrink-0" />
       </div>
       
       {isOpen && (
         <div className="absolute z-20 w-48 bg-white shadow-xl rounded-lg border border-gray-200 mt-1 max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-100 bg-gray-50">
                <input 
                autoFocus
                type="text" 
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Search or create..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className="overflow-y-auto flex-1 p-1">
                {filtered.map(cat => (
                <div 
                    key={cat} 
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${value === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => handleSelect(cat)}
                >
                    {cat}
                    {value === cat && <Check size={12} />}
                </div>
                ))}
                {search && !filtered.find(c => c.toLowerCase() === search.toLowerCase()) && (
                <button 
                    className="w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer bg-blue-50 text-blue-700 font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors mt-1"
                    onClick={handleCreate}
                >
                    <Plus size={14} /> Create "{search}"
                </button>
                )}
                {filtered.length === 0 && !search && (
                    <div className="px-3 py-2 text-xs text-gray-400 text-center">No categories found</div>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

// Recurring Toggle Switch
const RecurringToggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={checked}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
    </button>
);

// Merchant Input with Validation & Autocomplete
const MerchantInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
    const isValid = value && value.trim().length > 0;
    return (
        <div className="relative group/merchant">
            <input
                list="known-merchants"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`bg-transparent border-b ${isValid ? 'border-gray-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} focus:outline-none p-0.5 text-sm text-gray-900 w-full font-semibold placeholder-gray-400 transition-colors`}
            />
            {!isValid && (
                <div className="absolute right-0 top-0.5 text-red-400 opacity-0 group-hover/merchant:opacity-100 transition-opacity pointer-events-none">
                    <AlertCircle size={12} />
                </div>
            )}
             <datalist id="known-merchants">
                {KNOWN_MERCHANTS.map(m => <option key={m} value={m} />)}
             </datalist>
        </div>
    )
};


const ExpenseClaim: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  
  // State for Filters
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRecurring, setFilterRecurring] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Categories state with local storage persistence
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
      const saved = localStorage.getItem('expenseCategories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [items, setItems] = useState<ExpenseItem[]>([
    { id: '129384', date: '2026-02-11', description: 'Hotel Expenses', category: 'Accommodation', amount: 4500.00, taxAmount: 500, currency: 'INR', merchant: 'Hilton', isRecurring: false, vendorAddress: 'Mumbai, India', paymentMethod: 'Corp Card' },
    { id: '129385', date: '2026-02-12', description: 'Uber to Airport', category: 'Transport', amount: 450.50, taxAmount: 20, currency: 'INR', merchant: 'Uber', isRecurring: true, vendorAddress: 'Mumbai', paymentMethod: 'Visa 4242' },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const mimeType = file.type || 'image/jpeg';

      try {
        const result = await analyzeReceipt(base64String, mimeType);
        if (result) {
          const newItem: ExpenseItem = {
            id: Date.now().toString().slice(-6),
            date: result.date || new Date().toISOString().split('T')[0],
            description: result.line_items?.[0]?.description || 'Expense Item',
            category: availableCategories.includes(result.category) ? result.category : 'General',
            amount: result.total || 0,
            taxAmount: result.tax_amount || 0,
            currency: result.currency || 'INR',
            merchant: result.merchant || '',
            vendorAddress: result.vendor_address || '',
            paymentMethod: result.payment_method || '',
            isRecurring: false
          };
          setItems(prev => [...prev, newItem]);
        }
      } catch (err) {
        console.error("Receipt Analysis Failed", err);
        alert("Could not analyze receipt/document. Please try again.");
      } finally {
        setAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const updateItem = (id: string, field: keyof ExpenseItem, value: any) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteItem = (id: string) => {
      setItems(prev => prev.filter(item => item.id !== id));
  };

  const addItemManually = () => {
      const newItem: ExpenseItem = {
          id: Date.now().toString().slice(-6),
          date: new Date().toISOString().split('T')[0],
          description: '',
          category: 'General',
          amount: 0,
          taxAmount: 0,
          currency: 'INR',
          merchant: '',
          isRecurring: false,
          vendorAddress: '',
          paymentMethod: ''
      };
      setItems([...items, newItem]);
  };

  const handleAddCategory = (newCat: string) => {
      if (!availableCategories.includes(newCat)) {
          const updated = [...availableCategories, newCat];
          setAvailableCategories(updated);
          localStorage.setItem('expenseCategories', JSON.stringify(updated));
      }
  };

  const handleGenerateSummary = async () => {
      if (items.length === 0) return;
      setGeneratingSummary(true);
      const summary = await generateExpenseSummary(items);
      setAiSummary(summary);
      setGeneratingSummary(false);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const openDatePicker = (id: string) => {
    const element = document.getElementById(id) as HTMLInputElement;
    if(element) {
        if (typeof (element as any).showPicker === 'function') {
            (element as any).showPicker();
        } else {
            element.focus();
        }
    }
  }

  // Filter Logic
  const filteredItems = items.filter(item => {
      const dateMatch = (!filterDateStart || item.date >= filterDateStart) && (!filterDateEnd || item.date <= filterDateEnd);
      const catMatch = !filterCategory || item.category === filterCategory;
      const recurMatch = filterRecurring === 'ALL' || (filterRecurring === 'YES' && item.isRecurring) || (filterRecurring === 'NO' && !item.isRecurring);
      return dateMatch && catMatch && recurMatch;
  });

  const totalClaim = filteredItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Claim: #EXP-2026-004</h1>
          <p className="text-sm text-gray-500">Project: Business Trip to Mumbai</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Claim Amount</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalClaim)}</p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative">
          <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                  <Sparkles size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="text-indigo-900 font-semibold mb-1">AI Claim Summary</h3>
                  {aiSummary ? (
                      <p className="text-indigo-800 text-sm leading-relaxed">{aiSummary}</p>
                  ) : (
                      <div className="text-indigo-400 text-sm italic">
                          Click 'Generate Summary' to get an AI-powered overview of this claim.
                      </div>
                  )}
              </div>
               <button 
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary || items.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
               >
                   {generatingSummary ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                   {aiSummary ? 'Regenerate' : 'Generate Summary'}
               </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Area */}
        <div className="lg:col-span-1">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center h-64 transition-colors ${analyzing ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'}`}
            onClick={triggerUpload}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              onChange={handleFileUpload}
            />
            {analyzing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="font-medium text-blue-700">Analyzing Document...</p>
                <p className="text-xs text-blue-500 mt-2">Extracting Merchant, Date, Tax & Total</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Camera className="text-blue-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Scan Receipt / PDF</h3>
                <p className="text-sm text-gray-500 mt-2">Click to upload image or PDF</p>
                <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, PDF (AI Powered)</p>
              </>
            )}
          </div>
          
          <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Tip:</strong> Uploading a receipt automatically populates the line items using Google Gemini Vision AI.
            </p>
          </div>
        </div>

        {/* Line Items Table Container */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          {/* Table Header / Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Receipt size={18} /> Line Items
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`text-sm px-3 py-1.5 rounded-md flex items-center gap-2 border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter size={14} /> Filters
                    </button>
                    <button 
                        onClick={addItemManually}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 shadow-sm"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>
              </div>

              {/* Collapsible Filter Bar */}
              {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                          <input 
                            type="date" 
                            value={filterDateStart} 
                            onChange={(e) => setFilterDateStart(e.target.value)} 
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                          <input 
                            type="date" 
                            value={filterDateEnd} 
                            onChange={(e) => setFilterDateEnd(e.target.value)} 
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                          <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                          >
                              <option value="">All Categories</option>
                              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Recurring</label>
                          <select 
                            value={filterRecurring} 
                            onChange={(e) => setFilterRecurring(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                          >
                              <option value="ALL">All</option>
                              <option value="YES">Recurring Only</option>
                              <option value="NO">Non-Recurring</option>
                          </select>
                      </div>
                      {/* Clear Filters */}
                      {(filterDateStart || filterDateEnd || filterCategory || filterRecurring !== 'ALL') && (
                        <div className="col-span-full flex justify-end">
                            <button 
                                onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); setFilterCategory(''); setFilterRecurring('ALL'); }}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                                <X size={12} /> Clear Filters
                            </button>
                        </div>
                      )}
                  </div>
              )}
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-[130px]">Date</th>
                  <th className="px-4 py-3 min-w-[180px]">Merchant / Details</th>
                  <th className="px-4 py-3 min-w-[160px]">Description</th>
                  <th className="px-4 py-3 w-[160px]">Category</th>
                  <th className="px-4 py-3 w-[100px]">Tax</th>
                  <th className="px-4 py-3 w-[110px]">Total</th>
                  <th className="px-4 py-3 text-center w-[80px]">Recur</th>
                  <th className="px-4 py-3 text-center w-[60px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50 group">
                    <td className="px-4 py-3 align-top">
                        <div className="relative">
                            <input 
                                id={`date-${item.id}`}
                                type="date" 
                                value={item.date} 
                                onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-900 w-full cursor-pointer font-medium"
                            />
                            <Calendar 
                                className="absolute right-0 top-0.5 text-gray-400 pointer-events-none" 
                                size={14} 
                                onClick={() => openDatePicker(`date-${item.id}`)}
                            />
                            {/* Display ID discreetly */}
                            <div className="text-[10px] text-gray-300 font-mono mt-1 select-none">ID: {item.id}</div>
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top space-y-2">
                        <MerchantInput 
                            value={item.merchant} 
                            onChange={(val) => updateItem(item.id, 'merchant', val)}
                            placeholder="Merchant Name"
                        />
                        <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                <input 
                                    type="text" 
                                    value={item.vendorAddress || ''} 
                                    placeholder="Address"
                                    onChange={(e) => updateItem(item.id, 'vendorAddress', e.target.value)}
                                    className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none p-0 text-xs text-gray-500 w-full placeholder-gray-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard size={12} className="text-gray-400 flex-shrink-0" />
                                <input 
                                    type="text" 
                                    value={item.paymentMethod || ''} 
                                    placeholder="Payment Method"
                                    onChange={(e) => updateItem(item.id, 'paymentMethod', e.target.value)}
                                    className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none p-0 text-xs text-gray-500 w-full placeholder-gray-300"
                                />
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <input 
                            type="text" 
                            value={item.description} 
                            placeholder="Description"
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none p-0.5 text-sm text-gray-700 w-full"
                        />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CategorySelect 
                        value={item.category}
                        options={availableCategories}
                        onChange={(val) => updateItem(item.id, 'category', val)}
                        onAddOption={handleAddCategory}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                         <div className="flex items-center gap-1">
                            <select 
                                value={item.currency || 'INR'}
                                onChange={(e) => updateItem(item.id, 'currency', e.target.value)}
                                className="text-gray-500 text-xs font-medium bg-transparent border-none p-0 w-8 focus:ring-0 cursor-pointer appearance-none"
                                title="Change Currency"
                            >
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input 
                                type="number" 
                                value={item.taxAmount || ''} 
                                onChange={(e) => updateItem(item.id, 'taxAmount', parseFloat(e.target.value))}
                                onBlur={(e) => updateItem(item.id, 'taxAmount', parseFloat(parseFloat(e.target.value).toFixed(2)))}
                                className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none p-0 text-sm text-gray-500 w-full"
                                placeholder="0.00"
                                step="0.01"
                            />
                         </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                         <div className="flex items-center gap-1 font-medium">
                            <span className="text-gray-500 text-xs font-medium min-w-[20px]">{getCurrencySymbol(item.currency)}</span>
                            <input 
                                type="number" 
                                value={item.amount || ''} 
                                onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value))}
                                onBlur={(e) => updateItem(item.id, 'amount', parseFloat(parseFloat(e.target.value).toFixed(2)))}
                                className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none p-0 text-sm text-gray-900 w-full"
                                step="0.01"
                            />
                         </div>
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                        <div className="flex justify-center pt-1">
                            <RecurringToggle 
                                checked={!!item.isRecurring} 
                                onChange={(val) => updateItem(item.id, 'isRecurring', val)} 
                            />
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center align-top">
                        <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {items.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No expenses added yet. Upload a receipt or click 'Add Manually'.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExpenseClaim;