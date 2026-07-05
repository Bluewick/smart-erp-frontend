import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import HeaderButton from "./HeaderButton";
import { useAuth } from "../contexts/authContext";

const MENU_ITEMS = {
  Company: [
    { label: "Create", shortcut: "C" },
    { label: "Alter", shortcut: "A" },
  ],
  Data: [
    { label: "Backup", shortcut: "B" },
    { label: "Restore", shortcut: "R" },
  ],
  // Add more menus here as needed
};

const NAV_ITEMS = [
  { label: "Company", shortcut: "K" },
  { label: "Data", shortcut: "Y" },
  { label: "Exchange", shortcut: "Z" },
  { label: "Go To", shortcut: "G" },
  { label: "Import", shortcut: "O" },
  { label: "Export", shortcut: "E" },
  { label: "Share", shortcut: "M" },
  { label: "Print", shortcut: "P" }
];

// Build a quick lookup: "K" -> "Company", "Y" -> "Data", etc.
const SHORTCUT_MAP = Object.fromEntries(
  NAV_ITEMS.map(({ label, shortcut }) => [shortcut.toUpperCase(), label])
);

export default function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Detect if the user is currently inside a company context
  // Matches routes like /:companyId/gateway, /:companyId/ledger/create, etc.
  const companyMatch = useMatch("/:companyId/*");
  const currentCompanyId = companyMatch?.params?.companyId ?? null;

  // --- Submenu action handler ---
  function handleMenuAction(menuLabel, itemLabel) {
    setOpenMenu(null);

    if (menuLabel === "Company") {
      if (itemLabel === "Create") {
        navigate("/companies/create");
      } else if (itemLabel === "Alter") {
        if (currentCompanyId) {
          navigate(`/companies/edit/${currentCompanyId}`);
        } else {
          alert("Please open a company first before altering.");
        }
      }
    }
    // Add other menu handlers here (Data → Backup/Restore, etc.)
  }

  // Close nav dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Global shortcuts: Ctrl+Q → Logout | Ctrl+Shift+H → Home
  // Alt + shortcut key → open/toggle menu  |  Escape → close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        return;
      }

      // Ctrl + Q → Logout
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "q") {
        e.preventDefault();
        handleLogout();
        return;
      }

      // Ctrl + Shift + H → Home (companies list)
      if (e.ctrlKey && e.shiftKey && !e.altKey && e.key === "H") {
        e.preventDefault();
        navigate("/companies");
        return;
      }

      if (e.altKey) {
        const key = e.key.toUpperCase();
        const label = SHORTCUT_MAP[key];
        if (label) {
          e.preventDefault();
          setOpenMenu((prev) => (prev === label ? null : label));
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, logout]);

  function handleButtonClick(label) {
    setOpenMenu((prev) => (prev === label ? null : label));
  }

  return (
    <header className="px-4 py-3 text-blue-50 flex items-center gap-2 bg-blue-800 drop-shadow-sm relative">
      {/* Logo */}
      <div className="flex items-center gap-3 select-none shrink-0">
        <h1 className="text-xl font-black tracking-tight">
          Smart<span className="text-blue-500">ERP</span>
        </h1>
      </div>

      <nav className="flex gap-1 justify-evenly flex-1 mx-4" ref={menuRef}>
        {NAV_ITEMS.map(({ label, shortcut }) => {
          const subItems = MENU_ITEMS[label];
          const isOpen = openMenu === label;

          return (
            <div key={label} className="relative">
              <HeaderButton
                shortcut={shortcut}
                onClick={() => handleButtonClick(label)}
                active={isOpen}
              >
                {label}
              </HeaderButton>

              {/* Dropdown submenu */}
              {subItems && isOpen && (
                <div
                  className="absolute left-0 top-full mt-1 z-50 min-w-[140px] overflow-hidden"
                  style={{
                    backgroundColor: "#dce8f5",
                    border: "1px solid #8ab0d8",
                    boxShadow: "2px 4px 12px rgba(0,0,0,0.25)",
                  }}
                >
                  {subItems.map((item, idx) => (
                    <button
                      key={item.label}
                      className="w-full text-left px-4 py-[6px] text-sm text-gray-900 flex items-center gap-1 transition-colors duration-100"
                      style={{
                        backgroundColor:
                          idx === 0 ? "#b8d4f0" : "transparent",
                        fontFamily: "monospace",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#b8d4f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          idx === 0 ? "#b8d4f0" : "transparent";
                      }}
                      onClick={() => handleMenuAction(label, item.label)}
                    >
                      {/* Underline first letter like Tally */}
                      <span>
                        <span className="underline font-semibold">
                          {item.label[0]}
                        </span>
                        {item.label.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Profile icon + dropdown */}
      <div className="relative shrink-0" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((p) => !p)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors duration-200 text-white font-bold text-sm select-none ring-2 ring-white/20 hover:ring-white/40"
          title={user?.email ?? "Profile"}
        >
          {user?.name
            ? user.name[0].toUpperCase()
            : user?.email
            ? user.email[0].toUpperCase()
            : "U"}
        </button>

        {profileOpen && (
          <div
            className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-md overflow-hidden"
            style={{
              backgroundColor: "#dce8f5",
              border: "1px solid #8ab0d8",
              boxShadow: "2px 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {/* User info section */}
            <div className="px-4 py-3 border-b border-blue-200">
              <p className="text-xs font-semibold text-blue-800 truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {user?.email ?? ""}
              </p>
            </div>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-[8px] text-sm text-red-600 font-medium flex items-center gap-2 transition-colors duration-100 hover:bg-red-50"
              style={{ fontFamily: "monospace" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
