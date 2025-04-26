import { useState, useEffect } from "react";

export default function ExecInput() {
  const [targetType, setTargetType] = useState("tableName");
  const [source1Type, setSource1Type] = useState("HANA");
  const [source2Type, setSource2Type] = useState("Snowflake");
  const [primaryKeyComparison, setPrimaryKeyComparison] = useState(false);
  const [columnLevelComparison, setColumnLevelComparison] = useState(false);

  const handleCompare = () => {
    // This would be replaced with actual comparison logic
    console.log("Comparing data...");
    // Here you would typically make an API call to initiate the comparison
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Data Comparison Tool
          </h1>
        </header>

        {/* Comparison Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
          <h2 className="text-md font-semibold mb-3 text-gray-700">
            Comparison Options
          </h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="primaryKeyComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                checked={primaryKeyComparison}
                onChange={(e) => setPrimaryKeyComparison(e.target.checked)}
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
                type="checkbox"
                id="columnLevelComparison"
                className="mr-2 h-4 w-4 text-blue-600"
                checked={columnLevelComparison}
                onChange={(e) => setColumnLevelComparison(e.target.checked)}
              />
              <label
                htmlFor="columnLevelComparison"
                className="text-sm text-gray-700"
              >
                Column-level Comparison
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="targetType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target Type:
            </label>
            <select
              id="targetType"
              className="w-full rounded border border-gray-300 p-2 text-sm"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
            >
              <option value="tableName">Table Name</option>
              <option value="sqlQuery">SQL Query</option>
            </select>
          </div>
        </div>

        {/* Sources Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Source 1 */}
          <Source
            sourceNum={1}
            sourceType={source1Type}
            setSourceType={setSource1Type}
            targetType={targetType}
          />

          {/* Source 2 */}
          <Source
            sourceNum={2}
            sourceType={source2Type}
            setSourceType={setSource2Type}
            targetType={targetType}
          />
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition"
            onClick={handleCompare}
          >
            Compare Data
          </button>
        </div>
      </div>
    </div>
  );
}

// Source Component
function Source({ sourceNum, sourceType, setSourceType, targetType }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border ${
        sourceNum === 1 ? "border-blue-100" : "border-green-100"
      }`}
    >
      <div className="mb-3 pb-2 border-b border-gray-100">
        <h2
          className={`text-md font-semibold ${
            sourceNum === 1 ? "text-blue-700" : "text-green-700"
          }`}
        >
          Source {sourceNum}
        </h2>
      </div>

      <div className="mb-4">
        <label
          htmlFor={`source${sourceNum}Type`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Database Type:
        </label>
        <select
          id={`source${sourceNum}Type`}
          className="w-full rounded border border-gray-300 p-2 text-sm"
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          <option value="HANA">HANA</option>
          <option value="Snowflake">Snowflake</option>
        </select>
      </div>

      {/* Database Connection Fields */}
      {sourceType === "HANA" ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`source${sourceNum}HANAAddress`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address:
            </label>
            <input
              type="text"
              id={`source${sourceNum}HANAAddress`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}HANAPort`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Port:
            </label>
            <input
              type="text"
              id={`source${sourceNum}HANAPort`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}HANAUser`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User:
            </label>
            <input
              type="text"
              id={`source${sourceNum}HANAUser`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}HANAPassword`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password:
            </label>
            <input
              type="password"
              id={`source${sourceNum}HANAPassword`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakeUser`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SnowflakeUser`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakePassword`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password:
            </label>
            <input
              type="password"
              id={`source${sourceNum}SnowflakePassword`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakeAccount`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SnowflakeAccount`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakeDatabase`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Database:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SnowflakeDatabase`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakeWarehouse`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Warehouse:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SnowflakeWarehouse`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}SnowflakeRole`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SnowflakeRole`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Target Fields */}
      {targetType === "tableName" ? (
        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor={`source${sourceNum}SchemaName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Schema Name:
            </label>
            <input
              type="text"
              id={`source${sourceNum}SchemaName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}TableName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Table Name:
            </label>
            <input
              type="text"
              id={`source${sourceNum}TableName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNum}PrimaryKey`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Primary Key:
            </label>
            <input
              type="text"
              id={`source${sourceNum}PrimaryKey`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <label
            htmlFor={`source${sourceNum}SQLQuery`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SQL Query:
          </label>
          <textarea
            id={`source${sourceNum}SQLQuery`}
            className="w-full rounded border border-gray-300 p-2 text-sm"
            rows={6}
          ></textarea>
        </div>
      )}
    </div>
  );
}
