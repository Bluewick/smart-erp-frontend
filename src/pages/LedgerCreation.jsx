import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

export default function LedgerCreation({ onBack }) {
  const { companyId, ledgerId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const isEditMode = Boolean(ledgerId);

  const [formData, setFormData] = useState({
    name: "",
    alias: "",
    under: "Sundry Creditors",
    maintainBalancesBillByBill: "Yes",
    defaultCreditPeriod: "",
    checkCreditDays: "No",
    mailingName: "",
    mailingAddress: "",
    state: "Maharashtra",
    country: "India",
    pincode: "",
    provideBankDetails: "No",
    panItNo: "",
    registrationType: "Regular",
    gstinUin: "",
    setAlterGstDetails: "No",
    openingBalance: "",
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

    const API_URL = import.meta.env.VITE_API_URL;
    const companiesUrl = API_URL + "/api/companies";

  useEffect(() => {
    const fetchLedgerData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/ledgers/${ledgerId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (res.ok && result.success) {
          const ledger = result.data;
          setFormData({
            name: ledger.ledger_name || "",
            alias: ledger.alias || "",
            under: ledger.under_group || "Sundry Creditors",
            maintainBalancesBillByBill: ledger.maintain_bill_by_bill || "Yes",
            defaultCreditPeriod: ledger.default_credit_period || "",
            checkCreditDays: ledger.check_credit_days || "No",
            mailingName: ledger.mailing_name || "",
            mailingAddress: ledger.mailing_address || "",
            state: ledger.state || "Maharashtra",
            country: ledger.country || "India",
            pincode: ledger.pincode || "",
            provideBankDetails: ledger.provide_bank_details || "No",
            panItNo: ledger.pan_it_no || "",
            registrationType: ledger.registration_type || "Regular",
            gstinUin: ledger.gstin_uin || "",
            setAlterGstDetails: ledger.set_alter_gst || "No",
            openingBalance: ledger.opening_balance || "",
          });
        } else {
          setAlert({ type: "error", message: result.message || "Failed to load ledger information." });
        }
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Network error loading ledger records." });
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchLedgerData();
    }
  }, [companyId, ledgerId, isEditMode, token]);

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
      ? `${API_URL}/api/${companyId}/ledgers/${ledgerId}`
      : `${API_URL}/api/${companyId}/ledgers`;
      
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
            ? `Ledger "${formData.name}" has been updated successfully.`
            : `Ledger "${formData.name}" has been created successfully.`
        });
        
        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            name: "",
            alias: "",
            openingBalance: "",
            mailingName: "",
            mailingAddress: "",
            pincode: "",
            panItNo: "",
            gstinUin: ""
          }));
        }
      } else {
        setAlert({ type: "error", message: result.message || "Operation failed." });
      }
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "A network error occurred." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium">Retrieving Ledger Information...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between max-w-6xl bg-white border border-gray-200 shadow-xl mx-auto my-6 rounded-2xl overflow-hidden">
        
        <div className="bg-slate-800 text-slate-200 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleBack} className="hover:bg-slate-700 p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold tracking-wide text-white">
              {isEditMode ? "Ledger Alteration" : "Ledger Creation"}
            </h1>
          </div>
          <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-md font-semibold">Active Workspace</span>
        </div>

        {alert && (
          <div className={`mx-6 mt-6 p-4 border rounded-xl flex items-center gap-3 ${
            alert.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <CheckCircle2 className={alert.type === "success" ? "text-emerald-600" : "text-red-600"} size={20} />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
          
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
                <select 
                name="under" 
                value={formData.under} 
                onChange={handleChange} 
                className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none"
                >
                {/* Core Trading Groups */}
                <option value="Sundry Creditors">Sundry Creditors (Suppliers / Vendors you owe money to)</option>
                <option value="Sundry Debtors">Sundry Debtors (Customers who owe you money)</option>
                <option value="Purchase Accounts">Purchase Accounts (Used to track inventory purchases)</option>
                <option value="Sales Accounts">Sales Accounts (Used to track inventory sales)</option>

                {/* Banking & Cash Groups */}
                <option value="Bank Accounts">Bank Accounts (Your business savings/current bank accounts)</option>
                <option value="Cash-in-Hand">Cash-in-Hand (Physical cash counter / petty cash)</option>

                {/* Expenses & Income (For non-inventory transactions) */}
                <option value="Direct Expenses">Direct Expenses (Manufacturing costs, factory freight, wages)</option>
                <option value="Indirect Expenses">Indirect Expenses (Office rent, office electricity, salaries, software bills)</option>
                <option value="Indirect Incomes">Indirect Incomes (Interest earned, commissions received)</option>

                {/* Statutory, Tax & Equity */}
                <option value="Duties & Taxes">Duties & Taxes (Used for GST, VAT, or local tax ledger setups)</option>
                <option value="Capital Account">Capital Account (The owner's personal investment ledger)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Maintain balances bill-by-bill</label>
                <select name="maintainBalancesBillByBill" value={formData.maintainBalancesBillByBill} onChange={handleChange} className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Default credit period</label>
                <input type="text" name="defaultCreditPeriod" value={formData.defaultCreditPeriod} onChange={handleChange} placeholder="e.g. 30 Days" className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Check for credit days during voucher entry</label>
                <select name="checkCreditDays" value={formData.checkCreditDays} onChange={handleChange} className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-l border-gray-100 pl-0 md:pl-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mailing Details</h3>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Name</label>
                <input type="text" name="mailingName" value={formData.mailingName} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-start gap-4">
                <label className="text-sm text-gray-700 font-medium pt-1">Address</label>
                <textarea name="mailingAddress" value={formData.mailingAddress} onChange={handleChange} rows={2} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Banking Details</h3>
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Provide bank details</label>
                <select name="provideBankDetails" value={formData.provideBankDetails} onChange={handleChange} className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tax Registration Details</h3>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">PAN/IT No.</label>
                <input type="text" name="panItNo" value={formData.panItNo} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Registration type</label>
                <input type="text" name="registrationType" value={formData.registrationType} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">GSTIN/UIN</label>
                <input type="text" name="gstinUin" value={formData.gstinUin} onChange={handleChange} className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700 font-medium">Set/Alter additional GST details</label>
                <select name="setAlterGstDetails" value={formData.setAlterGstDetails} onChange={handleChange} className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:outline-none">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label className="text-sm font-bold text-gray-800 whitespace-nowrap">Opening Balance (on 1-Apr-2026):</label>
            <input type="text" name="openingBalance" value={formData.openingBalance} onChange={handleChange} placeholder="0.00 Cr/Dr" className="max-w-[200px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button type="button" onClick={handleBack} className="px-5 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              Quit
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all">
              {isEditMode ? "Update" : "Accept"}
            </button>
          </div>
        </div>

      </form>

      <div className="w-64 bg-slate-800 text-slate-300 p-4 flex flex-col gap-2 border-l border-slate-700 shadow-2xl">
        <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase pb-2 mb-2 border-b border-slate-700">
          Form Shortcuts
        </div>
        <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700/60 transition-all">
          <span>Period</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F2</kbd>
        </button>
        <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700/60 transition-all">
          <span>Company</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F3</kbd>
        </button>
      </div>
    </div>
  );
}