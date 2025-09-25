import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const UserSettingsLayout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            <NavLink to="/account/settings" end className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>Account Info</NavLink>
            <NavLink to="/account/security" className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>Security Settings</NavLink>
          </nav>
        </aside>
        <section className="md:col-span-4">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default UserSettingsLayout;


