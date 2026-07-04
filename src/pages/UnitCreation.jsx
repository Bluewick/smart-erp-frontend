import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

// Common UQC mapping array for dropdown population
const PRESET_UNITS = [
  { symbol: "PCS", formalName: "Pieces", uqc: "PCS-PIECES" },
  { symbol: "KGS", formalName: "Kilograms", uqc: "KGS-KILOGRAMS" },
  { symbol: "BOX", formalName: "Box", uqc: "BOX-BOX" },
  { symbol: "LTR", formalName: "Litre", uqc: "KLR-KILOLITRE/LITRE" },
  { symbol: "NOS", formalName: "Numbers", uqc: "NOS-NUMBERS" },
  { symbol: "MTR", formalName: "Metres", uqc: "MTR-METRES" },
];

export default function UnitCreation() {
  const { companyId, unitId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isEditMode = Boolean(unitId);

  const [formData, setFormData] = useState({
    type: "Simple",
    symbol: "",
    formalName: "",
    uqc: "NOT APPLICABLE",
    decimalPlaces: "0",
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  // Auto-fill configuration helper when user selects a structural preset shortcut
  const handlePresetChange = (e) => {
    const selectedSymbol = e.target.value;
    if (!selectedSymbol) return;

    const matchedPreset = PRESET_UNITS.find((u) => u.symbol === selectedSymbol);
    if (matchedPreset) {
      setFormData((prev) => ({
        ...prev,
        symbol: matchedPreset.symbol,
        formalName: matchedPreset.formalName,
        uqc: matchedPreset.uqc,
      }));
    }
  };

    const onBack = () => {
        navigate(`/${companyId}/gateway`)
    }

  // Fetch record metadata if in Edit Mode
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/units/${unitId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok && result.success) {
          const unit = result.data;
          setFormData({
            type: unit.unit_type || "Simple",
            symbol: unit.symbol || "",
            formalName: unit.formal_name || "",
            uqc: unit.uqc || "NOT APPLICABLE",
            decimalPlaces: String(unit.decimal_places || 0),
          });
        } else {
          setAlert({ type: "error", message: result.message || "Failed to load measurement unit configurations." });
        }
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Network error loading workspace measurements matrix." });
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) fetchUnitData();
  }, [companyId, unitId, isEditMode, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const url = isEditMode
      ? `${API_URL}/api/${companyId}/units/${unitId}`
      : `${API_URL}/api/${companyId}/units`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setAlert({
          type: "success",
          message: isEditMode
            ? `Unit "${formData.symbol}" updated successfully.`
            : `Unit "${formData.symbol}" created successfully.`
        });
        if (!isEditMode) {
          setFormData({
            type: "Simple",
            symbol: "",
            formalName: "",
            uqc: "NOT APPLICABLE",
            decimalPlaces: "0",
          });
        }
      } else {
        setAlert({ type: "error", message: result.message || "Execution fell through framework parameters." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "A network error occurred." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium">Retrieving Unit Configuration Map...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between max-w-2xl bg-white border border-gray-200 shadow-xl mx-auto my-12 rounded-2xl overflow-hidden">
        
        {/* Component Title Header Area */}
        <div className="bg-slate-800 text-slate-200 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="hover:bg-slate-700 p-1.5 rounded-lg text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold tracking-wide text-white">
              {isEditMode ? "Unit Alteration" : "Unit Creation"}
            </h1>
          </div>
          <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-md font-semibold">Inventory Masters</span>
        </div>

        {alert && (
          <div className={`mx-6 mt-6 p-4 border rounded-xl flex items-center gap-3 ${
            alert.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <CheckCircle2 size={20} className={alert.type === "success" ? "text-emerald-600" : "text-red-600"} />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        )}

        {/* Inputs Panel Container */}
        <div className="p-8 space-y-6 flex-1">
          
          {/* Preset Helper Dropdown Option */}
          {!isEditMode && (
            <div className="grid grid-cols-3 items-center gap-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-2">
              <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Load Preset Template</label>
              <select onChange={handlePresetChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:outline-none">
                <option value="">-- Choose Common Unit Type --</option>
                {PRESET_UNITS.map((u) => (
                  <option key={u.symbol} value={u.symbol}>{u.symbol} - {u.formalName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white font-bold text-gray-800 focus:border-blue-500 focus:outline-none">
              <option value="Simple">Simple</option>
              <option value="Compound">Compound</option>
            </select>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Symbol</label>
            <input type="text" name="symbol" value={formData.symbol} onChange={handleChange} required placeholder="e.g. Pcs" className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase placeholder-gray-300 focus:border-blue-500 focus:outline-none font-mono tracking-wide" />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Formal name</label>
            <input type="text" name="formalName" value={formData.formalName} onChange={handleChange} required placeholder="e.g. Pieces" className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-300 focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Unit Quantity Code (UQC)</label>
            <select name="uqc" value={formData.uqc} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none font-mono text-xs">
              <option value="NOT APPLICABLE">OTH-OTHERS / NOT APPLICABLE</option>
              <option value="PCS-PIECES">PCS-PIECES</option>
              <option value="KGS-KILOGRAMS">KGS-KILOGRAMS</option>
              <option value="BOX-BOX">BOX-BOX</option>
              <option value="NOS-NUMBERS">NOS-NUMBERS</option>
              <option value="MTR-METRES">MTR-METRES</option>
            </select>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Number of decimal places</label>
            <input type="number" name="decimalPlaces" value={formData.decimalPlaces} onChange={handleChange} min="0" max="4" className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none font-mono" />
          </div>

        </div>

        {/* Lower Submit Action Bar Panel */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onBack} className="px-5 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
            Quit
          </button>
          <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all">
            {isEditMode ? "Update" : "Accept"}
          </button>
        </div>

      </form>
    </div>
  );
}