import React from "react";

export default function AccountTypeSelection({
  accountType,
  setAccountType,
  accounts,
  selectedAccount,
  handleAccountSelect,
  handleDelete
}) {
  return (
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
  );
}