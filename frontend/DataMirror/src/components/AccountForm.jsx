import React from "react";

export default function AccountForm({
  accountType,
  isEditing,
  currentAccount,
  handleInputChange,
  resetForm,
  handleSave
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
      <h2 className="text-md font-semibold mb-3 text-gray-700">
        {isEditing ? "Edit Account" : `Add New ${accountType} Account`}
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
        <HANAFields currentAccount={currentAccount} handleInputChange={handleInputChange} />
      ) : (
        <SnowflakeFields currentAccount={currentAccount} handleInputChange={handleInputChange} />
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
  );
}

function HANAFields({ currentAccount, handleInputChange }) {
  return (
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
  );
}

function SnowflakeFields({ currentAccount, handleInputChange }) {
  return (
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
  );
}