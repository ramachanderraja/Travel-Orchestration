import React, { useState } from 'react';
import { User, Building, CreditCard, ShieldCheck, Search, Plus, Mail, MapPin, Phone } from 'lucide-react';
import { SupplierData } from '../types';

const MOCK_SUPPLIERS: SupplierData[] = [
    {
        id: '1',
        legalName: 'Amit Jain',
        taxId: 'ABCDE1234F',
        country: 'India',
        bankName: 'HDFC Bank Mumbai',
        accountNumber: 'XXXX-XXXX-9234',
        iban: 'HDFC00923403',
        companyAddress: '123, Tech Park, Mumbai, India',
        contactPerson: 'Amit Jain',
        email: 'amit.jain@example.com'
    },
    {
        id: '2',
        legalName: 'Global Tech Supplies Inc',
        taxId: 'US987654321',
        country: 'USA',
        bankName: 'Chase Bank',
        accountNumber: 'XXXX-XXXX-5544',
        iban: 'US12CHAS334455',
        companyAddress: '456 Valley Rd, San Francisco, CA',
        contactPerson: 'Sarah Connor',
        email: 'sarah@globaltech.com'
    }
];

const SupplierRegistration: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>(MOCK_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>('1'); // Default to first for demo
  const [isEditing, setIsEditing] = useState(false);

  // Filter suppliers by Name, ID, OR Email
  const filteredSuppliers = suppliers.filter(s => 
      s.legalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleSelectSupplier = (id: string) => {
      setSelectedSupplierId(id);
      setIsEditing(false);
  };

  const handleAddNew = () => {
      const newId = (suppliers.length + 1).toString();
      const newSupplier: SupplierData = {
          id: newId,
          legalName: 'New Supplier',
          taxId: '',
          country: '',
          bankName: '',
          accountNumber: '',
          iban: '',
          companyAddress: '',
          contactPerson: '',
          email: ''
      };
      setSuppliers([...suppliers, newSupplier]);
      setSelectedSupplierId(newId);
      setIsEditing(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
          
          {/* List Sidebar */}
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">Suppliers</h2>
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search name, ID or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                  </div>
                  <button 
                    onClick={handleAddNew}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                      <Plus size={16} /> Register New Supplier
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {filteredSuppliers.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => handleSelectSupplier(s.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedSupplierId === s.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedSupplierId === s.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {s.legalName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                  <p className={`text-sm font-medium ${selectedSupplierId === s.id ? 'text-blue-900' : 'text-gray-900'}`}>{s.legalName}</p>
                                  <p className="text-xs text-gray-500 truncate">{s.email || 'No email'}</p>
                              </div>
                          </div>
                      </div>
                  ))}
                  {filteredSuppliers.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">No suppliers found</div>
                  )}
              </div>
          </div>

          {/* Details Form */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
             {selectedSupplier ? (
                 <div className="p-6 md:p-8 space-y-8">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <User size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedSupplier.legalName}</h1>
                                <p className="text-sm text-gray-500">ID: {selectedSupplier.id} • {selectedSupplier.country}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Edit</button>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-2 rounded-full border border-green-200 flex items-center">Verified</span>
                         </div>
                     </div>

                    {/* Section 1: Basic & Contact */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b">
                        <Building size={18} className="text-gray-500" /> Company & Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input type="text" defaultValue={selectedSupplier.companyAddress} className="w-full pl-9 rounded-md border border-gray-300 px-3 py-2 bg-white" placeholder="Full Address" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input type="text" defaultValue={selectedSupplier.contactPerson} className="w-full pl-9 rounded-md border border-gray-300 px-3 py-2 bg-white" placeholder="Name" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input type="email" defaultValue={selectedSupplier.email} className="w-full pl-9 rounded-md border border-gray-300 px-3 py-2 bg-white" placeholder="Email" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Company Name</label>
                                <input type="text" defaultValue={selectedSupplier.legalName} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input type="text" defaultValue={selectedSupplier.country} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Banking Info */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b">
                        <CreditCard size={18} className="text-gray-500" /> Banking Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" defaultValue={selectedSupplier.bankName} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input type="text" defaultValue={selectedSupplier.accountNumber} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC / Swift Code</label>
                                <input type="text" defaultValue={selectedSupplier.iban} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                     {/* Section 3: Tax Info */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b">
                        <ShieldCheck size={18} className="text-gray-500" /> Tax & Identification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / PAN</label>
                                <input type="text" defaultValue={selectedSupplier.taxId} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel Changes</button>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Save Supplier</button>
                    </div>

                 </div>
             ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                     <Building size={48} className="opacity-20" />
                     <p>Select a supplier to view details</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default SupplierRegistration;