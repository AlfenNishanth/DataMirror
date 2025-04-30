import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home_Designed() {
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
    console.log("Comparing data...");
  };

  const handleManageAccounts = () => {
    navigate("/manage-accounts");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-6 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-20 -mt-32 -mr-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200 to-orange-300 rounded-full opacity-20 -mb-48 -ml-48"></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
              Data Comparison Tool
            </h1>
          </div>
          <button
            className="bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-800 py-2 px-5 rounded-full text-sm font-medium transition shadow-sm flex items-center border border-amber-200"
            onClick={handleManageAccounts}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Accounts
          </button>
        </header>

        {/* Comparison Options */}
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 border border-amber-100 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-amber-100 to-orange-100 rounded-bl-full opacity-50"></div>
          
          <h2 className="text-lg font-semibold mb-4 text-amber-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Comparison Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div className="flex items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
              <input
                type="radio"
                id="primaryKeyComparison"
                className="mr-3 h-4 w-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                name="comparisonType"
                value="primaryKey"
                checked={comparisonType === "primaryKey"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="primaryKeyComparison"
                className="text-sm text-amber-900 font-medium"
              >
                Primary Key Comparison
              </label>
            </div>

            <div className="flex items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
              <input
                type="radio"
                id="columnLevelComparison"
                className="mr-3 h-4 w-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                name="comparisonType"
                value="columnLevel"
                checked={comparisonType === "columnLevel"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="columnLevelComparison"
                className="text-sm text-amber-900 font-medium"
              >
                Column-level Comparison
              </label>
            </div>

            <div className="flex items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
              <input
                type="radio"
                id="tableStructureComparison"
                className="mr-3 h-4 w-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                name="comparisonType"
                value="tableStructure"
                checked={comparisonType === "tableStructure"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="tableStructureComparison"
                className="text-sm text-amber-900 font-medium"
              >
                Table Structure Comparison
              </label>
            </div>

            <div className="flex items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
              <input
                type="radio"
                id="sqlQueryComparison"
                className="mr-3 h-4 w-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                name="comparisonType"
                value="sqlQuery"
                checked={comparisonType === "sqlQuery"}
                onChange={(e) => setComparisonType(e.target.value)}
              />
              <label
                htmlFor="sqlQueryComparison"
                className="text-sm text-amber-900 font-medium"
              >
                SQL Query Comparison
              </label>
            </div>
          </div>
        </div>

        {/* Sources Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Source 1 */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 border border-amber-100 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 h-24 w-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-br-full opacity-40"></div>
            <div className="absolute bottom-0 right-0 h-20 w-20 bg-gradient-to-tl from-blue-100 to-blue-200 rounded-tl-full opacity-40"></div>
            
            <div className="mb-4 pb-3 border-b border-blue-100 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-blue-700">
                Source 1
              </h2>
            </div>

            <div className="mb-4 relative z-10">
              <label
                htmlFor="source1Type"
                className="block text-sm font-medium text-blue-700 mb-1"
              >
                Source Type:
              </label>
              <div className="relative">
                <select
                  id="source1Type"
                  className="w-full rounded-lg border border-blue-200 p-2 text-sm pr-8 bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  value={source1Type}
                  onChange={(e) => setSource1Type(e.target.value)}
                >
                  <option value="HANA">HANA</option>
                  <option value="Snowflake">Snowflake</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-4 relative z-10">
              <label
                htmlFor="source1AccountSelect"
                className="block text-sm font-medium text-blue-700 mb-1"
              >
                Select Account:
              </label>
              <div className="relative">
                <select
                  id="source1AccountSelect"
                  className="w-full rounded-lg border border-blue-200 p-2 text-sm pr-8 bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {source1Accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please add an account in the Account Manager
                </p>
              )}
            </div>

            {/* Fields based on comparison type */}
            {(comparisonType === "primaryKey" || comparisonType === "columnLevel") && (
              <div className="space-y-3 relative z-10">
                <div>
                  <label
                    htmlFor="source1SchemaName"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source1SchemaName"
                    className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1TableName"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source1TableName"
                    className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1PrimaryKey"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Primary Key:
                  </label>
                  <input
                    type="text"
                    id="source1PrimaryKey"
                    className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {comparisonType === "tableStructure" && (
              <div className="space-y-3 relative z-10">
                <div>
                  <label
                    htmlFor="source1SchemaName"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source1SchemaName"
                    className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source1TableName"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source1TableName"
                    className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {comparisonType === "sqlQuery" && (
              <div className="relative z-10">
                <label
                  htmlFor="source1SQLQuery"
                  className="block text-sm font-medium text-blue-700 mb-1"
                >
                  SQL Query:
                </label>
                <textarea
                  id="source1SQLQuery"
                  className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-blue-50 bg-opacity-50 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                ></textarea>
              </div>
            )}
          </div>

          {/* Source 2 */}
          <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 border border-amber-100 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 h-24 w-24 bg-gradient-to-br from-green-100 to-green-200 rounded-br-full opacity-40"></div>
            <div className="absolute bottom-0 right-0 h-20 w-20 bg-gradient-to-tl from-green-100 to-green-200 rounded-tl-full opacity-40"></div>
            
            <div className="mb-4 pb-3 border-b border-green-100 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold text-green-700">
                Source 2
              </h2>
            </div>

            <div className="mb-4 relative z-10">
              <label
                htmlFor="source2Type"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Source Type:
              </label>
              <div className="relative">
                <select
                  id="source2Type"
                  className="w-full rounded-lg border border-green-200 p-2 text-sm pr-8 bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  value={source2Type}
                  onChange={(e) => setSource2Type(e.target.value)}
                >
                  <option value="HANA">HANA</option>
                  <option value="Snowflake">Snowflake</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-4 relative z-10">
              <label
                htmlFor="source2AccountSelect"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Select Account:
              </label>
              <div className="relative">
                <select
                  id="source2AccountSelect"
                  className="w-full rounded-lg border border-green-200 p-2 text-sm pr-8 bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {source2Accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please add an account in the Account Manager
                </p>
              )}
            </div>

            {/* Fields based on comparison type */}
            {(comparisonType === "primaryKey" || comparisonType === "columnLevel") && (
              <div className="space-y-3 relative z-10">
                <div>
                  <label
                    htmlFor="source2SchemaName"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source2SchemaName"
                    className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2TableName"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source2TableName"
                    className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2PrimaryKey"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Primary Key:
                  </label>
                  <input
                    type="text"
                    id="source2PrimaryKey"
                    className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {comparisonType === "tableStructure" && (
              <div className="space-y-3 relative z-10">
                <div>
                  <label
                    htmlFor="source2SchemaName"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Schema Name:
                  </label>
                  <input
                    type="text"
                    id="source2SchemaName"
                    className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="source2TableName"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Table Name:
                  </label>
                  <input
                    type="text"
                    id="source2TableName"
                    className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {comparisonType === "sqlQuery" && (
              <div className="relative z-10">
                <label
                  htmlFor="source2SQLQuery"
                  className="block text-sm font-medium text-green-700 mb-1"
                >
                  SQL Query:
                </label>
                <textarea
                  id="source2SQLQuery"
                  className="w-full rounded-lg border border-green-200 p-2 text-sm bg-green-50 bg-opacity-50 focus:ring-green-500 focus:border-green-500"
                  rows={6}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 px-8 rounded-full text-sm font-medium transition shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-orange-600"
            onClick={handleCompare}
            disabled={source1Accounts.length === 0 || source2Accounts.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Compare Data
          </button>
        </div>
      </div>
    </div>
  );
}