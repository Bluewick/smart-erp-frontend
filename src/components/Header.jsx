import React from "react";
import HeaderButton from "./HeaderButton";

export default function Header() {
  return (
    <header className="px-4 py-3 text-blue-50 flex gap-2 bg-blue-800  justify-center drop-shadow-sm">
      <div className="flex items-center gap-3 select-none">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            Smart<span className="text-blue-500">ERP</span>
          </h1>
        </div>
      </div>
      <nav className="flex gap-1 justify-evenly w-[75%]">
        <HeaderButton shortcut={"K"}>Company</HeaderButton>
        <HeaderButton shortcut={"Y"}>Data</HeaderButton>
        <HeaderButton shortcut={"Z"}>Exchange</HeaderButton>
        <HeaderButton shortcut={"G"}>Go To</HeaderButton>
        <HeaderButton shortcut={"O"}>Import</HeaderButton>
        <HeaderButton shortcut={"E"}>Export</HeaderButton>
        <HeaderButton shortcut={"M"}>Share</HeaderButton>
        <HeaderButton shortcut={"P"}>Print</HeaderButton>
        <HeaderButton shortcut={"F1"}>Help</HeaderButton>
      </nav>
    </header>
  );
}
