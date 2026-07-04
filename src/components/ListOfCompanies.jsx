import React, { useEffect, useState } from "react";
import Button from "./Button";
import { FolderOpen, Plus } from "lucide-react";
import CreateCompany from "../pages/CreateCompany";
import { useAuth } from "../contexts/authContext";
import CompanyList from "./CompanyList";

export default function ListOfCompanies() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [activeButton, setactiveButton] = useState(1);
  const [showPathInput, setShowPathInput] = useState(false);
  const [activePage, setActivePage] = useState("list");

  console.log("user", user);
  console.log("companies", companies);
  const API_URL = import.meta.env.VITE_API_URL;
  const companiesUrl = API_URL + "/api/companies";

  useEffect(() => {
    const fetchCompanies = async () => {

      try {
        const res = await fetch(companiesUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (result.success) {
          setCompanies(result.data);
        } else {
          console.error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };

    fetchCompanies();
  }, [token]);
  

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowDown") {
        setactiveButton((prev) => {
          if (prev < 2) {
            return prev + 1;
          } else {
            return prev - 1;
          }
        });
      }
      if (e.key === "ArrowUp") {
        setactiveButton((prev) => {
          if (prev < 2) {
            return prev + 1;
          } else {
            return prev - 1;
          }
        });
      }
      if (e.key === "Enter" && activeButton === 1) {
        handleCreateCompany();
      }
      if (e.key === "Enter" && activeButton === 2) {
        handleShowPathInput();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeButton, showPathInput]);

  const handleShowPathInput = () => {
    setactiveButton(2);
    setShowPathInput(!showPathInput);
  };

  const handleCreateCompany = () => {
    setactiveButton(1);
    setShowPathInput(false);
    setActivePage("create");
  };

  if (activePage === "create") {
    return <CreateCompany setActivePage={setActivePage} />;
  }

  return (
    <div className="flex flex-col gap-4 justify-center p-8">
      {/* <div className="m-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new company or choose a custom location.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleCreateCompany}
            isActive={activeButton === 1}
            className="w-full"
          >
            <Plus size={16} />
            Create Company
          </Button>

          <Button
            onClick={handleShowPathInput}
            isActive={activeButton === 2}
            className="w-full"
          >
            <FolderOpen size={16} />
            Specify Path
          </Button>

          {showPathInput && (
            <div className="flex flex-col gap-2 py-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="text-sm font-medium text-gray-700">
                Project Path
              </label>

              <input
                type="text"
                placeholder="C:\User\Documents"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 font-mono text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}
        </div>
      </div> */}

      {/* {companies && <div className="w-full m-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          {companies.map(i => i.company_name)}
      </div>} */}
      <CompanyList setActivePage={setActivePage} />
    </div>
  );
}
