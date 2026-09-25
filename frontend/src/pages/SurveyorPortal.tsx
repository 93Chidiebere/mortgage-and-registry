import React, { useState } from "react";
import { ScanFace, UploadCloud, CheckCircle2 } from "lucide-react";

export default function SurveyorPortal() {
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBiometrics(true);
  };

  const simulateStepUpAuth = () => {
    setStatus("verifying");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setShowBiometrics(false);
        setStatus("idle");
        alert("Transaction proposed successfully. Waiting for landowner dual-key approval before mortgage underwriting can proceed.");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Surveyor Oracle Dashboard</h1>
            <p className="text-sm text-slate-500">SURCON ID: SUR/2021/4892 • Status: Verified Registry Oracle</p>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Node Active
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">Propose Boundary / Register Plot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Landowner ID</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. USR-99382" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Parcel ID (If Split/Merge)</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. PRC-1029 (Optional)" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GPS Coordinates (GeoJSON Polygon)</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500" 
                placeholder="[[3.4308, 6.4433], [3.4310, 6.4433]...]" 
                required
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors">
              <UploadCloud className="w-5 h-5 mr-2" />
              Stage Survey for Dual-Key Approval
            </button>
          </form>
        </div>

      </div>

      {showBiometrics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${status === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                {status === "success" ? <CheckCircle2 className="w-12 h-12" /> : <ScanFace className={`w-12 h-12 ${status === "verifying" ? "animate-pulse" : ""}`} />}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step-Up Authentication</h3>
              <p className="text-sm text-slate-500 mt-2">
                {status === "idle" && "You are proposing a state change to the cadastral registry. Please verify your identity with a liveness scan."}
                {status === "verifying" && "Verifying biometrics against SURCON database..."}
                {status === "success" && "Identity cryptographically verified."}
              </p>
            </div>

            {status === "idle" && (
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowBiometrics(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={simulateStepUpAuth} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Scan Face</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
