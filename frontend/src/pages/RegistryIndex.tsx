import { Link } from "react-router-dom";
import { ShieldCheck, Map } from "lucide-react";

export default function RegistryIndex() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pt-24">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Anchored Cadastral Registry
        </h1>
        <p className="text-lg text-slate-600">
          The cryptographically secure, dual-key spatial registry integrated directly into MortgageNG.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Surveyor Portal */}
          <Link to="/registry/surveyor" className="group relative block p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left">
            <div className="flex justify-center mb-4">
              <Map className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Surveyor Portal</h2>
            <p className="text-slate-500 text-center">Upload coordinates, propose boundary splits, and cryptographically sign survey plans.</p>
          </Link>

          {/* Landowner Portal */}
          <Link to="/registry/vault" className="group relative block p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Landowner Vault</h2>
            <p className="text-slate-500 text-center">View your active titles, and approve or reject pending surveyor boundary proposals.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
