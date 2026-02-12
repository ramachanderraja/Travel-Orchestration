import React, { useState, useEffect, useRef } from 'react';
import { TravelRequestData } from '../types';
import { orchestrateTravelRequest } from '../services/geminiService';
import { Sparkles, Plane, MapPin, Calendar, Briefcase, Loader2, CheckCircle, AlertCircle, Save, Users, Home, FileText, ArrowLeft, Paperclip, Building2, StickyNote, UploadCloud, RefreshCw } from 'lucide-react';

const TravelRequest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'UNSAVED'>('IDLE');
  const [errors, setErrors] = useState<Partial<Record<keyof TravelRequestData, string>>>({});
  const [activeTab, setActiveTab] = useState<'BASIC' | 'NOTES' | 'TRAVEL' | 'SUPPLIERS'>('BASIC');
  
  const [formData, setFormData] = useState<TravelRequestData>({
    requestName: '',
    description: '',
    projectCurrency: 'INR',
    budget: 0,
    travelToCountry: '',
    travelToCity: '',
    travelDate: '',
    returnDate: '',
    purpose: 'Business',
    accommodationType: 'Hotel',
    isUrgent: false,
    attendees: '',
    accommodationPreference: '',
    notes: '',
    attachments: [],
    selectedSupplier: ''
  });

  const isFirstRender = useRef(true);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('travelRequestDraft');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Error parsing draft", e);
      }
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('UNSAVED');

    const timer = setTimeout(() => {
      setSaveStatus('SAVING');
      // Simulate small delay for UX
      setTimeout(() => {
        localStorage.setItem('travelRequestDraft', JSON.stringify(formData));
        setSaveStatus('SAVED');
        
        // Revert to idle after showing saved for a bit
        setTimeout(() => {
            setSaveStatus(prev => prev === 'SAVED' ? 'IDLE' : prev);
        }, 2000);
      }, 500);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formData]);

  const handleSaveDraft = () => {
    setSaveStatus('SAVING');
    localStorage.setItem('travelRequestDraft', JSON.stringify(formData));
    setTimeout(() => {
        setSaveStatus('SAVED');
        setTimeout(() => setSaveStatus('IDLE'), 2000);
    }, 500);
  };

  const handleAiOrchestrate = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await orchestrateTravelRequest(aiPrompt);
      if (result) {
        setFormData(prev => ({
          ...prev,
          travelToCity: result.destination_city || prev.travelToCity,
          travelToCountry: result.destination_country || prev.travelToCountry,
          travelDate: result.departure_date || prev.travelDate,
          returnDate: result.return_date || prev.returnDate,
          description: result.summary || prev.description,
          requestName: result.destination_city ? `Trip to ${result.destination_city}` : prev.requestName,
          budget: result.estimated_budget || prev.budget,
          attendees: result.attendees || prev.attendees,
          accommodationPreference: result.accommodation_preference || prev.accommodationPreference
        }));
        // Switch to Travel tab to see results if not there
        if (activeTab === 'BASIC') setActiveTab('TRAVEL');
      }
    } catch (e) {
      console.error("AI Error", e);
      alert("Failed to orchestrate request. Please check API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear specific error on change
    if (errors[name as keyof TravelRequestData]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const fileName = e.target.files[0].name;
          setFormData(prev => ({
              ...prev,
              attachments: [...prev.attachments, fileName]
          }));
      }
  };

  const validate = () => {
      const newErrors: Partial<Record<keyof TravelRequestData, string>> = {};
      if (!formData.requestName.trim()) newErrors.requestName = "Request Name is required";
      if (!formData.description.trim()) newErrors.description = "Justification is required";
      if (!formData.travelToCity.trim()) newErrors.travelToCity = "Destination City is required";
      if (!formData.travelToCountry.trim()) newErrors.travelToCountry = "Country is required";
      if (!formData.travelDate) newErrors.travelDate = "Departure Date is required";
      if (!formData.returnDate) newErrors.returnDate = "Return Date is required";
      if (formData.budget < 0) newErrors.budget = "Budget cannot be negative";

      if (formData.travelDate && formData.returnDate) {
          if (new Date(formData.returnDate) < new Date(formData.travelDate)) {
              newErrors.returnDate = "Return date cannot be before departure date";
          }
      }

      setErrors(newErrors);
      // If error is in a different tab, switch to it? For simplicity, we just validate globally.
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
      if (validate()) {
          setSubmitted(true);
          localStorage.removeItem('travelRequestDraft');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          // Check where errors are and switch tab if needed
          if (errors.requestName || errors.description) setActiveTab('BASIC');
          else if (errors.travelToCity || errors.travelDate) setActiveTab('TRAVEL');
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert("Please correct the errors before submitting.");
      }
  };

  const handleNewRequest = () => {
      setFormData({
        requestName: '',
        description: '',
        projectCurrency: 'INR',
        budget: 0,
        travelToCountry: '',
        travelToCity: '',
        travelDate: '',
        returnDate: '',
        purpose: 'Business',
        accommodationType: 'Hotel',
        isUrgent: false,
        attendees: '',
        accommodationPreference: '',
        notes: '',
        attachments: [],
        selectedSupplier: ''
      });
      setSubmitted(false);
      setErrors({});
      setAiPrompt('');
      setSaveStatus('IDLE');
      setActiveTab('BASIC');
  };

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

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
      <div 
        onClick={() => setActiveTab(id)}
        className={`p-4 cursor-pointer flex items-center gap-3 transition-colors border-l-4 ${
            activeTab === id 
            ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium' 
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200'
        }`}
      >
          <Icon size={18} className={activeTab === id ? 'text-blue-600' : 'text-gray-400'} />
          {label}
      </div>
  );

  const renderSaveStatus = () => {
      switch(saveStatus) {
          case 'SAVING':
              return <span className="flex items-center gap-1 text-blue-600"><RefreshCw size={12} className="animate-spin" /> Saving...</span>;
          case 'SAVED':
              return <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} /> Saved</span>;
          case 'UNSAVED':
              return <span className="flex items-center gap-1 text-orange-500"><AlertCircle size={12} /> Unsaved changes</span>;
          default:
              return null;
      }
  };

  // Submitted View (Trip Summary)
  if (submitted) {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-full">
                           <CheckCircle size={40} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Request Submitted</h1>
                            <p className="text-green-100 text-lg">Your travel request has been successfully sent for approval.</p>
                        </div>
                    </div>
                    <div className="text-right bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/20">
                        <p className="text-sm opacity-90 uppercase tracking-widest font-medium">Reference ID</p>
                        <p className="font-mono font-bold text-2xl tracking-wider">TR-{Math.floor(Math.random() * 10000) + 1000}</p>
                    </div>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2">Trip Itinerary</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Briefcase size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Trip Name</p>
                                        <p className="font-bold text-gray-900 text-lg">{formData.requestName}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Destination</p>
                                        <p className="font-bold text-gray-900 text-lg">{formData.travelToCity}, {formData.travelToCountry}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Calendar size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Dates</p>
                                        <p className="font-bold text-gray-900 text-lg">{formData.travelDate} <span className="text-gray-400 mx-2">➔</span> {formData.returnDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2">Logistics & Budget</h3>
                             <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Users size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Attendees</p>
                                        <p className="font-bold text-gray-900 text-lg">{formData.attendees || 'Self only'}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Home size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Accommodation</p>
                                        <p className="font-bold text-gray-900 text-lg">{formData.accommodationType}</p>
                                        {formData.accommodationPreference && <p className="text-sm text-gray-600 mt-1">"{formData.accommodationPreference}"</p>}
                                    </div>
                                </div>
                                 <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-700 font-bold w-10 h-10 flex items-center justify-center">₹</div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Estimated Budget</p>
                                        <p className="font-bold text-gray-900 text-lg">₹{formData.budget.toLocaleString()}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                        <h3 className="text-slate-700 font-bold mb-3 flex items-center gap-2">
                            <FileText size={20} /> Business Justification
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-lg">{formData.description}</p>
                        {formData.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-sm font-medium text-slate-700">Additional Notes:</p>
                                <p className="text-slate-600 italic">{formData.notes}</p>
                            </div>
                        )}
                        {formData.isUrgent && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-200">
                                <AlertCircle size={16} /> Urgent Request
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-6">
                        <button 
                           onClick={handleNewRequest}
                           className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-medium"
                        >
                            <ArrowLeft size={20} /> Return to Dashboard / New Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Form View
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Panel: Navigation Tabs */}
      <div className="hidden lg:block lg:col-span-3 space-y-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
          <TabButton id="BASIC" label="Basic Details" icon={FileText} />
          <TabButton id="NOTES" label="Notes and Attachments" icon={Paperclip} />
          <TabButton id="TRAVEL" label="Travel Details" icon={Plane} />
          <TabButton id="SUPPLIERS" label="Suppliers" icon={Building2} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* AI Orchestration Bar - Visible always to help fill details across tabs */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-yellow-300" />
            <h2 className="text-lg font-semibold">AI Travel Assistant</h2>
          </div>
          <p className="text-blue-100 text-sm mb-4">
            Describe your trip (e.g., "I need to visit the New York office next week for a strategy meeting with 2 colleagues, staying near Times Square") and let AI fill the details.
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Type your travel plans here..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 border-none shadow-inner"
            />
            <button 
              onClick={handleAiOrchestrate}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[120px] justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Auto-Fill'}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'BASIC' && 'Basic Information'}
                    {activeTab === 'NOTES' && 'Notes & Attachments'}
                    {activeTab === 'TRAVEL' && 'Travel Itinerary'}
                    {activeTab === 'SUPPLIERS' && 'Preferred Suppliers'}
                </h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Draft</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">
                {renderSaveStatus()}
            </div>
          </div>

          <div className="space-y-6 flex-1">
            
            {/* --- BASIC DETAILS TAB --- */}
            {activeTab === 'BASIC' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Request Name *</label>
                            <input 
                            type="text" 
                            name="requestName"
                            value={formData.requestName}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.requestName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} px-3 py-2 focus:outline-none focus:ring-2 bg-yellow-50/50`}
                            placeholder="e.g. Client Visit to NYC"
                            />
                            {errors.requestName && <p className="text-red-500 text-xs mt-1">{errors.requestName}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Business Justification *</label>
                        <textarea 
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} px-3 py-2 focus:outline-none focus:ring-2 bg-yellow-50/50`}
                            placeholder="Why is this trip necessary?"
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Currency</label>
                            <input 
                                type="text" 
                                value="INR (₹)" 
                                disabled
                                className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                            <select 
                            name="purpose" 
                            value={formData.purpose} 
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            <option>Business Development</option>
                            <option>Client Meeting</option>
                            <option>Conference</option>
                            <option>Internal Training</option>
                            <option>Site Visit</option>
                            </select>
                        </div>
                    </div>
                     <div className="flex items-center pt-2">
                        <input 
                        type="checkbox" 
                        id="urgent"
                        name="isUrgent"
                        checked={formData.isUrgent}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="urgent" className="ml-2 block text-sm text-gray-900 font-medium">Mark as Urgent Request</label>
                    </div>
                </div>
            )}


            {/* --- NOTES AND ATTACHMENTS TAB --- */}
            {activeTab === 'NOTES' && (
                <div className="space-y-6 animate-in fade-in">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea 
                            name="notes"
                            rows={6}
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any special instructions, dietary restrictions, or extra context..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                            <UploadCloud className="text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-500 mb-2">Upload Invitation Letter, Event Brochure, or Email Approval</p>
                            <input 
                                type="file" 
                                className="hidden" 
                                id="file-upload"
                                onChange={handleFileUpload}
                            />
                            <label 
                                htmlFor="file-upload"
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm"
                            >
                                Browse Files
                            </label>
                        </div>
                        {formData.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {formData.attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-100">
                                        <Paperclip size={14} /> {file}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TRAVEL DETAILS TAB --- */}
            {activeTab === 'TRAVEL' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City *</label>
                            <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                name="travelToCity"
                                value={formData.travelToCity}
                                onChange={handleChange}
                                className={`w-full pl-10 rounded-md border ${errors.travelToCity ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="City"
                            />
                            </div>
                            {errors.travelToCity && <p className="text-red-500 text-xs mt-1">{errors.travelToCity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                            <input 
                            type="text" 
                            name="travelToCountry"
                            value={formData.travelToCountry}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.travelToCountry ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Country"
                            />
                            {errors.travelToCountry && <p className="text-red-500 text-xs mt-1">{errors.travelToCountry}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget (INR)</label>
                            <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input 
                                type="number" 
                                name="budget"
                                min="0"
                                value={formData.budget}
                                onChange={handleChange}
                                className={`w-full pl-8 rounded-md border ${errors.budget ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            </div>
                            {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
                            <div className="relative cursor-pointer" onClick={() => openDatePicker('dept-date')}>
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                id="dept-date"
                                type="date" 
                                name="travelDate"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.travelDate}
                                onChange={handleChange}
                                className={`w-full pl-10 rounded-md border ${errors.travelDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                                />
                            </div>
                            {errors.travelDate && <p className="text-red-500 text-xs mt-1">{errors.travelDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                            <div className="relative cursor-pointer" onClick={() => openDatePicker('ret-date')}>
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                id="ret-date"
                                type="date" 
                                name="returnDate"
                                min={formData.travelDate || new Date().toISOString().split('T')[0]}
                                value={formData.returnDate}
                                onChange={handleChange}
                                className={`w-full pl-10 rounded-md border ${errors.returnDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                                />
                            </div>
                            {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Type</label>
                            <select 
                                name="accommodationType" 
                                value={formData.accommodationType} 
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Hotel</option>
                                <option>Business Hotel</option>
                                <option>Boutique Hotel</option>
                                <option>Service Apartment</option>
                                <option>Hostel</option>
                                <option>Corporate Apartment</option>
                                <option>Airbnb / Rental</option>
                                <option>Guest House</option>
                                <option>No Accommodation Needed</option>
                            </select>
                        </div>
                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Preference</label>
                                <input 
                                type="text" 
                                name="accommodationPreference"
                                value={formData.accommodationPreference}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Near airport, Gym required"
                                />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Names)</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                name="attendees"
                                value={formData.attendees}
                                onChange={handleChange}
                                className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. John Doe, Jane Smith"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUPPLIERS TAB --- */}
            {activeTab === 'SUPPLIERS' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700 mb-4">
                        Select preferred suppliers for this trip to ensure policy compliance and direct billing where possible.
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Travel Management Company (TMC)</label>
                         <select 
                            name="selectedSupplier" 
                            value={formData.selectedSupplier} 
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                            <option value="">-- Select Provider --</option>
                            <option value="Amex GBT">Amex GBT (Global Business Travel)</option>
                            <option value="CWT">CWT (Carlson Wagonlit Travel)</option>
                            <option value="BCD Travel">BCD Travel</option>
                            <option value="Corporate Travel Management">Corporate Travel Management</option>
                         </select>
                    </div>
                    {formData.selectedSupplier && (
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                            <p className="font-medium text-gray-800">Selected Provider: {formData.selectedSupplier}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Your request will be routed to {formData.selectedSupplier} for booking fulfillment after approval.
                            </p>
                         </div>
                    )}
                </div>
            )}


            {/* Actions */}
            <div className="flex justify-end pt-6 gap-3 mt-auto border-t">
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                  <Save size={18} /> Save Draft
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 font-medium"
              >
                <CheckCircle size={18} /> Submit Request
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelRequest;