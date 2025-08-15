import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b 
                    bg-white dark:bg-gray-900 sticky top-0">
      <div className="flex gap-4 items-center">
        <Link to="/" className="font-bold text-gray-900 dark:text-white">
          💸 Expense Tracker
        </Link>
        <Link to="/transactions" className="text-sm text-gray-700 dark:text-gray-300">
          Transactions
        </Link>
        <Link to="/settings" className="text-sm text-gray-700 dark:text-gray-300">
          Settings
        </Link>
        
       
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-900 dark:text-white">
              Hi, {user.name || user.email}
            </span>
            <button
              onClick={doLogout}
              className="px-3 py-1 rounded bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-3 py-1 rounded border border-gray-900 dark:border-gray-400 text-sm text-gray-900 dark:text-gray-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1 rounded bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
