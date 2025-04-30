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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-6 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-20 -mt-32 -mr-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200 to-orange-300 rounded-full opacity-20 -mb-48 -ml-48"></div>
      
      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
              Account Manager
            </h1>
          </div>
          <button
            className="bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-800 py-2 px-5 rounded-full text-sm font-medium transition shadow-sm flex items-center border border-amber-200"
            onClick={() => navigate("/")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Comparison Tool
          </button>
        </header>

        {/* Account Type Selection */}
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 border border-amber-100 mb-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-amber-100 to-orange-100 rounded-bl-full opacity-50"></div>
          
          <div className="mb-5 relative z-10">
            <label
              htmlFor="accountType"
              className="block text-lg font-medium text-amber-800 mb-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Account Type:
            </label>
            <div className="relative">
              <select
                id="accountType"
                className="w-full rounded-lg border border-amber-200 p-3 text-sm pr-8 bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="HANA">HANA</option>
                <option value="Snowflake">Snowflake</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Saved Accounts */}
          <div className="mb-4 relative z-10">
            <label
              htmlFor="savedAccounts"
              className="block text-lg font-medium text-amber-800 mb-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Saved Accounts:
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <select
                  id="savedAccounts"
                  className="w-full rounded-lg border border-amber-200 p-3 text-sm pr-8 bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedAccount && (
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition shadow-md flex items-center"
                  onClick={handleDelete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Form */}
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 border border-amber-100 mb-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-tr-full opacity-30"></div>
          
          <h2 className="text-xl font-semibold mb-5 text-amber-800 flex items-center relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? "Edit Account" : "Add New Account"}
          </h2>

          <div className="mb-5 relative z-10">
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-amber-800 mb-1"
            >
              Account Name:
            </label>
            <input
              type="text"
              id="accountName"
              name="name"
              value={currentAccount.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
              readOnly={isEditing}
            />
          </div>

          {accountType === "HANA" ? (
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Address:
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={currentAccount.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., hana.example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="port"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Port:
                  </label>
                  <input
                    type="text"
                    id="port"
                    name="port"
                    value={currentAccount.port}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., 30015"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="user"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    User:
                  </label>
                  <input
                    type="text"
                    id="user"
                    name="user"
                    value={currentAccount.user}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={currentAccount.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="user"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    User:
                  </label>
                  <input
                    type="text"
                    id="user"
                    name="user"
                    value={currentAccount.user}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={currentAccount.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-amber-800 mb-1"
                >
                  Account:
                </label>
                <input
                  type="text"
                  id="account"
                  name="account"
                  value={currentAccount.account}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., xy12345.us-east-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="database"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Database:
                  </label>
                  <input
                    type="text"
                    id="database"
                    name="database"
                    value={currentAccount.database}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="warehouse"
                    className="block text-sm font-medium text-amber-800 mb-1"
                  >
                    Warehouse:
                  </label>
                  <input
                    type="text"
                    id="warehouse"
                    name="warehouse"
                    value={currentAccount.warehouse}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-amber-800 mb-1"
                >
                  Role:
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={currentAccount.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-amber-200 p-3 text-sm bg-amber-50 bg-opacity-50 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 relative z-10">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-5 rounded-lg text-sm font-medium transition shadow"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-2 px-5 rounded-lg text-sm font-medium transition shadow-md flex items-center"
              onClick={handleSave}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? "Update" : "Save"} Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}