import React from 'react'

export default function HeaderButton({ children, shortcut, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-blue-800 text-sm text-white rounded-md hover:bg-blue-900 transition-colors duration-200"
    >
      <span className='text-sm'>{children}</span>

      {shortcut && (
        <kbd className="ml-auto font-bold rounded border border-white/0 bg-white/10 px-1.5 py-0.3 text-[12px]  text-white/80 ">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}