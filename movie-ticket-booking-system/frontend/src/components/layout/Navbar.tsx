import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
}

const PUBLIC_LINKS: NavItem[] = [
  { to: '/movies', label: 'Movies' },
  { to: '/shows', label: 'Showtimes' },
  { to: '/theatres', label: 'Theatres' },
];

const CUSTOMER_LINKS: NavItem[] = [{ to: '/my-bookings', label: 'My Bookings' }];

const ADMIN_LINKS: NavItem[] = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/movies', label: 'Movies' },
  { to: '/admin/theatres', label: 'Theatres' },
  { to: '/admin/shows', label: 'Shows' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/users', label: 'Users' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-zinc-800 text-amber-300' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`;

export default function Navbar() {
  const { user, isAdmin, isCustomer, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  // Role-based navigation: admins get the management menu, customers get their bookings.
  const roleLinks = isAdmin ? ADMIN_LINKS : isCustomer ? CUSTOMER_LINKS : [];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/ticket.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-3xl tracking-wider text-white">Cine<span className="text-amber-400">Book</span></span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
          {isCustomer && CUSTOMER_LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => linkClass({ isActive: isActive || location.pathname.startsWith('/admin') })}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-zinc-950">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                {user.fullName.split(' ')[0]}
              </NavLink>
              <button className="btn-ghost" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-ghost">Sign in</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          className="btn-ghost ml-auto px-2 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Admin sub-navigation */}
      {isAdmin && location.pathname.startsWith('/admin') && (
        <div className="hidden border-t border-zinc-800/80 lg:block">
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {ADMIN_LINKS.map((l) => <NavLink key={l.to} to={l.to} end className={linkClass}>{l.label}</NavLink>)}
          </nav>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {PUBLIC_LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
            {roleLinks.length > 0 && (
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{isAdmin ? 'Admin' : 'Account'}</p>
            )}
            {roleLinks.map((l) => <NavLink key={l.to} to={l.to} end className={linkClass}>{l.label}</NavLink>)}
            <div className="mt-3 flex gap-2 border-t border-zinc-800 pt-3">
              {user ? (
                <>
                  <Link to="/profile" className="btn-secondary flex-1">Profile</Link>
                  <button className="btn-ghost flex-1" onClick={handleSignOut}>Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn-secondary flex-1">Sign in</Link>
                  <Link to="/signup" className="btn-primary flex-1">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
