import { useEffect, useRef, useState } from 'react';

export default function Result() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);
  
  useEffect(() => {
    try {
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
                        "ADDRESS": "123 Main St, City",
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
                        "ADDRESS": "123 Main St, City",
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
                        "ADDRESS": "456 Elm St, Town",
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
                        "ADDRESS": "456 Elm St, Town",
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
      const now = new Date();
      setTimestamp(now.toLocaleString());
      setLoading(false);
    } catch (err) {
      setError('Failed to load comparison data');
      setLoading(false);
    }
  }, []);
  
  // Synchronize scrolling between the two tables
  useEffect(() => {
    const leftTable = leftTableRef.current;
    const rightTable = rightTableRef.current;
    
    if (!leftTable || !rightTable) return;
    
    const handleLeftScroll = () => {
      rightTable.scrollTop = leftTable.scrollTop;
      rightTable.scrollLeft = leftTable.scrollLeft;
    };
    
    const handleRightScroll = () => {
      leftTable.scrollTop = rightTable.scrollTop;
      leftTable.scrollLeft = rightTable.scrollLeft;
    };
    
    leftTable.addEventListener('scroll', handleLeftScroll);
    rightTable.addEventListener('scroll', handleRightScroll);
    
    return () => {
      leftTable.removeEventListener('scroll', handleLeftScroll);
      rightTable.removeEventListener('scroll', handleRightScroll);
    };
  }, [data]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!data) return null;
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Data Comparison Results
            <span className="text-sm font-normal text-gray-500 ml-2">
              {timestamp}
            </span>
          </h1>
        </header>
        

{/* new summary */}

       
        {/* Summary Section - More Modern/Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left Side - Source 1 */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
            <div className="mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-md font-semibold text-blue-700">
                {data.source_system_1} - {data.schema_name_1}.{data.table_name1}
              </h2>
              <p className="text-xs text-gray-500">Source System 1</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-xs text-gray-600">Total Records</span>
                <span className="text-md font-medium">{data.total_in_system1}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-xs text-gray-600">ID Field</span>
                <span className="text-md font-medium">{data.id_field1}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-xs text-gray-600">Missing Records</span>
                <span className="text-md font-medium">{data.missing_in_system1.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-xs text-gray-600">Query Time</span>
                <span className="text-md font-medium">{data.execution_time.system1_query.toFixed(2)}s</span>
              </div>
            </div>
          </div>
          
          {/* Right Side - Source 2 */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-100">
            <div className="mb-2 pb-2 border-b border-gray-100">
              <h2 className="text-md font-semibold text-green-700">
                {data.source_system_2} - {data.schema_name_2}.{data.table_name2}
              </h2>
              <p className="text-xs text-gray-500">Source System 2</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-xs text-gray-600">Total Records</span>
                <span className="text-md font-medium">{data.total_in_system2}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-xs text-gray-600">ID Field</span>
                <span className="text-md font-medium">{data.id_field2}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-xs text-gray-600">Missing Records</span>
                <span className="text-md font-medium">{data.missing_in_system2.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-xs text-gray-600">Query Time</span>
                <span className="text-md font-medium">{data.execution_time.system2_query.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>
 

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Side - Source 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-blue-700">
                {data.source_system_1} - {data.schema_name_1}.{data.table_name1}
              </h2>
              <p className="text-sm text-gray-500">Source System 1</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-semibold">{data.total_in_system1}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">ID Field</p>
                <p className="text-xl font-semibold">{data.id_field1}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Missing Records</p>
                <p className="text-xl font-semibold">{data.missing_in_system1.length}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Query Time</p>
                <p className="text-xl font-semibold">{data.execution_time.system1_query.toFixed(2)}s</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Source 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-green-700">
                {data.source_system_2} - {data.schema_name_2}.{data.table_name2}
              </h2>
              <p className="text-sm text-gray-500">Source System 2</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-semibold">{data.total_in_system2}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">ID Field</p>
                <p className="text-xl font-semibold">{data.id_field2}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Missing Records</p>
                <p className="text-xl font-semibold">{data.missing_in_system2.length}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Query Time</p>
                <p className="text-xl font-semibold">{data.execution_time.system2_query.toFixed(2)}s</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mismatched Records Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Comparison Results</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {data.mismatched_ids.length} Mismatched Records
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {data.total_differences} Total Differences
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Common Columns: {data.column_count}</span>
            <span>Total Execution Time: {data.execution_time.total.toFixed(2)}s</span>
          </div>
        </div>
        
        {/* Data Tables */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Detailed Record Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Table - Source 1 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-2 font-semibold">
                {data.source_system_1} - {data.table_name1}
              </div>
              <div 
                ref={leftTableRef} 
                className="overflow-auto max-h-96"
                style={{ maxHeight: "500px" }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        {data.id_field1}
                      </th>
                      {data.detailed_comparison.column_details.common_columns.map((column) => (
                        <th 
                          key={column} 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.detailed_comparison.mismatched_records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                          {record.id}
                        </td>
                        {data.detailed_comparison.column_details.common_columns.map((column) => (
                          <td 
                            key={column} 
                            className={`px-4 py-3 whitespace-nowrap text-sm text-gray-500 ${
                              record.different_fields.includes(column) ? 'bg-red-100' : ''
                            }`}
                          >
                            {record.source1_data[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Right Table - Source 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-100 px-4 py-2 font-semibold">
                {data.source_system_2} - {data.table_name2}
              </div>
              <div 
                ref={rightTableRef} 
                className="overflow-auto max-h-96"
                style={{ maxHeight: "500px" }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        {data.id_field2}
                      </th>
                      {data.detailed_comparison.column_details.common_columns.map((column) => (
                        <th 
                          key={column} 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.detailed_comparison.mismatched_records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                          {record.id}
                        </td>
                        {data.detailed_comparison.column_details.common_columns.map((column) => (
                          <td 
                            key={column} 
                            className={`px-4 py-3 whitespace-nowrap text-sm text-gray-500 ${
                              record.different_fields.includes(column) ? 'bg-red-100' : ''
                            }`}
                          >
                            {record.source2_data[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center text-sm">
            <div className="w-4 h-4 bg-red-100 mr-2"></div>
            <span className="text-gray-600">Highlighted cells indicate mismatched values</span>
          </div>
        </div>
      </div>
    </div>
  );
}