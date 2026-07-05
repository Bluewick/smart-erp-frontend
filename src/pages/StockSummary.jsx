import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function StockSummary() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/stock-items`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok && result.success) {
          setStockItems(result.data || []);
        } else {
          setError(result.message || "Failed to load warehouse stock summary.");
        }
      } catch (err) {
        console.error("Stock fetch error:", err);
        setError("Network configuration error tracking stock levels.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchStockStatus();
  }, [companyId, token]);

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

  // Derived Totals calculation for the bottom Grand Total row
  const totalQuantity = stockItems.reduce((sum, item) => sum + (parseFloat(item.opening_qty) || 0), 0);
  const totalValue = stockItems.reduce((sum, item) => sum + (parseFloat(item.opening_value) || 0), 0);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#edf2f7] gap-2">
        <Loader2 className="animate-spin text-slate-700" size={24} />
        <p className="text-gray-500 font-sans text-xs font-medium">Recalculating Closing Balance Ledgers...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col justify-between select-none font-sans text-xs">
      
      {/* MAIN SCREEN AREA */}
      <div className="flex flex-1">
        
        {/* LEFT WORKSPACE: Stock Statement Grid */}
        <div className="flex-1 p-4 flex flex-col">
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
                <span className="tracking-wide">Stock Summary</span>
              </div>
              <span className="uppercase tracking-wider text-slate-400 text-[10px]">Test Company</span>
            </div>

            {error ? (
              <div className="p-6 text-center text-red-600 font-semibold">{error}</div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Inventory Table Grid Container */}
                <div className="w-full overflow-x-auto flex-1">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      {/* Row 1: High Level Layout Spans */}
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-700">
                        <th className="py-3 px-4 text-xs tracking-wide text-slate-900" rowSpan={2}>Particulars</th>
                        <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/50" colSpan={3}>
                          <div className="text-[10px] font-medium text-slate-500">Test Company</div>
                          <div className="text-[9.5px] text-slate-400 font-normal italic">For 1-Apr-25</div>
                          <div className="mt-0.5 font-bold uppercase tracking-wider text-slate-800">Closing Balance</div>
                        </th>
                      </tr>
                      {/* Row 2: Closing balance broken details headers */}
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] text-slate-500 font-bold italic">
                        <th className="py-2 px-4 text-right border-l border-slate-200 w-32">Quantity</th>
                        <th className="py-2 px-4 text-right border-l border-slate-200 w-28">Rate</th>
                        <th className="py-2 px-4 text-right border-l border-slate-200 w-36">Value</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {stockItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                            No stock assets records identified in database.
                          </td>
                        </tr>
                      ) : (
                        stockItems.map((item) => {
                          const qty = parseFloat(item.opening_qty) || 0;
                          const val = parseFloat(item.opening_value) || 0;
                          // Standard weighted average safety fallback computation
                          const computedRate = qty > 0 ? (val / qty).toFixed(2) : "0.00";

                          return (
                            <tr 
                              key={item.id} 
                              onClick={() => navigate(`/${companyId}/stock-item-monthly-summary/${item.id}`)}
                              className="border-b border-slate-100 font-medium text-slate-800 bg-white hover:bg-amber-50/30 transition-all duration-150 cursor-pointer"
                            >
                              {/* Item label group */}
                              <td className="py-2.5 px-4 text-xs font-semibold text-slate-900">
                                {item.item_name}
                              </td>
                              {/* Quantity breakdown metrics */}
                              <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200/50 text-slate-700">
                                {qty.toLocaleString('en-IN')} {item.units || 'p'}
                              </td>
                              {/* Unit Rate trace */}
                              <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200/50 italic text-slate-600">
                                {computedRate}
                              </td>
                              {/* Total Ledger asset holding Valuation */}
                              <td className="py-2.5 px-4 text-right font-sans border-l border-slate-200/50 font-bold text-slate-900">
                                {val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Table Footer: Grand Totals */}
                    {stockItems.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-xs tracking-wide shadow-sm">
                          <td className="py-3 px-4 uppercase text-slate-700">Grand Total</td>
                          <td className="py-3 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                            {totalQuantity.toLocaleString('en-IN')} p
                          </td>
                          <td className="py-3 px-4 text-right font-sans border-l border-slate-200"></td>
                          <td className="py-3 px-4 text-right font-sans border-l border-slate-200 text-slate-900">
                            {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Tally Navigation Shortcuts Pane */}
        <div className="w-48 bg-slate-200 border-l border-slate-300 flex flex-col text-[11px] select-none text-slate-700">
          <div className="bg-slate-800 text-slate-200 py-2.5 px-3 font-bold text-center border-b border-slate-700 text-[10px] tracking-wider uppercase">
            Options Menu
          </div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F2:</span> Date</span>
          </button>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F3:</span> Company</span>
          </button>
          <div className="h-6 bg-slate-50/50 border-b border-slate-300"></div>
          <button type="button" className="w-full text-left px-3.5 py-2.5 border-b border-slate-300 bg-slate-100/80 text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 transition-all duration-150 flex justify-between">
            <span><span className="text-indigo-600 font-bold">F8:</span> Godown Type</span>
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
          <div className="flex-1 bg-slate-100/50"></div>
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
        <div><span className="text-indigo-700 underline">Space:</span> Select All</div>
        <div><span className="text-indigo-700 underline">R:</span> Remove Line</div>
        <div><span className="text-indigo-700 underline">U:</span> Restore Line</div>
      </div>

    </div>
  );
}