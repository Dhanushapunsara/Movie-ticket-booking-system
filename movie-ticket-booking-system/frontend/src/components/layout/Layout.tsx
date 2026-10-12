import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        CineBook · Movie Ticket Booking System · CMJD 114/115 · IJSE
      </footer>
    </div>
  );
}
