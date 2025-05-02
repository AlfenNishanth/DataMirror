import React from "react";

export default function SourcePanel({
  sourceNumber,
  sourceType,
  setSourceType,
  accounts,
  selectedAccount,
  setSelectedAccount,
  comparisonType,
  borderColor,
  titleColor
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border border-${borderColor}-100`}
    >
      <div className="mb-3 pb-2 border-b border-gray-100">
        <h2 className={`text-md font-semibold text-${titleColor}-700`}>
          Source {sourceNumber}
        </h2>
      </div>

      <div className="mb-4">
        <label
          htmlFor={`source${sourceNumber}Type`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Source Type:
        </label>
        <select
          id={`source${sourceNumber}Type`}
          className="w-full rounded border border-gray-300 p-2 text-sm"
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          <option value="HANA">HANA</option>
          <option value="Snowflake">Snowflake</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor={`source${sourceNumber}AccountSelect`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Account:
        </label>
        <select
          id={`source${sourceNumber}AccountSelect`}
          className="w-full rounded border border-gray-300 p-2 text-sm"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.length === 0 ? (
            <option value="">No saved accounts</option>
          ) : (
            accounts.map((account) => (
              <option key={account.name} value={account.name}>
                {account.name}
              </option>
            ))
          )}
        </select>
        {accounts.length === 0 && (
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
              htmlFor={`source${sourceNumber}SchemaName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Schema Name:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}SchemaName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNumber}TableName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Table Name:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}TableName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNumber}PrimaryKey`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Primary Key:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}PrimaryKey`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      )}

      {comparisonType === "tableStructure" && (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`source${sourceNumber}SchemaName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Schema Name:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}SchemaName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`source${sourceNumber}TableName`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Table Name:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}TableName`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      )}

      {comparisonType === "sqlQuery" && (
        <div>
          <div>
            <label
              htmlFor={`source${sourceNumber}PrimaryKey`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Primary Key:
            </label>
            <input
              type="text"
              id={`source${sourceNumber}PrimaryKey`}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
          <label
            htmlFor={`source${sourceNumber}SQLQuery`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SQL Query:
          </label>
          <textarea
            id={`source${sourceNumber}SQLQuery`}
            className="w-full rounded border border-gray-300 p-2 text-sm"
            rows={6}
          ></textarea>
        </div>
      )}
    </div>
  );
}