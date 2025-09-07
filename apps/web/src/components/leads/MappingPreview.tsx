import React from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldMapping {
  sourceHeader: string
  targetField: string | null
  confidence: number
}

interface MappingPreviewProps {
  mappings: FieldMapping[]
  unmappedFields: string[]
  sampleData: Record<string, any>[]
  totalRows: number
  onConfirm: (mappingOverrides?: Record<string, string>) => void
  onCancel: () => void
}

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  businessName: 'Business Name',
  requestedAmount: 'Requested Amount',
  monthlyRevenue: 'Monthly Revenue',
  industry: 'Industry'
}

export default function MappingPreview({
  mappings,
  unmappedFields,
  sampleData,
  totalRows,
  onConfirm,
  onCancel
}: MappingPreviewProps) {
  const [mappingOverrides, setMappingOverrides] = React.useState<Record<string, string>>({})

  const handleFieldChange = (sourceHeader: string, newTarget: string | 'unmapped') => {
    if (newTarget === 'unmapped') {
      setMappingOverrides(prev => ({
        ...prev,
        [sourceHeader]: null as any
      }))
    } else {
      setMappingOverrides(prev => ({
        ...prev,
        [sourceHeader]: newTarget
      }))
    }
  }


  const availableFields = Object.keys(FIELD_LABELS)
  const mappedTargetFields = new Set(
    mappings
      .map(m => mappingOverrides[m.sourceHeader] || m.targetField)
      .filter(Boolean)
  )

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Review Column Mappings
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Review how your spreadsheet columns will be mapped to lead fields.
          </p>
        </div>
      </div>

      <div className="p-6">

        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Your Column
                  </th>
                  <th className="px-4 py-4 text-center w-12">
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-auto" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Maps To
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Sample Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping, index) => {
                  const currentTarget = mappingOverrides[mapping.sourceHeader] !== undefined
                    ? mappingOverrides[mapping.sourceHeader]
                    : mapping.targetField
                  
                  const isUnmapped = !currentTarget

                  return (
                    <tr key={index} className={cn(
                      "transition-all duration-150 hover:bg-blue-50",
                      isUnmapped && "bg-gray-50"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {mapping.sourceHeader}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-center">
                        <ArrowRight className={cn(
                          "h-5 w-5 mx-auto transition-colors",
                          isUnmapped ? "text-gray-300" : "text-blue-500"
                        )} />
                      </td>
                      
                      <td className="px-6 py-4">
                        <select
                          className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          value={currentTarget || 'unmapped'}
                          onChange={(e) => handleFieldChange(mapping.sourceHeader, e.target.value)}
                        >
                          <option value="unmapped" className="text-gray-600 bg-white">
                            🗃️ Store as Extra Data
                          </option>
                          <optgroup label="📋 Lead Fields" className="text-gray-900 bg-white">
                            {availableFields.map(field => (
                              <option 
                                key={field} 
                                value={field}
                                disabled={mappedTargetFields.has(field) && currentTarget !== field}
                                className={`${mappedTargetFields.has(field) && currentTarget !== field ? 'text-gray-400 bg-gray-50' : 'text-gray-900 bg-white'}`}
                              >
                                {FIELD_LABELS[field]}
                                {mappedTargetFields.has(field) && currentTarget !== field && ' (already used)'}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                  </td>
                  
                      <td className="px-6 py-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-md">
                          <div className="text-sm text-gray-900 max-w-xs truncate font-mono">
                            {sampleData[0]?.[mapping.sourceHeader] || <span className="text-gray-500 italic">no data</span>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {unmappedFields.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-2">
                Extra Fields Detected
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                These fields don't match our standard lead fields but will be preserved as extra data.
              </p>
              <div className="flex flex-wrap gap-2">
                {unmappedFields.map(field => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span><span className="font-semibold text-gray-900">{totalRows}</span> rows ready to import</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span><span className="font-semibold text-gray-900">{mappings.filter(m => m.targetField).length}</span> fields mapped</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(mappingOverrides)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Import {totalRows} Leads
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}