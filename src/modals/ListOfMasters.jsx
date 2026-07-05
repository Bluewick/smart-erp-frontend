import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";


export default function ListOfMasters({ onSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const masterGroups = [
    {
      title: "Accounting Masters",
      items: [
        { name: "Group", action: 'group' },
        { name: "Ledger", action: 'ledger' },
        { name: "Currency", action: "currency" },
        { name: "Voucher Type", action: "voucher-type" },
      ],
    },
    {
      title: "Inventory Masters",
      items: [
        { name: "Stock Group", action: "stock-group" },
        { name: "Stock Category", action: "stock-category" },
        { name: "Stock Item", action: "stock-item" },
        { name: "Unit", action: "unit" },
        { name: "Godown", action: "godown" },
      ],
    },
    {
      title: "Statutory Masters",
      items: [
        { name: "GST Registration", action: "gst-registration" },
        { name: "GST Classification", action: "gst-classification" },
      ],
    },
    {
      title: "Statutory Details",
      items: [
        { name: "Company GST Details", action: "company-gst" },
        { name: "PAN/CIN Details", action: "pan-cin" },
      ],
    },
  ];

  const filteredGroups = masterGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Flat list of all visible items in render order
  const flatItems = filteredGroups.flatMap((g) => g.items);
  const total = flatItems.length;

  // Reset highlight when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation inside modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(i => (i + 1) % total);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(i => (i - 1 + total) % total);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (flatItems[selectedIndex]) {
          onSelect?.(flatItems[selectedIndex].action);
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [total, selectedIndex, flatItems, onSelect]);

  // Keep highlighted item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const highlighted = listRef.current.querySelector('[data-highlighted="true"]');
    highlighted?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Build a flat counter to map each item to a global index
  let globalIdx = 0;

  return (
    <div className="flex flex-col w-full max-h-[60vh]">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search master type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          autoFocus
        />
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto pr-1 space-y-4 divide-y divide-gray-100">
        {filteredGroups.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">No masters found matching your search.</p>
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <div key={group.title} className={groupIdx > 0 ? "pt-3" : ""}>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5 px-2">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const idx = globalIdx++;
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={item.action}
                      data-highlighted={isActive}
                      onClick={() => onSelect?.(item.action)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-between border-l-2 ${
                        isActive
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'text-gray-700 border-transparent hover:bg-amber-500 hover:text-white'
                      }`}
                    >
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}