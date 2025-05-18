/**
 * Table components for displaying data in a structured format
 * @module components/ui/table
 */

import React from 'react';

/**
 * Main table component that wraps all table elements
 * @component
 * @param {React.HTMLAttributes<HTMLTableElement>} props - Table HTML attributes
 * @returns {JSX.Element} Table component with overflow handling
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm ${className || ''}`}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

/**
 * Table header container component
 * @component
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - TableHeader HTML attributes
 * @returns {JSX.Element} Table header section with border styling
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b ${className || ''}`} {...props} />
));
TableHeader.displayName = "TableHeader";

/**
 * Table body container component
 * @component
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - TableBody HTML attributes
 * @returns {JSX.Element} Table body section with border styling for rows
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 ${className || ''}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

/**
 * Table row component
 * @component
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - TableRow HTML attributes
 * @returns {JSX.Element} Table row with hover and selection styling
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 ${className || ''}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/**
 * Table header cell component
 * @component
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - TableHead HTML attributes
 * @returns {JSX.Element} Table header cell with text alignment and font styling
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

/**
 * Table data cell component
 * @component
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - TableCell HTML attributes
 * @returns {JSX.Element} Table cell with padding and alignment styling
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
};