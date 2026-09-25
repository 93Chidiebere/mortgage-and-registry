import { useState } from "react";
import { ShieldCheck, MapPin, AlertTriangle, Check, X } from "lucide-react";

export default function LandownerVault() {
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "TXN-8472",
      surveyor: "John Doe (SUR/2021/4892)",
      action: "Sub-division (Split) for Mortgage",
      parentParcel: "PRC-1029",
      date: "Oct 12, 2026",
    }
  ]);

  const handleApprove = (id: string) => {
    alert(`Dual-Key Approval successful. Parcel split for ${id} is now ACTIVE. Your mortgage application can now proceed to underwriting.`);
    setPendingApprovals(pendingApprovals.filter(p => p.id !== id));
  };

  const handleReject = (id: string) => {
    alert("Transaction rejected. The surveyor's proposal has been discarded.");
    setPendingApprovals(pendingApprovals.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Title Vault</h1>
              <p className="text-sm text-slate-500">Owner ID: USR-99382 • Secure Mode Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Active Parcels (Cleared for Mortgages)</h2>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-slate-900">Plot 4, Lekki Phase 1</h3>
                </div>
                <p className="text-sm text-slate-500 mb-3">ID: PRC-1029 • H3 Resolution 13: 42 Hexagons</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">ACTIVE</span>
              </div>
              <button className="text-sm text-blue-600 hover:underline">View Map</button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              Action Center 
              {pendingApprovals.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingApprovals.length}</span>
              )}
            </h2>
            
            {pendingApprovals.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
                No pending surveyor proposals.
              </div>
            ) : (
              pendingApprovals.map((proposal) => (
                <div key={proposal.id} className="bg-white p-5 rounded-xl shadow-sm border border-orange-200 bg-orange-50/30">
                  <div className="flex items-center space-x-2 text-orange-600 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold text-sm">Dual-Key Approval Required</h3>
                  </div>
                  <p className="text-sm text-slate-800 mb-1"><strong>Surveyor:</strong> {proposal.surveyor}</p>
                  <p className="text-sm text-slate-800 mb-1"><strong>Action:</strong> {proposal.action}</p>
                  <p className="text-sm text-slate-800 mb-4"><strong>Target:</strong> {proposal.parentParcel}</p>
                  
                  <div className="flex space-x-2">
                    <button onClick={() => handleApprove(proposal.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </button>
                    <button onClick={() => handleReject(proposal.id)} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center">
                      <X className="w-4 h-4 mr-1" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
