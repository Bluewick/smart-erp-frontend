import { useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../contexts/authContext";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateCompany({ setActivePage }) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    mailingName: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    country: "",
    pincode: "",
    telephone: "",
    mobile: "",
    fax: "",
    email: "",
    website: "",
    currencySymbol: "₹",
    currencyName: "Indian Rupee",
    financialYearFrom: "2026-04-01",
    booksBeginningFrom: "2026-04-01",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error dynamically when user typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  
  const API_URL = import.meta.env.VITE_API_URL;
  const companiesUrl = API_URL + "/api/companies";

  const validateForm = () => {
    let newErrors = {};
    const requiredFields = [
      { key: "companyName", label: "Company Name" },
      { key: "mailingName", label: "Mailing Name" },
      { key: "country", label: "Country" },
      { key: "currencySymbol", label: "Base Currency Symbol" },
      { key: "currencyName", label: "Formal Name" },
      { key: "financialYearFrom", label: "Financial Year" },
      { key: "booksBeginningFrom", label: "Books Beginning From" },
    ];

    requiredFields.forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = `${field.label} is a required field.`;
      }
    });

    setErrors(newErrors);
    // Returns true if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setAlert(null); // Reset previous alert

    // Run explicit verification check
    if (!validateForm()) {
      return; 
    }

    try {
      const res = await fetch(companiesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
  
      const result = await res.json();
      console.log("result", result);
      
      if (res.ok) {
        setAlert({
          type: "success",
          message: `Company "${result?.data?.company_name || formData.companyName}" has been successfully configured and created.`
        });

        navigate("/gateway");
        
        
      } else {
        setAlert({ type: "error", message: result?.message || "Failed to create company." });
      }
      
    } catch (error) {
      console.log(error);
      setAlert({ type: "error", message: "An unexpected networking error occurred." });
    }
  };

  // Helper function to return visual border adjustments for error states
  const getInputClass = (fieldName) => {
    const baseClass = "w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 ";
    if (errors[fieldName]) {
      return baseClass + "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200";
    }
    return baseClass + "border-gray-300 focus:border-blue-500 focus:ring-blue-200";
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-10 px-4">
      <form onSubmit={handleCreateCompany} className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Company
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in the company information below. Fields marked with an asterisk (<span className="text-red-500">*</span>) are required.
          </p>
        </div>

        {/* Improved Success Banner Design */}
        {alert && alert.type === "success" && (
          <div className="m-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 text-sm">Success Code 201</h4>
              <p className="text-emerald-700 text-sm mt-0.5">{alert.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setAlert(null)} 
              className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 p-1 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* General Error Banner fallback */}
        {alert && alert.type === "error" && (
          <div className="m-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <p className="text-red-700 text-sm flex-1">{alert.message}</p>
            <button type="button" onClick={() => setAlert(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="space-y-10 p-8">
          {/* General */}
          <section>
            <h2 className="mb-5 text-xl font-semibold text-gray-800  pb-2">
              General Information
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={getInputClass("companyName")}
                />
                {errors.companyName && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.companyName}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Mailing Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="mailingName"
                  value={formData.mailingName}
                  onChange={handleChange}
                  className={getInputClass("mailingName")}
                />
                {errors.mailingName && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.mailingName}</p>}
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="mb-5 text-xl font-semibold text-gray-800  pb-2">
              Address
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Address Line 1
                </label>
                <input
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={getInputClass("addressLine1")}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className={getInputClass("addressLine2")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={getInputClass("state")}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={getInputClass("country")}
                  />
                  {errors.country && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.country}</p>}
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={getInputClass("pincode")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-5 text-xl font-semibold text-gray-800  pb-2">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Telephone
                </label>
                <input
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={getInputClass("telephone")}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={getInputClass("mobile")}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Fax
                </label>
                <input
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  className={getInputClass("fax")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClass("email")}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Website
                </label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={getInputClass("website")}
                />
              </div>
            </div>
          </section>

          {/* Financial */}
          <section>
            <h2 className="mb-5 text-xl font-semibold text-gray-800 pb-2">
              Financial Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Base Currency Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  name="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={handleChange}
                  className={getInputClass("currencySymbol")}
                />
                {errors.currencySymbol && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.currencySymbol}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Formal Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="currencyName"
                  value={formData.currencyName}
                  onChange={handleChange}
                  className={getInputClass("currencyName")}
                />
                {errors.currencyName && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.currencyName}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Financial Year Beginning From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="financialYearFrom"
                  value={formData.financialYearFrom}
                  onChange={handleChange}
                  className={getInputClass("financialYearFrom")}
                />
                {errors.financialYearFrom && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.financialYearFrom}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Books Beginning From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="booksBeginningFrom"
                  value={formData.booksBeginningFrom}
                  onChange={handleChange}
                  className={getInputClass("booksBeginningFrom")}
                />
                {errors.booksBeginningFrom && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.booksBeginningFrom}</p>}
              </div>
            </div>
          </section>
        </div>


        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5">
          <Button type="button" onClick={() => setActivePage("list")}>Cancel</Button>


          <Button type="submit" isActive>
            Create Company
          </Button>
        </div>
      </form>
    </div>
  );
}