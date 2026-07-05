import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function StockItemCreation({ onBack }) {
  const { companyId, itemId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isEditMode = Boolean(itemId);

  const [formData, setFormData] = useState({
    name: "",
    alias: "",
    under: "Primary",
    units: "Not Applicable",
    gstApplicability: "Applicable",
    hsnSacDetails: "As per Company/Stock Group",
    hsnSac: "",
    description: "",
    gstRateDetails: "As per Company/Stock Group",
    taxabilityType: "Taxable",
    gstRate: "0",
    typeOfSupply: "Goods",
    rateOfDuty: "",
    openingQuantity: "",
    openingRate: "",
    openingValue: "",
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  // Auto-calculate Total Value when Quantity or Rate changes (Tally behavior)
  useEffect(() => {
    const qty = parseFloat(formData.openingQuantity) || 0;
    const rate = parseFloat(formData.openingRate) || 0;
    if (qty && rate) {
      setFormData((prev) => ({ ...prev, openingValue: (qty * rate).toFixed(2) }));
    }
  }, [formData.openingQuantity, formData.openingRate]);

  // Fetch data if in Edit Mode
  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/stock-items/${itemId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok && result.success) {
          const item = result.data;
          setFormData({
            name: item.item_name || "",
            alias: item.alias || "",
            under: item.under_group || "Primary",
            units: item.units || "Not Applicable",
            gstApplicability: item.gst_applicability || "Applicable",
            hsnSacDetails: item.hsn_sac_details || "As per Company/Stock Group",
            hsnSac: item.hsn_sac || "",
            description: item.description || "",
            gstRateDetails: item.gst_rate_details || "As per Company/Stock Group",
            taxabilityType: item.taxability_type || "Taxable",
            gstRate: item.gst_rate || "0",
            typeOfSupply: item.type_of_supply || "Goods",
            rateOfDuty: item.rate_of_duty || "",
            openingQuantity: item.opening_qty || "",
            openingRate: item.opening_rate || "",
            openingValue: item.opening_value || "",
          });
        } else {
          setAlert({ type: "error", message: result.message || "Failed to load stock item details." });
        }
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Network error loading stock parameters." });
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) fetchItemData();
  }, [companyId, itemId, isEditMode, token]);

     useEffect(() => {
        const handleKeyDown = (e) => {
            
            // Escape → Back to Gateway (Home)
            if (e.key === 'Escape') {
                e.preventDefault();
                navigate(`/${companyId}/gateway`);
                return;
            }
            
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [companyId, navigate]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleBack = () => {
        navigate(`/${companyId}/gateway`)
    }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const url = isEditMode
      ? `${API_URL}/api/${companyId}/stock-items/${itemId}`
      : `${API_URL}/api/${companyId}/stock-items`;

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
            ? `Stock Item "${formData.name}" updated successfully.`
            : `Stock Item "${formData.name}" created successfully.`
        });
        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            name: "", alias: "", openingQuantity: "", openingRate: "", openingValue: ""
          }));
        }
      } else {
        setAlert({ type: "error", message: result.message || "Execution fell through." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "A network error occurred." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium">Retrieving Inventory Matrix...</p>
      </div>
    );
  }


  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between max-w-6xl bg-white border border-gray-200 shadow-xl mx-auto my-6 rounded-2xl overflow-hidden">
        
        {/* Top Header Block */}
        <div className="bg-slate-800 text-slate-200 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleBack} className="hover:bg-slate-700 p-1.5 rounded-lg text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold tracking-wide text-white">
              {isEditMode ? "Stock Item Alteration" : "Stock Item Creation"}
            </h1>
          </div>
          <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-md font-semibold">Inventory Module</span>
        </div>

        {alert && (
          <div className={`mx-6 mt-6 p-4 border rounded-xl flex items-center gap-3 ${
            alert.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <CheckCircle2 className={alert.type === "success" ? "text-emerald-600" : "text-red-600"} size={20} />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        )}

        {/* Form Body Context Split */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
          
          {/* LEFT SIDE: Core Stock Configuration */}
          <div className="space-y-6">
            <div className="space-y-4 bg-gray-50/50 p-4 border border-gray-200/60 rounded-xl">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-bold text-gray-700">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-medium text-gray-400 italic">(alias)</label>
                <input type="text" name="alias" value={formData.alias} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-bold text-gray-900">Under</label>
                <select name="under" value={formData.under} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Primary">Primary</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-bold text-gray-900">Units</label>
                <select name="units" value={formData.units} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Pcs">Pcs (Pieces)</option>
                  <option value="Nos">Nos (Numbers)</option>
                  <option value="Box">Box</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Statutory & GST Details */}
          <div className="space-y-6 border-l border-gray-100 pl-0 md:pl-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">Statutory Details</h3>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">GST Applicability</label>
                <select name="gstApplicability" value={formData.gstApplicability} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Applicable">Applicable</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight pt-2">HSN/SAC & Related Details</div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-600 text-xs pl-2">Source of details</label>
                <select name="hsnSacDetails" value={formData.hsnSacDetails} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:outline-none">
                  <option value="As per Company/Stock Group">As per Company/Stock Group</option>
                  <option value="Specify Details Here">Specify Details Here</option>
                </select>
              </div>

              {formData.hsnSacDetails === "Specify Details Here" && (
                <>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm text-gray-700 font-medium pl-2">HSN/SAC</label>
                    <input type="text" name="hsnSac" value={formData.hsnSac} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm text-gray-700 font-medium pl-2">Description</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none" />
                  </div>
                </>
              )}

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight pt-2">GST Rate & Related Details</div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-600 text-xs pl-2">Source of details</label>
                <select name="gstRateDetails" value={formData.gstRateDetails} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:outline-none">
                  <option value="As per Company/Stock Group">As per Company/Stock Group</option>
                  <option value="Specify Details Here">Specify Details Here</option>
                </select>
              </div>

              {formData.gstRateDetails === "Specify Details Here" && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700 font-medium pl-2">GST Rate (%)</label>
                  <input type="number" name="gstRate" value={formData.gstRate} onChange={handleChange} min="0" max="100" className="w-24 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none" />
                </div>
              )}

              <div className="grid grid-cols-3 items-center gap-4 pt-2 border-t border-dashed">
                <label className="text-sm text-gray-700 font-medium">Type of Supply</label>
                <select name="typeOfSupply" value={formData.typeOfSupply} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none">
                  <option value="Goods">Goods</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Rate of Duty (eg 5)</label>
                <input type="text" name="rateOfDuty" value={formData.rateOfDuty} onChange={handleChange} placeholder="0%" className="w-24 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Lower Panel Section: Periodic Inventory Adjustments */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex flex-col gap-4">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Opening Balance Calculations</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Quantity:</label>
              <input type="number" name="openingQuantity" value={formData.openingQuantity} onChange={handleChange} placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Rate:</label>
              <input type="number" step="0.01" name="openingRate" value={formData.openingRate} onChange={handleChange} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Value:</label>
              <input type="text" name="openingValue" value={formData.openingValue} onChange={handleChange} placeholder="0.00" className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm focus:outline-none font-medium" readOnly />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-200">
            <button type="button" onClick={handleBack} className="px-5 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              Quit
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all">
              {isEditMode ? "Update" : "Accept"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}