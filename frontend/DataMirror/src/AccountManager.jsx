import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountManager() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("HANA");
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState({
    name: "",
    type: "HANA",
    // HANA Fields
    address: "",
    port: "",
    user: "",
    password: "",
    // Snowflake Fields
    account: "",
    database: "",
    warehouse: "",
    role: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

  // Load accounts when component mounts or accountType changes
  useEffect(() => {
    const savedAccounts = JSON.parse(localStorage.getItem(`${accountType}Accounts`) || "[]");
    setAccounts(savedAccounts);
    setSelectedAccount("");
    resetForm();
  }, [accountType]);

  // Clear form
  const resetForm = () => {
    setCurrentAccount({
      name: "",
      type: accountType,
      // HANA Fields
      address: "",
      port: "",
      user: "",
      password: "",
      // Snowflake Fields
      account: "",
      database: "",
      warehouse: "",
      role: "",
    });
    setIsEditing(false);
  };

  // Load account details for editing
  const handleAccountSelect = (e) => {
    const accountName = e.target.value;
    setSelectedAccount(accountName);
    
    if (accountName) {
      const account = accounts.find((acc) => acc.name === accountName);
      if (account) {
        setCurrentAccount(account);
        setIsEditing(true);
      }
    } else {
      resetForm();
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setCurrentAccount({
      ...currentAccount,
      [e.target.name]: e.target.value,
    });
  };

  // Save account
  const handleSave = () => {
    if (!currentAccount.name) {
      alert("Please provide an account name");
      return;
    }

    let updatedAccounts = [...accounts];
    
    if (isEditing) {
      // Update existing account
      updatedAccounts = updatedAccounts.map((acc) => 
        acc.name === currentAccount.name ? currentAccount : acc
      );
    } else {
      // Check for duplicate names
      if (accounts.some(acc => acc.name === currentAccount.name)) {
        alert("An account with this name already exists");
        return;
      }
      // Add new account
      updatedAccounts.push({ ...currentAccount, type: accountType });
    }
    
    // Save to localStorage
    localStorage.setItem(`${accountType}Accounts`, JSON.stringify(updatedAccounts));
    
    // Update state
    setAccounts(updatedAccounts);
    resetForm();
    setSelectedAccount("");
  };

  // Delete account
  const handleDelete = () => {
    if (!selectedAccount) return;
    
    const updatedAccounts = accounts.filter(acc => acc.name !== selectedAccount);
    localStorage.setItem(`${accountType}Accounts`, JSON.stringify(updatedAccounts));
    setAccounts(updatedAccounts);
    resetForm();
    setSelectedAccount("");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Account Manager</h1>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition"
            onClick={() => navigate("/")}
          >
            Back to Comparison Tool
          </button>
        </header>

        {/* Account Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
          <div className="mb-4">
            <label
              htmlFor="accountType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Type:
            </label>
            <select
              id="accountType"
              className="w-full rounded border border-gray-300 p-2 text-sm"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="HANA">HANA</option>
              <option value="Snowflake">Snowflake</option>
            </select>
          </div>

          {/* Saved Accounts */}
          <div className="mb-4">
            <label
              htmlFor="savedAccounts"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Saved Accounts:
            </label>
            <div className="flex gap-2">
              <select
                id="savedAccounts"
                className="flex-1 rounded border border-gray-300 p-2 text-sm"
                value={selectedAccount}
                onChange={handleAccountSelect}
              >
                <option value="">-- Select an account --</option>
                {accounts.map((account) => (
                  <option key={account.name} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </select>
              {selectedAccount && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
          <h2 className="text-md font-semibold mb-3 text-gray-700">
            {isEditing ? "Edit Account" : "Add New Account"}
          </h2>

          <div className="mb-4">
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Name:
            </label>
            <input
              type="text"
              id="accountName"
              name="name"
              value={currentAccount.name}
              onChange={handleInputChange}
              className="w-full rounded border border-gray-300 p-2 text-sm"
              readOnly={isEditing}
            />
          </div>

          {accountType === "HANA" ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address:
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={currentAccount.address}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="port"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Port:
                </label>
                <input
                  type="text"
                  id="port"
                  name="port"
                  value={currentAccount.port}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User:
                </label>
                <input
                  type="text"
                  id="user"
                  name="user"
                  value={currentAccount.user}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={currentAccount.password}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User:
                </label>
                <input
                  type="text"
                  id="user"
                  name="user"
                  value={currentAccount.user}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={currentAccount.password}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Account:
                </label>
                <input
                  type="text"
                  id="account"
                  name="account"
                  value={currentAccount.account}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="database"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Database:
                </label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={currentAccount.database}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="warehouse"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Warehouse:
                </label>
                <input
                  type="text"
                  id="warehouse"
                  name="warehouse"
                  value={currentAccount.warehouse}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role:
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={currentAccount.role}
                  onChange={handleInputChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition"
              onClick={handleSave}
            >
              {isEditing ? "Update" : "Save"} Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}