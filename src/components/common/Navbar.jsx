import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    PackagePlus,
    Search,
    ShoppingBag,
    ShoppingCart,
    Store,
    User,
    X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navClass = ({ isActive }) =>
    `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
        isActive
            ? 'bg-[#d9f3ee] text-[#115e59]'
            : 'text-[#34433d] hover:bg-[#eef7f4] hover:text-[#115e59]'
    }`;

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    // Common links for both authenticated and guest users
    const commonLinks = (
        <>
            <NavLink to="/cart" className={navClass} onClick={closeMenu}>
                <ShoppingCart size={16} />
                Cart
            </NavLink>
        </>
    );

    const authLinks = (
        <>
            <NavLink to="/orders" className={navClass} onClick={closeMenu}>
                <ShoppingBag size={16} />
                Orders
            </NavLink>
            <NavLink to="/profile" className={navClass} onClick={closeMenu}>
                <User size={16} />
                Profile
            </NavLink>
            <NavLink to="/vendor/dashboard" className={navClass} onClick={closeMenu}>
                <LayoutDashboard size={16} />
                Vendor
            </NavLink>
            <button type="button" onClick={handleLogout} className="btn btn-ghost !min-h-10 !px-3 text-sm">
                <LogOut size={16} />
                Logout
            </button>
        </>
    );

    const guestLinks = (
        <>
            <NavLink to="/login" className={navClass} onClick={closeMenu}>
                Login
            </NavLink>
            <Link to="/register" onClick={closeMenu} className="btn btn-primary !min-h-10 !px-4 text-sm">
                Create Account
            </Link>
        </>
    );

    return (
        <header className="sticky top-0 z-50 border-b border-[#dfe7e2] bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-18 w-[min(1180px,calc(100%_-_32px))] items-center justify-between gap-4">
                <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0f766e] text-white shadow-sm">
                        <Store size={22} />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-lg font-black leading-tight text-[#17211d]">MarketHub</span>
                        <span className="block truncate text-xs font-semibold text-[#66736d]">Django marketplace</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    <NavLink to="/" className={navClass}>
                        <Search size={16} />
                        Marketplace
                    </NavLink>
                    {/* Cart is now visible to everyone */}
                    {commonLinks}
                    {isAuthenticated ? authLinks : guestLinks}
                </nav>

                <button
                    type="button"
                    className="btn btn-ghost icon-button md:!hidden"
                    onClick={() => setIsMenuOpen((value) => !value)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    title={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="border-t border-[#dfe7e2] bg-white md:hidden">
                    <nav className="mx-auto grid w-[min(1180px,calc(100%_-_24px))] gap-2 py-4">
                        <NavLink to="/" className={navClass} onClick={closeMenu}>
                            <Search size={16} />
                            Marketplace
                        </NavLink>
                        {/* Cart in mobile menu - visible to everyone */}
                        <NavLink to="/cart" className={navClass} onClick={closeMenu}>
                            <ShoppingCart size={16} />
                            Cart
                        </NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/orders" className={navClass} onClick={closeMenu}>
                                    <ShoppingBag size={16} />
                                    Orders
                                </NavLink>
                                <NavLink to="/profile" className={navClass} onClick={closeMenu}>
                                    <User size={16} />
                                    Profile
                                </NavLink>
                                <NavLink to="/vendor/dashboard" className={navClass} onClick={closeMenu}>
                                    <LayoutDashboard size={16} />
                                    Vendor
                                </NavLink>
                                <NavLink to="/vendor/products/create" className={navClass} onClick={closeMenu}>
                                    <PackagePlus size={16} />
                                    Add Product
                                </NavLink>
                                <button type="button" onClick={handleLogout} className="btn btn-ghost !min-h-10 !px-3 text-sm">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={navClass} onClick={closeMenu}>
                                    Login
                                </NavLink>
                                <Link to="/register" onClick={closeMenu} className="btn btn-primary !min-h-10 !px-4 text-sm text-center">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;