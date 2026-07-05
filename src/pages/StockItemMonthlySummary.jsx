import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function StockItemMonthlySummary() {
  const { companyId, itemId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/stock-items/${itemId}/monthly-summary`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok && result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Failed to load stock monthly summary.");
        }
      } catch (err) {
        console.error("Monthly summary fetch error:", err);
        setError("Network error loading inventory monthly breakdown.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId && itemId) fetchMonthlySummary();
  }, [companyId, itemId, token]);

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

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-100 gap-2">
        <Loader2 className="animate-spin text-slate-700" size={24} />
        <p className="text-gray-500 font-sans text-xs font-medium">Computing Monthly Balances...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <div className="bg-white p-6 border border-red-200 shadow-md rounded-xl max-w-md">
          <p className="text-red-600 font-bold mb-4">{error || "Data not found."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { item_name, units, initial_qty, initial_val, monthly_summary } = data;

  // Deriving grand totals
  const totalInwardsQty = monthly_summary.reduce((sum, m) => sum + m.inwards_qty, 0);
  const totalInwardsVal = monthly_summary.reduce((sum, m) => sum + m.inwards_value, 0);
  const totalOutwardsQty = monthly_summary.reduce((sum, m) => sum + m.outwards_qty, 0);
  const totalOutwardsVal = monthly_summary.reduce((sum, m) => sum + m.outwards_value, 0);

  // The final closing balance is the last month's closing balance (March)
  const finalClosingQty = monthly_summary[monthly_summary.length - 1]?.closing_qty || 0;
  const finalClosingVal = monthly_summary[monthly_summary.length - 1]?.closing_value || 0;

  // Find max closing qty for chart scaling
  const maxClosingQty = Math.max(...monthly_summary.map(m => m.closing_qty), initial_qty, 100);
  const chartMax = Math.ceil(maxClosingQty / 1000) * 1000 || 1000;

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col justify-between select-none font-sans text-xs">
      
      {/* MAIN SCREEN AREA */}
      <div className="flex flex-1">
        
        {/* LEFT WORKSPACE: Monthly Summary Table & Chart */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="w-full bg-white border border-slate-200 shadow-lg rounded-xl flex flex-col flex-1 overflow-hidden">
            
            {/* Top Action Title Banner */}
            <div className="bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-800 text-[11.5px] font-bold shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors duration-150"
                >
                  <ArrowLeft size={15} />
                </button>
                <span className="tracking-wide">Stock Item Monthly Summary</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="uppercase tracking-wider text-slate-400 text-[10px]">Test Company</span>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="hover:bg-slate-800 p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Inventory Table Grid Container */}
            <div className="w-full overflow-x-auto flex-1">
              <table className="w-full border-collapse text-left">
                <thead>
                  {/* Row 1: High Level Header Spans */}
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-700">
                    <th className="py-3 px-4 text-xs tracking-wide text-slate-900" rowSpan={2}>Particulars</th>
                    <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/50" colSpan={2}>Inwards</th>
                    <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/50" colSpan={2}>Outwards</th>
                    <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/50 bg-slate-100/80" colSpan={2}>
                      <div className="text-[10px] font-medium text-slate-500">Books</div>
                      <div className="text-[10px] text-slate-800 font-bold uppercase tracking-wider">Test Company</div>
                      <div className="text-[9px] text-slate-400 font-normal italic">For 1-Apr-25</div>
                      <div className="mt-0.5 font-bold uppercase tracking-wider text-slate-900">Closing Balance</div>
                    </th>
                  </tr>
                  {/* Row 2: Columns Breakdown Headers */}
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] text-slate-500 font-bold italic">
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-24">Quantity</th>
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-28">Value</th>
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-24">Quantity</th>
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-28">Value</th>
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-28">Quantity</th>
                    <th className="py-2 px-4 text-right border-l border-slate-200 w-32">Value</th>
                  </tr>
                </thead>
                
                <tbody>
                  {/* Row 1: Opening Balance Row */}
                  <tr className="border-b border-slate-100 font-medium text-slate-800 bg-white italic">
                    <td className="py-2 px-4 text-xs font-bold text-slate-500">Opening Balance</td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50"></td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50"></td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50"></td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50"></td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50 font-sans text-slate-700">
                      {initial_qty > 0 ? `${initial_qty.toLocaleString('en-IN')} ${units || 'p'}` : ""}
                    </td>
                    <td className="py-2 px-4 text-right border-l border-slate-200/50 font-sans text-slate-700">
                      {initial_val > 0 ? initial_val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                    </td>
                  </tr>

                  {/* Monthly Summary Rows */}
                  {monthly_summary.map((item, idx) => {
                    const showRow = item.inwards_qty > 0 || item.outwards_qty > 0 || item.closing_qty > 0;
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-slate-100 font-medium text-slate-800 bg-white hover:bg-amber-50/20 transition-all duration-100 cursor-pointer ${
                          !showRow ? "opacity-40" : ""
                        }`}
                      >
                        {/* Month Label */}
                        <td className="py-2 px-4 text-xs font-semibold text-slate-900">{item.month}</td>
                        
                        {/* Inwards Quantity */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-700">
                          {item.inwards_qty > 0 ? `${item.inwards_qty.toLocaleString('en-IN')} ${units || 'p'}` : ""}
                        </td>
                        {/* Inwards Value */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-700">
                          {item.inwards_value > 0 ? item.inwards_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                        </td>

                        {/* Outwards Quantity */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-700">
                          {item.outwards_qty > 0 ? `${item.outwards_qty.toLocaleString('en-IN')} ${units || 'p'}` : ""}
                        </td>
                        {/* Outwards Value */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-700">
                          {item.outwards_value > 0 ? item.outwards_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                        </td>

                        {/* Closing Quantity */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-900 font-bold bg-slate-50/30">
                          {item.closing_qty > 0 ? `${item.closing_qty.toLocaleString('en-IN')} ${units || 'p'}` : "0"}
                        </td>
                        {/* Closing Value */}
                        <td className="py-2 px-4 text-right font-sans border-l border-slate-200/50 text-slate-900 font-bold bg-slate-50/30">
                          {item.closing_value > 0 
                            ? item.closing_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                            : "0.00"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Table Footer: Grand Totals */}
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-xs tracking-wide shadow-sm">
                    <td className="py-2.5 px-4 uppercase text-slate-700">Grand Total</td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {totalInwardsQty > 0 ? `${totalInwardsQty.toLocaleString('en-IN')} ${units || 'p'}` : ""}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {totalInwardsVal > 0 ? totalInwardsVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {totalOutwardsQty > 0 ? `${totalOutwardsQty.toLocaleString('en-IN')} ${units || 'p'}` : ""}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {totalOutwardsVal > 0 ? totalOutwardsVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {finalClosingQty > 0 ? `${finalClosingQty.toLocaleString('en-IN')} ${units || 'p'}` : "0"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                      {finalClosingVal > 0 ? finalClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Bar Chart Section */}
            <div className="border-t border-slate-200 bg-slate-50/50 p-4">
              <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Monthly Closing Stock Graph ({item_name})</span>
                <span className="text-[9px] text-slate-400 font-normal normal-case">Hover bars to view details</span>
              </div>
              <div className="flex h-36 border-b border-slate-300 relative items-end pb-1">
                {/* Y-Axis Ticks */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[8.5px] text-slate-400 select-none pl-1">
                  <span>{chartMax}</span>
                  <span>{chartMax / 2}</span>
                  <span>0</span>
                </div>
                
                {/* Graph Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2 pl-8">
                  <div className="border-b border-slate-200 border-dashed w-full h-0"></div>
                  <div className="border-b border-slate-200 border-dashed w-full h-0"></div>
                  <div className="h-0"></div>
                </div>

                {/* Bars Container */}
                <div className="flex-1 flex justify-around items-end h-full pl-8 pr-2 relative z-10">
                  {monthly_summary.map((item, idx) => {
                    const percentage = Math.min((item.closing_qty / chartMax) * 100, 100);
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group relative">
                        {/* Bar tooltip */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-30 shadow-md font-sans">
                          <div>Qty: {item.closing_qty.toLocaleString()} {units || 'p'}</div>
                          <div>Val: ₹{item.closing_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>

                        {/* The Actual Bar */}
                        <div 
                          style={{ height: `${percentage}%` }}
                          className={`w-4 sm:w-6 transition-all duration-300 rounded-t-sm shadow-sm cursor-pointer ${
                            item.closing_qty > 0 
                              ? "bg-red-500 hover:bg-red-600 active:bg-red-700" 
                              : "bg-transparent border border-dashed border-slate-300/40"
                          }`}
                        ></div>

                        {/* Month Label */}
                        <span className="text-[9px] text-slate-500 font-bold mt-1.5 select-none uppercase">
                          {item.month.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR: Tally Options shortcuts */}
        <div className="w-48 bg-slate-200 border-l border-slate-300 flex flex-col text-[11px] select-none text-slate-700">
          <div className="bg-slate-800 text-slate-200 py-2.5 px-3 font-bold text-center border-b border-slate-700 text-[10px] tracking-wider uppercase">
            Options Menu
          </div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F2:</span> Period</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F3:</span> Company</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F4:</span> Stock Item</span>
          </button>
          <div className="h-6 bg-slate-50/50 border-b border-slate-300"></div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-750 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F7:</span> Show Profit</span>
          </button>
          <div className="h-12 bg-slate-50/50 border-b border-slate-300"></div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">B:</span> Basis of Values</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">H:</span> Change View</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">J:</span> Exception Reports</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">L:</span> Save View</span>
          </button>
          <div className="h-6 bg-slate-50/50 border-b border-slate-300"></div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">F:</span> Apply Filter</span>
          </button>
          <div className="h-6 bg-slate-50/50 border-b border-slate-300"></div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">C:</span> New Column</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">A:</span> Alter Column</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">D:</span> Delete Column</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold underline">N:</span> Auto Column</span>
          </button>
          <div className="flex-1 bg-slate-100/50 flex flex-col justify-end">
            <button type="button" className="w-full text-left px-3.5 py-2.5 border-t border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
              <span><span className="text-indigo-600 font-bold">F12:</span> Configure</span>
            </button>
          </div>
        </div>

      </div>

      {/* LOWER FOOTER SCREEN SHORTCUT STATUS STRIP */}
      <div className="w-full bg-slate-300 border-t border-slate-400 px-4 py-2 flex gap-6 text-[10px] font-bold text-slate-700 shadow-inner">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="hover:text-black transition-colors duration-150"
        >
          <span className="text-indigo-700 underline">Q:</span> Quit
        </button>
        <div><span className="text-indigo-700 underline">Space:</span> Select</div>
        <div><span className="text-indigo-700 underline">R:</span> Remove Line</div>
        <div><span className="text-indigo-700 underline">U:</span> Restore Line</div>
      </div>

    </div>
  );
}
