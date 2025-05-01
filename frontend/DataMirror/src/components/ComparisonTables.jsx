import React, { useEffect, useRef } from 'react';

export function ComparisonTables({ data, viewMode }) {
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);
  
  // Synchronize scrolling between the two tables
  useEffect(() => {
    if (viewMode !== 'mismatches') return;
    
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
  }, [data, viewMode]);

  const hasMissingRecords = 
    (data.missing_in_system1 && data.missing_in_system1.length > 0) || 
    (data.missing_in_system2 && data.missing_in_system2.length > 0);

  if (viewMode === 'mismatches') {
    return (
      <div className="flex flex-col">
        <h2 className="text-md font-semibold mb-3">Detailed Record Comparison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left Table - Source 1 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-blue-50 px-3 py-2 font-medium text-sm">
              {data.source_system_1} - {data.table_name1}
            </div>
            <div 
              ref={leftTableRef} 
              className="overflow-auto"
              style={{ maxHeight: "500px" }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      {data.id_field1}
                    </th>
                    {data.detailed_comparison.column_details.common_columns.map((column) => (
                      <th 
                        key={column} 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.detailed_comparison.mismatched_records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        {record.id}
                      </td>
                      {data.detailed_comparison.column_details.common_columns.map((column) => (
                        <td 
                          key={column} 
                          className={`px-3 py-2 whitespace-nowrap text-sm text-gray-500 ${
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
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-green-50 px-3 py-2 font-medium text-sm">
              {data.source_system_2} - {data.table_name2}
            </div>
            <div 
              ref={rightTableRef} 
              className="overflow-auto"
              style={{ maxHeight: "500px" }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      {data.id_field2}
                    </th>
                    {data.detailed_comparison.column_details.common_columns.map((column) => (
                      <th 
                        key={column} 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.detailed_comparison.mismatched_records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        {record.id}
                      </td>
                      {data.detailed_comparison.column_details.common_columns.map((column) => (
                        <td 
                          key={column} 
                          className={`px-3 py-2 whitespace-nowrap text-sm text-gray-500 ${
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
        <div className="mt-3 flex items-center text-xs">
          <div className="w-3 h-3 bg-red-100 mr-2"></div>
          <span className="text-gray-600">Highlighted cells indicate mismatched values</span>
        </div>
      </div>
    );
  } else {
    // Missing Records View
    return (
      <div className="flex flex-col">
        <h2 className="text-md font-semibold mb-3">Missing Records</h2>
        
        {!hasMissingRecords ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500">
            No missing records found in either system
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Missing in System 1 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-3 py-2 font-medium text-sm">
                Missing Records in {data.source_system_1}
              </div>
              <div className="p-3">
                {data.missing_in_system1.length === 0 ? (
                  <p className="text-sm text-gray-500">No missing records</p>
                ) : (
                  <ol className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {data.missing_in_system1.map((id) => (
                      <li key={id} className="px-2 py-1 bg-gray-50 rounded">
                        {id}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
            
            {/* Missing in System 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-green-50 px-3 py-2 font-medium text-sm">
                Missing Records in {data.source_system_2}
              </div>
              <div className="p-3">
                {data.missing_in_system2.length === 0 ? (
                  <p className="text-sm text-gray-500">No missing records</p>
                ) : (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {data.missing_in_system2.map((id) => (
                      <li key={id} className="px-2 py-1 bg-gray-50 rounded">
                        ID: {id}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}