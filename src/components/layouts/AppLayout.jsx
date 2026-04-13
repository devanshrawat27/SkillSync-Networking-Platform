import { useState } from 'react';
import Sidebar from '../Sidebar';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden">
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
      </aside>

      {/* Main Content */}
      <main className="page-shell flex-1 pb-16 lg:ml-60 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-[var(--border)] bg-[rgba(17,24,39,0.92)] backdrop-blur-xl lg:hidden">
        <div className="flex h-full items-center justify-around">
          {/* Nav items will be added here */}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
