import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SystemSourceCard } from './components/SystemSourceCard';
import { ComparisonTables } from './components/ComparisonTables';

export default function ExecResult() {
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  const [viewMode, setViewMode] = useState('mismatches'); // 'mismatches' or 'missing'
  
  useEffect(() => {
    try {
      if (location.state && location.state.result) {
        console.log('useLoc is available')
        setData(location.state.result);
        console.log(data);
        const now = new Date();
        setTimestamp(now.toLocaleString());
        setLoading(false);
      } 
      else{
       console.warn("No result data found in location state, using sample data");
      const sampleData = {
        "total_in_system1": 20,
        "total_in_system2": 21,
        "common_ids": 20,
        "no_missing_in_system_1": 1,
        "no_missing_in_system_2": 0,
        "no_mismatched_records": 2,
        "missing_in_system1": [
            15
        ],
        "missing_in_system2": [],
        "mismatched_ids": [
            2,
            1
        ],
        "total_differences": 3,
        "source_system_1": "HANA",
        "source_system_2": "SF",
        "table_name1": "EMPLOYEE4",
        "table_name2": "TST_ALFEN",
        "schema_name_1": "ANISHANTH",
        "schema_name_2": "ILMN_SFDC",
        "id_field1": "EMPID",
        "id_field2": "EMPID",
        "column_count": 9,
        "execution_time": {
            "system1_query": 0.03125786781311035,
            "system2_query": 0.10994887351989746,
            "comparison": 0.0,
            "total": 1.6615941524505615
        },
        "detailed_comparison": {
            "column_details": {
                "common_columns": [
                    "ADDRESS",
                    "BIRTHDATE",
                    "DEPARTMENT",
                    "DESIGNATION",
                    "EMAIL",
                    "JOINDATE",
                    "NAME",
                    "PHONE",
                    "SALARY"
                ]
            },
            "mismatched_records": [
                {
                    "id": 1,
                    "different_fields": [
                        "DESIGNATION",
                        "SALARY"
                    ],
                    "source1_data": {
                        "ADDRESS": "SAMPLE 123 Main St, City",
                        "BIRTHDATE": "1985-05-15",
                        "DEPARTMENT": "Sales",
                        "DESIGNATION": "PROMOTED",
                        "EMAIL": "john.doe@example.com",
                        "JOINDATE": "2010-01-10",
                        "NAME": "John Doe",
                        "PHONE": "123-456-7890",
                        "SALARY": "100000"
                    },
                    "source2_data": {
                        "ADDRESS": " SAMPLE 123 Main St, City",
                        "BIRTHDATE": "1985-05-15",
                        "DEPARTMENT": "Sales",
                        "DESIGNATION": "Manager",
                        "EMAIL": "john.doe@example.com",
                        "JOINDATE": "2010-01-10",
                        "NAME": "John Doe",
                        "PHONE": "123-456-7890",
                        "SALARY": "75000.00"
                    }
                },
                {
                    "id": 2,
                    "different_fields": [
                        "DESIGNATION"
                    ],
                    "source1_data": {
                        "ADDRESS": "SAMPLE 456 Elm St, Town",
                        "BIRTHDATE": "1990-08-22",
                        "DEPARTMENT": "Marketing",
                        "DESIGNATION": "PROMOTED",
                        "EMAIL": "jane.smith@example.com",
                        "JOINDATE": "2015-02-20",
                        "NAME": "Jane Smith",
                        "PHONE": "987-654-3210",
                        "SALARY": "60000"
                    },
                    "source2_data": {
                        "ADDRESS": " SAMPLE 456 Elm St, Town",
                        "BIRTHDATE": "1990-08-22",
                        "DEPARTMENT": "Marketing",
                        "DESIGNATION": "Supervisor",
                        "EMAIL": "jane.smith@example.com",
                        "JOINDATE": "2015-02-20",
                        "NAME": "Jane Smith",
                        "PHONE": "987-654-3210",
                        "SALARY": "60000.00"
                    }
                }
            ]
        }
      };
      
      setData(sampleData);
      console.log('sampleData - ');
      console.log(data);
      const now = new Date();
      setTimestamp(now.toLocaleString());
      setLoading(false);
    }
    } catch (err) {
      setError('Failed to load comparison data');
      setLoading(false);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 p-4 rounded-lg text-red-700 shadow-sm">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!data) return null;
  
  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Data Comparison Results
            </h1>
            <span className="text-sm font-normal text-gray-500">
              {timestamp}
            </span>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Source System 1 Card */}
          <SystemSourceCard data={data} systemNumber={1} />
          
          {/* Source System 2 Card */}
          <SystemSourceCard data={data} systemNumber={2} />
        </div>

        {/* Comparison Results with Toggle Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Comparison Results</h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                {data.mismatched_ids.length} Mismatched Records
              </span>
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                {data.total_differences} Total Differences
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mb-3">
            <span>Common Columns: {data.column_count}</span>
            <span>Total Execution Time: {data.execution_time.total.toFixed(2)}s</span>
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setViewMode('mismatches')} 
              className={`px-3 py-1 text-sm rounded-md transition ${
                viewMode === 'mismatches' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mismatches
            </button>
            <button 
              onClick={() => setViewMode('missing')} 
              className={`px-3 py-1 text-sm rounded-md transition ${
                viewMode === 'missing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Missing Records
            </button>
          </div>
        </div>
        
        {/* Tables Component */}
        <ComparisonTables data={data} viewMode={viewMode} />
      </div>
    </div>
  );
}