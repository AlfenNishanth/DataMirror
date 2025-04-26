import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [comparisonType, setComparisonType] = useState("primaryKey");
  
  // Source 1 state
  const [source1Type, setSource1Type] = useState("HANA");
  const [source1Accounts, setSource1Accounts] = useState([]);
  const [selectedSource1Account, setSelectedSource1Account] = useState("");
  
  // Source 2 state
  const [source2Type, setSource2Type] = useState("HANA");
  const [source2Accounts, setSource2Accounts] = useState([]);
  const [selectedSource2Account, setSelectedSource2Account] = useState("");
  
  // Load saved accounts when component mounts and when sourceType changes
  useEffect(() => {
    const savedSource1Accounts = JSON.parse(localStorage.getItem(`${source1Type}Accounts`) || "[]");
    setSource1Accounts(savedSource1Accounts);
    setSelectedSource1Account(savedSource1Accounts.length > 0 ? savedSource1Accounts[0].name : "");
  }, [source1Type]);
  
  useEffect(() => {
    const savedSource2Accounts = JSON.parse(localStorage.getItem(`${source2Type}Accounts`) || "[]");
    setSource2Accounts(savedSource2Accounts);
    setSelectedSource2Account(savedSource2Accounts.length > 0 ? savedSource2Accounts[0].name : "");
  }, [source2Type]);

  const handleCompare = () => {
    // This would be replaced with actual comparison logic
    console.log("Comparing data...");
    // Here you would typically make an API call to initiate the comparison
  };

  const handleManageAccounts = () => {
    navigate("/manage-accounts");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Data Comparison Tool
          </h1>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition"
            onClick={handleManageAccounts}
          >
            Manage Accounts
          </button>
        </header>

        {/* Comparison Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
          <h2 className="text-md font-semibold mb-3 text-gray-700">
            Comparison Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="primaryKeyComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                name="comparisonType"
                value="primaryKey"
                checked={comparisonType === "primaryKey"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="primaryKeyComparison"
                className="text-sm text-gray-700"
              >
                Primary Key Comparison
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="columnLevelComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                name="comparisonType"
                value="columnLevel"
                checked={comparisonType === "columnLevel"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="columnLevelComparison"
                className="text-sm text-gray-700"
              >
                Column-level Comparison
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="tableStructureComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                name="comparisonType"
                value="tableStructure"
                checked={comparisonType === "tableStructure"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="tableStructureComparison"
                className="text-sm text-gray-700"
              >
                Table Structure Comparison
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="sqlQueryComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                name="comparisonType"
                value="sqlQuery"
                checked={comparisonType === "sqlQuery"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="sqlQueryComparison"
                className="text-sm text-gray-700"
              >
                SQL Query Comparison
              </label>
            </div>
          </div>
        </div>

        {/* Sources Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Source 1 */}
          <div
            className="bg-white rounded-lg shadow-sm p-4 border border-blue-100"
          >
            <div className="mb-3 pb-2 border-b border-gray-100">
              <h2 className="text-md font-semibold text-blue-700">
                Source 1
              </h2>
            </div>

            <div className="mb-4">
              <label
                htmlFor="source1Type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Source Type:
              </label>
              <select
                id="source1Type"
                className="w-full rounded border border-gray-300 p-2 text-sm"
                value={source1Type}
                onChange={(e) => setSource1Type(e.target.value)}
              >
                <option value="HANA">HANA</option>
                <option value="Snowflake">Snowflake</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="source1AccountSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Account:
              </label>
              <select
                id="source1AccountSelect"
                className="w-full rounded border border-gray-300 p-2 text-sm"
                value={selectedSource1Account}
                onChange={(e) => setSelectedSource1Account(e.target.value)}
              >
                {source1Accounts.length === 0 ? (
                  <option value="">No saved accounts</option>
                ) : (
                  source1Accounts.map((account) => (
                    <option key={account.name} value={account.name}>
                      {account.name}
                    </option>
                  ))
                )}
              </select>
              {source1Accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please add an account in the Account Manager
                </p>
              )}
            </div>

            {/* Fields based on comparison type */}
            {(comparisonType === "primaryKey" || comparisonType === "columnLevel") && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="source1SchemaName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source1SchemaName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1TableName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source1TableName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1PrimaryKey"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Primary Key:
                  </label>
                  <input
                    type="text"
                    id="source1PrimaryKey"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {comparisonType === "tableStructure" && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="source1SchemaName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source1SchemaName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1TableName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source1TableName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {comparisonType === "sqlQuery" && (
              <div>
                <label
                  htmlFor="source1SQLQuery"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  SQL Query:
                </label>
                <textarea
                  id="source1SQLQuery"
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                  rows={6}
                ></textarea>
              </div>
            )}
          </div>

          {/* Source 2 */}
          <div
            className="bg-white rounded-lg shadow-sm p-4 border border-green-100"
          >
            <div className="mb-3 pb-2 border-b border-gray-100">
              <h2 className="text-md font-semibold text-green-700">
                Source 2
              </h2>
            </div>

            <div className="mb-4">
              <label
                htmlFor="source2Type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Source Type:
              </label>
              <select
                id="source2Type"
                className="w-full rounded border border-gray-300 p-2 text-sm"
                value={source2Type}
                onChange={(e) => setSource2Type(e.target.value)}
              >
                <option value="HANA">HANA</option>
                <option value="Snowflake">Snowflake</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="source2AccountSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Account:
              </label>
              <select
                id="source2AccountSelect"
                className="w-full rounded border border-gray-300 p-2 text-sm"
                value={selectedSource2Account}
                onChange={(e) => setSelectedSource2Account(e.target.value)}
              >
                {source2Accounts.length === 0 ? (
                  <option value="">No saved accounts</option>
                ) : (
                  source2Accounts.map((account) => (
                    <option key={account.name} value={account.name}>
                      {account.name}
                    </option>
                  ))
                )}
              </select>
              {source2Accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please add an account in the Account Manager
                </p>
              )}
            </div>

            {/* Fields based on comparison type */}
            {(comparisonType === "primaryKey" || comparisonType === "columnLevel") && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="source2SchemaName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source2SchemaName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2TableName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source2TableName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2PrimaryKey"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Primary Key:
                  </label>
                  <input
                    type="text"
                    id="source2PrimaryKey"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {comparisonType === "tableStructure" && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="source2SchemaName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source2SchemaName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2TableName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source2TableName"
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {comparisonType === "sqlQuery" && (
              <div>
                <label
                  htmlFor="source2SQLQuery"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  SQL Query:
                </label>
                <textarea
                  id="source2SQLQuery"
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                  rows={6}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition"
            onClick={handleCompare}
            disabled={source1Accounts.length === 0 || source2Accounts.length === 0}
          >
            Compare Data
          </button>
        </div>
      </div>
    </div>
  );
}