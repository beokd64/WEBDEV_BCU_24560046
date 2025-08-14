import { useState } from "react";

export default function Settings() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("light");

  const handleSave = () => {
    alert("Settings saved!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Change Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-2 border rounded">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
