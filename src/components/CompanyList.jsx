import { useState, useEffect } from "react";
import Button from "../components/Button";
import { useAuth } from "../contexts/authContext";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Calendar, 
  Plus, 
  Search,
  ArrowRight,
  Loader2,
  Pencil,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyList({ setActivePage }) {
    const navigate = useNavigate();
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const companiesUrl = API_URL + "/api/companies";

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(companiesUrl, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (result.success) {
          setCompanies(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [token]);

 

    const handleDelete = async (companyId, companyName) => {
   
    const confirmDelete = window.confirm(
        `Are you sure you want to permanently delete "${companyName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
        
        const res = await fetch(`${companiesUrl}/${companyId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
        });

        const result = await res.json();

        if (res.ok && result.success) {
       
        setCompanies((prevCompanies) => 
            prevCompanies.filter((company) => company.id !== companyId)
        );

       
        alert(result.message || `Company "${companyName}" deleted successfully.`);
        } else {
        
        alert(`Error: ${result.message || "Failed to delete the company."}`);
        }
    } catch (error) {
        console.error("Error deleting company:", error);
        alert("An unexpected network error occurred while attempting to delete the company.");
    }
    };

  const filteredCompanies = companies.filter((company) =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Building2 className="text-blue-600" size={26} />
              Your Companies
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage accounts and access financial logs for your registered firms.
            </p>
          </div>
          
          <Button 
            isActive 
            onClick={() => navigate("/companies/create")}
            
            className="flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus size={18} />
            Add New Company
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-6 relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search company by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
            <p className="text-gray-500 text-sm">Loading your corporations records...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
              <Building2 size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm ? "No records match your active search terms." : "Get started by logging your primary workspace profiles."}
            </p>
          </div>
        ) : (
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {filteredCompanies.map((company) => (
              <div 
                key={company.id} 
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 flex flex-col justify-between"
              >
                <div>
                 
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 font-bold text-lg shadow-inner">
                        {company.company_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {company.company_name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          ID: #{company.id}
                        </span>
                      </div>
                    </div>
                    
                    
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200/60">
                      {company.currency_symbol} ({company.currency_name})
                    </span>
                  </div>

                 
                  <div className="space-y-2.5 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {[company.address_line_1, company.state, company.country].filter(Boolean).join(", ")}
                      </span>
                    </div>

                    {company.email && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail size={16} className="text-gray-400 shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={16} className="text-gray-400 shrink-0" />
                      <span>FY: <strong className="text-gray-700 font-normal">{formatDate(company.financial_year_from)}</strong></span>
                    </div>
                  </div>
                </div>

                
                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/companies/edit/${company.id}`)}
                      title="Edit Company"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(company.id, company.company_name)}
                      title="Delete Company"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  
                  <button 
                    type="button"
                    onClick={() => navigate(`/${company.id}/gateway`)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 group-hover:bg-blue-600 group-hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    Launch Workspace
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}