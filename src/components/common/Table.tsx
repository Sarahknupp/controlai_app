import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}

/**
 * Componente de tabela reutilizável
 * @component
 * @template T
 * @param {TableProps<T>} props - Propriedades do componente
 * @returns {JSX.Element} Tabela estilizada
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  className = ''
}: TableProps<T>) {
  const handleSort = (columnKey: string) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(data.map(item => String(keyExtractor(item))));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (onSelectionChange) {
      if (selectedItems.includes(itemId)) {
        onSelectionChange(selectedItems.filter(id => id !== itemId));
      } else {
        onSelectionChange([...selectedItems, itemId]);
      }
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (columnKey !== sortColumn) return <ChevronsUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th scope="col" className="relative px-6 py-3 w-12">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedItems.length === data.length}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer select-none' : ''}
                  ${column.width ? `w-${column.width}` : ''}
                `}
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="text-gray-400">
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(item => {
            const itemId = String(keyExtractor(item));
            return (
              <tr
                key={itemId}
                className={`
                  ${selectable ? 'hover:bg-gray-50 cursor-pointer' : ''}
                  ${selectedItems.includes(itemId) ? 'bg-blue-50' : ''}
                `}
                onClick={selectable ? () => handleSelectItem(itemId) : undefined}
              >
                {selectable && (
                  <td className="relative px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(itemId)}
                      onChange={() => handleSelectItem(itemId)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={`${itemId}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 