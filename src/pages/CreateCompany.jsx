import { useState } from "react";
import Button from "../components/Button";

export default function CreateCompany({setActivePage}) {
  const [formData, setFormData] = useState({
    companyPath: "",
    companyName: "",
    mailingName: "",
    address1: "",
    address2: "",
    state: "",
    country: "",
    pincode: "",
    telephone: "",
    mobile: "",
    fax: "",
    email: "",
    website: "",
    currencySymbol: "₹",
    formalName: "Indian Rupee",
    financialYear: "2026-04-01",
    booksBeginning: "2026-04-01",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBrowsePath = () => {

  };

  const handleCreate = () => {
    console.log(formData);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-10">
      <div className="mx-auto w-3xl max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl">

        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Company
          </h1>

          <p className="mt-2 text-gray-500">
            Fill in the company information below.
          </p>
        </div>

        <div className="space-y-10 p-8">

          {/* General */}
          <section>
            <h2 className="mb-5 text-xl font-semibold text-gray-800">
              General Information
            </h2>

            <div className="flex flex-col gap-2 space-y-5">

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Company Data Path
                </label>

                <div className="flex gap-3">
                  <input
                    name="companyPath"
                    value={formData.companyPath}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="C:\\Companies"
                  />

                  <Button onClick={handleBrowsePath}>
                    Browse
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Company Name
                </label>

                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Mailing Name
                </label>

                <input
                  name="mailingName"
                  value={formData.mailingName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="pt-3 mb-5 text-xl font-semibold text-gray-800">
              Address
            </h2>

            <div className="flex flex-col gap-2 space-y-5">

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Address Line 1
                </label>

                <input
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Address Line 2
                </label>

                <input
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-5">

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    State
                  </label>

                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Country
                  </label>

                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="pt-3 mb-5 text-xl font-semibold text-gray-800">
              Contact Information
            </h2>

            <div className="grid grid-cols-3 gap-5">

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Telephone
                </label>

                <input
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

            </div>

            <div className="flex flex-col gap-2 mt-5 space-y-5">

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  E-Mail
                </label>

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

            </div>
          </section>

          {/* Financial */}
          <section>
            <h2 className="pt-3 mb-5 text-xl font-semibold text-gray-800">
              Financial Information
            </h2>

            <div className="grid grid-cols-2 gap-5">

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Base Currency Symbol
                </label>

                <input
                  name="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Formal Name
                </label>

                <input
                  name="formalName"
                  value={formData.formalName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Financial Year Beginning From
                </label>

                <input
                  type="date"
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Books Beginning From
                </label>

                <input
                  type="date"
                  name="booksBeginning"
                  value={formData.booksBeginning}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5">
          <Button onClick={() => setActivePage('list')}>
            Cancel
          </Button>

          <Button
            isActive
            onClick={handleCreate}
          >
            Create Company
          </Button>
        </div>

      </div>
    </div>
  );
}