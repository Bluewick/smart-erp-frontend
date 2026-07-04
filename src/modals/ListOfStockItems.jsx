import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function ListOfStockItems({ onSelect }) {
  const { companyId } = useParams();
  const { token } = useAuth();

  const [stockItems, setStockItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${companyId}/stock-items`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const result = await res.json();
        
        if (res.ok && result.success) {
          setStockItems(result.data || []);
        } else {
          setError(result.message || "Failed to load stock records.");
        }
      } catch (err) {
        console.error("Error loading inventory array:", err);
        setError("Network connectivity problem encountered.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchStockItems();
    }
  }, [companyId, token]);

  // Filter items by Name or Parent Group Category matches
  const filteredItems = stockItems.filter((item) =>
    item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.under_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" size={24} />
        <span className="text-sm font-medium">Fetching Inventory ledger matrix...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm text-center font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-h-[60vh]">
      
      {/* Search Input Filter Panel */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search stock item name or group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          autoFocus
        />
      </div>

      {/* Headings Matching Tally Inventory Table Layouts */}
      <div className="flex justify-between items-center text-[11px] font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100 pb-2 mb-1 px-3">
        <span>Item Name</span>
        <div className="flex gap-16">
          <span>Under</span>
          <span className="w-24 text-right">Opening Qty</span>
        </div>
      </div>

      {/* Stock Items List Scroll Explorer */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
        {filteredItems.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            No stock items found matching your parameters.
          </p>
        ) : (
          filteredItems.map((item) => {
            // Strip decimal zeroes if quantity is a whole number for cleaner presentation
            const formattedQty = parseFloat(item.opening_qty || 0);

            return (
              <button
                key={item.id}
                onClick={() => onSelect?.(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-amber-500 hover:text-white flex items-center justify-between group transition-colors duration-150"
              >
                <span className="group-hover:font-semibold">
                  {item.item_name}
                </span>
                
                <div className="flex items-center gap-16 text-xs text-gray-400 group-hover:text-amber-100">
                  <span className="italic">{item.under_group}</span>
                  <span className="w-24 text-right font-mono font-medium text-gray-600 group-hover:text-white">
                    {formattedQty > 0 ? `${formattedQty} ${item.units}` : "0"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}