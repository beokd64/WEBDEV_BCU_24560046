import { useEffect, useState } from "react";

// Static exchange rates relative to USD
const staticRates = {
  USD: 1,
  EUR: 0.92,
  VND: 25000,
  JPY: 145,
  GBP: 0.78,
  AUD: 1.5,
  CAD: 1.35,
};

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);

  // Load persisted preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedCurrency = localStorage.getItem("currency") || "USD";

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-gray-900", "text-white");
    } else {
      document.body.classList.add("bg-white", "text-black");
    }

    setCurrency(savedCurrency);
    setRate(staticRates[savedCurrency] || 1);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);

    if (newValue) {
      document.documentElement.classList.add("dark");
      document.body.classList.remove("bg-white", "text-black");
      document.body.classList.add("bg-gray-900", "text-white");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-gray-900", "text-white");
      document.body.classList.add("bg-white", "text-black");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    setCurrency(val);
    setRate(staticRates[val] || 1);
    localStorage.setItem("currency", val);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Dark Mode */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
        <div>
          <p className="text-lg font-medium">Dark Mode</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Toggle the app theme.
          </p>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded font-medium ${
            darkMode ? "bg-green-600 text-white" : "bg-gray-300"
          }`}
        >
          {darkMode ? "On" : "Off"}
        </button>
      </div>

      {/* Currency */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <label className="text-lg font-medium block mb-2">Preferred Currency</label>
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        >
          <option value="USD">USD — US Dollar</option>
          <option value="EUR">EUR — Euro</option>
          <option value="VND">VND — Vietnamese Dong</option>
          <option value="JPY">JPY — Japanese Yen</option>
          <option value="GBP">GBP — British Pound</option>
          <option value="AUD">AUD — Australian Dollar</option>
          <option value="CAD">CAD — Canadian Dollar</option>
        </select>

        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          1 USD ≈ {rate} {currency}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Amounts in the app will display in your selected currency.
        </p>
      </div>
    </div>
  );
}
