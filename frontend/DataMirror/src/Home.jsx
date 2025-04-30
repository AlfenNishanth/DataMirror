import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComparisonTypeSelector from "./components/ComparisonTypeSelector";
import SourcePanel from "./components/SourcePanel";
import { compareTables } from "./api";
export default function Home() {
  const navigate = useNavigate();
  const [comparisonType, setComparisonType] = useState("primaryKey");

  const [source1Type, setSource1Type] = useState("HANA");
  const [source1Accounts, setSource1Accounts] = useState([]);
  const [selectedSource1Account, setSelectedSource1Account] = useState("");

  const [source2Type, setSource2Type] = useState("Snowflake");
  const [source2Accounts, setSource2Accounts] = useState([]);
  const [selectedSource2Account, setSelectedSource2Account] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSource1Accounts = JSON.parse(
      localStorage.getItem(`${source1Type}Accounts`) || "[]"
    );
    setSource1Accounts(savedSource1Accounts);
    setSelectedSource1Account(
      savedSource1Accounts.length > 0 ? savedSource1Accounts[0].name : ""
    );
  }, [source1Type]);

  useEffect(() => {
    const savedSource2Accounts = JSON.parse(
      localStorage.getItem(`${source2Type}Accounts`) || "[]"
    );
    setSource2Accounts(savedSource2Accounts);
    setSelectedSource2Account(
      savedSource2Accounts.length > 0 ? savedSource2Accounts[0].name : ""
    );
  }, [source2Type]);

  const handleCompare = async () => {
    const source1Account = source1Accounts.find(
      (account) => account.name === selectedSource1Account
    );
    const source2Account = source2Accounts.find(
      (account) => account.name === selectedSource2Account
    );

    if (!source1Account || !source2Account) {
      alert("Please select valid accounts for both sources");
      return;
    }

    // Get values from form fields based on comparison type
    let tableInfo = {};

    if (comparisonType === "primaryKey" || comparisonType === "columnLevel") {
      const schema1 = document.getElementById("source1SchemaName").value;
      const table1 = document.getElementById("source1TableName").value;
      const pk1 = document.getElementById("source1PrimaryKey").value;

      const schema2 = document.getElementById("source2SchemaName").value;
      const table2 = document.getElementById("source2TableName").value;
      const pk2 = document.getElementById("source2PrimaryKey").value;

      if (!schema1 || !table1 || !pk1 || !schema2 || !table2 || !pk2) {
        alert("Please fill in all required fields");
        return;
      }

      tableInfo = {
        schema_name1: schema1,
        table_name1: table1,
        id_field1: pk1,
        schema_name2: schema2,
        table_name2: table2,
        id_field2: pk2,
        column_level_comparison: comparisonType === "columnLevel",
      };
    } else if (comparisonType === "tableStructure") {
      const schema1 = document.getElementById("source1SchemaName").value;
      const table1 = document.getElementById("source1TableName").value;

      const schema2 = document.getElementById("source2SchemaName").value;
      const table2 = document.getElementById("source2TableName").value;

      if (!schema1 || !table1 || !schema2 || !table2) {
        alert("Please fill in all required fields");
        return;
      }

      tableInfo = {
        schema_name1: schema1,
        table_name1: table1,
        schema_name2: schema2,
        table_name2: table2,
      };
    } else if (comparisonType === "sqlQuery") {
      const query1 = document.getElementById("source1SQLQuery").value;
      const query2 = document.getElementById("source2SQLQuery").value;

      if (!query1 || !query2) {
        alert("Please provide SQL queries for both sources");
        return;
      }

      tableInfo = {
        query1: query1,
        query2: query2,
      };
    }

    // Build the payload
    const payload = {
      source1: source1Type.toUpperCase(),
      source1_connection: source1Account,
      source2: source2Type.toUpperCase(),
      source2_connection: source2Account,
      table_info: tableInfo,
      comparison_type: comparisonType,
    };

    try {
      // Show loading indicator or disable button
      setIsLoading(true);

      // Call the API
      const result = await compareTables(payload);

      // Process the results
      console.log("Comparison result:", result);

      // Navigate to results page with the data
      navigate("/results", { state: { result } });
    } catch (error) {
      console.error("Error comparing data:", error);
      alert(`Error: ${error.error || "An unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageAccounts = () => {
    navigate("/manage-accounts");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">DataMirror</h1>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition"
            onClick={handleManageAccounts}
          >
            Manage Accounts
          </button>
        </header>

        {/* Comparison Options */}
        <ComparisonTypeSelector
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
        />

        {/* Sources Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SourcePanel
            sourceNumber={1}
            sourceType={source1Type}
            setSourceType={setSource1Type}
            accounts={source1Accounts}
            selectedAccount={selectedSource1Account}
            setSelectedAccount={setSelectedSource1Account}
            comparisonType={comparisonType}
            borderColor="blue"
            titleColor="blue"
          />

          <SourcePanel
            sourceNumber={2}
            sourceType={source2Type}
            setSourceType={setSource2Type}
            accounts={source2Accounts}
            selectedAccount={selectedSource2Account}
            setSelectedAccount={setSelectedSource2Account}
            comparisonType={comparisonType}
            borderColor="green"
            titleColor="green"
          />
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition"
            onClick={handleCompare}
            disabled={
              source1Accounts.length === 0 ||
              source2Accounts.length === 0 ||
              isLoading
            }
          >
            {isLoading ? "Processing..." : "Compare Data"}
          </button>

          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition"
            onClick={handleCompare}
            disabled={source1Accounts.length === 0 || source2Accounts.length === 0}
          >
            Compare Data
          </button> */}
        </div>
      </div>
    </div>
  );
}
