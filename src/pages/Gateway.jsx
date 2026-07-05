import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import ListOfMasters from '../modals/ListOfMasters'
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  Layers, 
  Receipt, 
  FileText, 
  PieChart, 
  TrendingUp, 
  LogOut 
} from "lucide-react";
import Modal from "../components/Modal";
import ListOfLedgers from "../modals/ListOfLedgers";
import ListOfStockItems from "../modals/ListOfStockItems";
import ListOfUnits from "../modals/ListOfUnits";

export default function Gateway() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRefs = useRef([]);
  
  const API_URL = import.meta.env.VITE_API_URL;
  const companiesUrl = API_URL + "/api/companies";

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await fetch(`${companiesUrl}/${companyId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setCompany(result.data);
        }
      } catch (error) {
        console.error("Error loading company parameters:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId, token]);


  const handleCreate = () => {
    setIsModalOpen(true);
    setModalTitle('Master Creation');
  }
  const handleAlter = () => {
    setIsModalOpen(true);
    setModalTitle('Master Alteration');
  }

  const handleCreateAction = (action) => {
    if (action === "ledger") {
      navigate(`/${companyId}/ledger/create`);
      setIsModalOpen(false); 
    } 
    if (action === "stock-item") {
      navigate(`/${companyId}/stock-item/create`);
      setIsModalOpen(false); 
    } 
    if (action === "unit") {
      navigate(`/${companyId}/unit/create`);
      setIsModalOpen(false); 
    } 
    // if (action === "voucher-type") {
    //   navigate(`/${companyId}/voucher/purchase`);
    //   setIsModalOpen(false); 
    // } 
  };
  const handleAlterAction = (action, ledgerId = null) => {
    if (action === "ledger") {
      setModalTitle("List of Ledgers")
    }
    if (action === "stock-item") {
      setModalTitle("List of Stock Items");
    }
    if (action === "unit") {
      setModalTitle("List of Units");
    } 
  };

  const handleLedgerAlterSelect = (id) => {
    navigate(`/${companyId}/ledger/alter/${id}`);
    setIsModalOpen(false); // Hide standard overlay modal 
    }
  const handleStockAlterSelect = (id) => {
    navigate(`/${companyId}/stock-item/alter/${id}`);
    setIsModalOpen(false); // Hide standard overlay modal 
  }
  const handleUnitAlterSelect = (id) => {
    navigate(`/${companyId}/unit/alter/${id}`);
    setIsModalOpen(false); // Hide standard overlay modal 
  }

  // Ordered list of all navigable menu items — mirrors the rendered order
  const MENU_ACTIONS = useCallback(() => [
    { key: 'C', label: 'Create',          action: handleCreate },
    { key: 'A', label: 'Alter',           action: handleAlter },
    { key: null, label: 'Chart of Accounts', action: () => {} },
    { key: 'V', label: 'Vouchers',        action: () => navigate(`/${companyId}/voucher/purchase`) },
    { key: null, label: 'Day Book',       action: () => {} },
    { key: null, label: 'Banking',        action: () => {} },
    { key: null, label: 'Balance Sheet',  action: () => {} },
    { key: 'P', label: 'Profit & Loss',   action: () => navigate(`/${companyId}/pnl`) },
    { key: 'S', label: 'Stock Summary',   action: () => navigate(`/${companyId}/stock-summary`) },
    { key: null, label: 'Ratio Analysis', action: () => {} },
    { key: 'Q', label: 'Quit Workspace',  action: () => navigate('/companies') },
  ], [companyId, navigate, handleCreate, handleAlter]);

  // Keyboard navigation
  useEffect(() => {
    if (isModalOpen) return; // let modal handle its own keys

    const items = MENU_ACTIONS();
    const TOTAL = items.length;

    function handleKeyDown(e) {
      // Arrow navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % TOTAL);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + TOTAL) % TOTAL);
        return;
      }
      // Enter → activate highlighted item
      if (e.key === 'Enter') {
        e.preventDefault();
        setSelectedIndex(i => { items[i]?.action(); return i; });
        return;
      }

      // Alt + key shortcuts — direct master actions
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toUpperCase();
        if (key === 'L') {
          // Alt+L → Create Ledger (directly navigate)
          e.preventDefault();
          navigate(`/${companyId}/ledger/create`);
          return;
        }
        if (key === 'A') {
          // Alt+A → Alter Ledger (open alter modal → list of ledgers)
          e.preventDefault();
          setIsModalOpen(true);
          setModalTitle('List of Ledgers');
          return;
        }
        if (key === 'S') {
          // Alt+S → Create Stock Item (directly navigate)
          e.preventDefault();
          navigate(`/${companyId}/stock-item/create`);
          return;
        }
        if (key === 'U') {
          // Alt+U → Create Unit (directly navigate)
          e.preventDefault();
          navigate(`/${companyId}/unit/create`);
          return;
        }
        return; // don't fall through to letter shortcuts when Alt is held
      }

      // Letter shortcuts (only when no modifier)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const pressed = e.key.toUpperCase();
        const match = items.findIndex(it => it.key === pressed);
        if (match !== -1) {
          e.preventDefault();
          setSelectedIndex(match);
          items[match].action();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, MENU_ACTIONS, companyId, navigate]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium">Loading Gateway environment...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Modal title={modalTitle} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} >
        {modalTitle === 'Master Creation' && <ListOfMasters onSelect={handleCreateAction} />}
        {modalTitle === 'Master Alteration' && <ListOfMasters onSelect={handleAlterAction} />}
        {modalTitle === "List of Ledgers" && <ListOfLedgers onSelect={handleLedgerAlterSelect} />}
        {modalTitle === "List of Stock Items" && <ListOfStockItems onSelect={handleStockAlterSelect} />}
        {modalTitle === "List of Units" && <ListOfUnits onSelect={handleUnitAlterSelect} /> }
      </Modal>
      {/* LEFT SECTION: Company Meta Summary & Activity State */}
      <div className="flex-1 flex flex-col p-6 max-w-xl border-r border-gray-200 bg-gray-50/50">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Workspace</span>
              <h1 className="text-xl font-bold text-gray-900">{company?.company_name || "Test Company"}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                <Calendar size={14} />
                <span>Current Period</span>
              </div>
              <p className="font-semibold text-gray-800">01-Apr-2026 to 31-Mar-2027</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                <Calendar size={14} />
                <span>Current Date</span>
              </div>
              <p className="font-semibold text-gray-800">Tuesday, 01-Apr-2026</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>Date of Last Entry</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
              No Vouchers Entered
            </span>
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Core Menu Options Explorer */}
      <div className="flex-[2] flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white font-bold tracking-wide flex items-center gap-2 shadow-inner">
            <Layers size={18} />
            <span>Gateway of Workspace</span>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* MASTERS */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 px-2">Masters</h3>
              <div className="space-y-1">
                {/* index 0 — Create */}
                <button
                  ref={el => menuRefs.current[0] = el}
                  onClick={handleCreate}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 0 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span><span className="text-blue-600 font-bold border-b border-blue-600">C</span>reate</span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                {/* index 1 — Alter */}
                <button
                  ref={el => menuRefs.current[1] = el}
                  onClick={handleAlter}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 1 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span><span className="text-blue-600 font-bold border-b border-blue-600">A</span>lter</span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                {/* index 2 — Chart of Accounts */}
                <button
                  ref={el => menuRefs.current[2] = el}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 2 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span>CHart of Accounts</span>
                </button>
              </div>
            </div>

            {/* TRANSACTIONS */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 px-2">Transactions</h3>
              <div className="space-y-1">
                {/* index 3 — Vouchers */}
                <button
                  ref={el => menuRefs.current[3] = el}
                  onClick={() => navigate(`/${companyId}/voucher/purchase`)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 3 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Receipt size={16} className="text-gray-400" />
                    <span><span className="text-blue-600 font-bold border-b border-blue-600">V</span>ouchers</span>
                  </span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 3 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                {/* index 4 — Day Book */}
                <button
                  ref={el => menuRefs.current[4] = el}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 4 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span>Day BooK</span>
                </button>
              </div>
            </div>

            {/* UTILITIES */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 px-2">Utilities</h3>
              <div className="space-y-1">
                {/* index 5 — Banking */}
                <button
                  ref={el => menuRefs.current[5] = el}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 5 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span>BaNking</span>
                </button>
              </div>
            </div>

            {/* REPORTS */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 px-2">Reports</h3>
              <div className="space-y-1">
                {/* index 6 — Balance Sheet */}
                <button
                  ref={el => menuRefs.current[6] = el}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 6 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span><span className="text-blue-600 font-bold border-b border-blue-600">B</span>alance Sheet</span>
                  </span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 6 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                {/* index 7 — Profit & Loss */}
                <button
                  ref={el => menuRefs.current[7] = el}
                  onClick={() => navigate(`/${companyId}/pnl`)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 7 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PieChart size={16} className="text-gray-400" />
                    <span><span className="text-blue-600 font-bold border-b border-blue-600">P</span>rofit &amp; Loss A/c</span>
                  </span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 7 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                {/* index 8 — Stock Summary */}
                <button
                  ref={el => menuRefs.current[8] = el}
                  onClick={() => navigate(`/${companyId}/stock-summary`)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 8 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span><span className="text-blue-600 font-bold border-b border-blue-600">S</span>tock Summary</span>
                </button>
                {/* index 9 — Ratio Analysis */}
                <button
                  ref={el => menuRefs.current[9] = el}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 group transition-colors border-l-2 ${
                    selectedIndex === 9 ? 'bg-blue-50 border-blue-500' : 'bg-transparent border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span><span className="text-blue-600 font-bold border-b border-blue-600">R</span>atio Analysis</span>
                  </span>
                  <ChevronRight size={14} className={`text-gray-400 transition-opacity ${selectedIndex === 9 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {/* index 10 — Quit Workspace */}
              <button
                ref={el => menuRefs.current[10] = el}
                onClick={() => navigate('/companies')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 rounded-lg transition-colors border-l-2 ${
                  selectedIndex === 10 ? 'bg-red-50 border-red-500' : 'bg-transparent border-transparent hover:bg-red-50'
                }`}
              >
                <LogOut size={16} />
                <span><span className="font-bold border-b border-red-600">Q</span>uit Workspace</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: System Action Key Shortcuts Panel */}
      <div className="w-64 bg-slate-800 text-slate-300 p-4 flex flex-col gap-2 border-l border-slate-700 shadow-2xl">
        <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase pb-2 mb-2 border-b border-slate-700">
          Actions Panel
        </div>
        
        <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold text-left transition-all">
          <span className="text-slate-200">Change Date</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F2</kbd>
        </button>

        <button 
          onClick={() => navigate("/gateway")}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold text-left transition-all"
        >
          <span className="text-slate-200">Shut Company</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F3</kbd>
        </button>

        <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold text-left transition-all">
          <span className="text-slate-400">Select Company</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-slate-500 rounded">F3</kbd>
        </button>

        <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold text-left transition-all">
          <span className="text-slate-200">Features Config</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F11</kbd>
        </button>

        <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold text-left transition-all">
          <span className="text-slate-200">Global Configure</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-blue-400 rounded">F12</kbd>
        </button>
      </div>

    </div>
  );
}