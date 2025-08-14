import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Charts from "./pages/Charts";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 text-white p-4 flex space-x-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/charts">Charts</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
