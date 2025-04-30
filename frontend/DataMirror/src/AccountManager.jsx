import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountTypeSelection from "./components/AccountTypeSelection";
import AccountForm from "./components/AccountForm";

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

        <AccountTypeSelection 
          accountType={accountType}
          setAccountType={setAccountType}
          accounts={accounts}
          selectedAccount={selectedAccount}
          handleAccountSelect={handleAccountSelect}
          handleDelete={handleDelete}
        />

        <AccountForm 
          accountType={accountType}
          isEditing={isEditing}
          currentAccount={currentAccount}
          handleInputChange={handleInputChange}
          resetForm={resetForm}
          handleSave={handleSave}
        />
      </div>
    </div>
  );
}