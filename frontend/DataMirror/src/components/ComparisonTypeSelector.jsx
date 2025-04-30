import React from "react";

export default function ComparisonTypeSelector({ comparisonType, setComparisonType }) {
  return (
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
  );
}