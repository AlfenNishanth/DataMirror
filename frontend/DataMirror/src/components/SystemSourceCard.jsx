import React from 'react';

export function SystemSourceCard({ data, systemNumber }) {
  const isSystem1 = systemNumber === 1;
  const sourceSystem = isSystem1 ? data.source_system_1 : data.source_system_2;
  const schemaName = isSystem1 ? data.schema_name_1 : data.schema_name_2;
  const tableName = isSystem1 ? data.table_name1 : data.table_name2;
  const idField = isSystem1 ? data.id_field1 : data.id_field2;
  const totalRecords = isSystem1 ? data.total_in_system1 : data.total_in_system2;
  const missingRecords = isSystem1 ? data.missing_in_system1.length : data.missing_in_system2.length;
  const queryTime = isSystem1 ? data.execution_time.system1_query : data.execution_time.system2_query;
  const colorClass = isSystem1 ? 'blue' : 'green';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className={`text-lg font-semibold text-${colorClass}-700`}>
          {sourceSystem} - {schemaName}.{tableName}
        </h2>
        <p className="text-sm text-gray-500">Source System {systemNumber}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-${colorClass}-50 p-3 rounded-md`}>
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-xl font-semibold">{totalRecords}</p>
        </div>
        
        <div className={`bg-${colorClass}-50 p-3 rounded-md`}>
          <p className="text-sm text-gray-600">ID Field</p>
          <p className="text-xl font-semibold">{idField}</p>
        </div>
        
        <div className={`bg-${colorClass}-50 p-3 rounded-md`}>
          <p className="text-sm text-gray-600">Missing Records</p>
          <p className="text-xl font-semibold">{missingRecords}</p>
        </div>
        
        <div className={`bg-${colorClass}-50 p-3 rounded-md`}>
          <p className="text-sm text-gray-600">Query Time</p>
          <p className="text-xl font-semibold">{queryTime.toFixed(2)}s</p>
        </div>
      </div>
    </div>
  );
}