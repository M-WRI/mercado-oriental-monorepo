import { useState, useEffect, useCallback, useMemo } from "react";
import { useComponentWidth } from "../../hooks";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type RowSelectionState,
  type ExpandedState,
  type Row,
} from "@tanstack/react-table";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isMultiSelect?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T) => string;
  getSubRows?: (row: T) => T[] | undefined;
  defaultExpanded?: true | Record<string, boolean>;
  onRowClick?: (row: Row<T>) => void;
  rowClassName?: (row: Row<T>) => string;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  isMultiSelect = false,
  onSelectionChange,
  getRowId,
  getSubRows,
  defaultExpanded,
  onRowClick,
  rowClassName,
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpanded ?? {});

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  useEffect(() => {
    if (defaultExpanded) setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      setRowSelection((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    []
  );

  const checkboxColumn: ColumnDef<T> = useMemo(
    () => ({
      id: "_select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          checked={table.getIsAllRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomeRowsSelected();
          }}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => {
        if (!row.getCanSelect()) return null;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        );
      },
      meta: { className: "w-10" },
    }),
    []
  );

  const finalColumns = useMemo(
    () => (isMultiSelect ? [checkboxColumn, ...columns] : columns),
    [isMultiSelect, checkboxColumn, columns]
  );

  const table = useReactTable<T>({
    data,
    columns: finalColumns,
    state: { rowSelection, expanded },
    onRowSelectionChange: handleSelectionChange,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getSubRows ? getExpandedRowModel() : undefined,
    enableRowSelection: isMultiSelect
      ? (row) => row.depth === 0
      : false,
    enableSubRowSelection: false,
    getRowId: getRowId ?? ((row) => (row as any).id),
    getSubRows,
  });

  useEffect(() => {
    if (!onSelectionChange) return;
    const selected = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    onSelectionChange(selected);
  }, [rowSelection, onSelectionChange, table]);

  const { componentRef, componentWidth } = useComponentWidth();
  const isActions = (id: string) => id === "actions";
  const isSelect = (id: string) => id === "_select";
  const stickyActionsClass = "sticky right-0 z-10 bg-white";

  const hasCustomSize = (columnId: string, columnDef: ColumnDef<T>) => {
    const meta = columnDef.meta as { className?: string } | undefined;
    return meta?.className?.match(/\b(w-|min-w-|max-w-)/) != null
      || isSelect(columnId) || isActions(columnId);
  };

  const headerCellClass = (headerId: string, columnDef: ColumnDef<T>) =>
    `text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4 ${
      isSelect(headerId)
        ? "w-[44px] min-w-[44px]"
        : isActions(headerId)
          ? `w-[100px] min-w-[100px] ${componentWidth < 800 ? stickyActionsClass : ""}`
          : hasCustomSize(headerId, columnDef)
            ? ""
            : "min-w-[180px] w-auto"
    }`;

  const bodyCellClass = (columnId: string, columnDef: ColumnDef<T>) =>
    isSelect(columnId)
      ? "w-[44px] min-w-[44px]"
      : isActions(columnId)
        ? `w-[100px] min-w-[100px] ${componentWidth < 800 ? stickyActionsClass : ""} group-hover:bg-gray-50`
        : hasCustomSize(columnId, columnDef)
          ? ""
          : "min-w-[180px] w-auto";

  return (
    <div
      ref={componentRef}
      className="w-full min-w-0 overflow-hidden border border-gray-200 rounded-lg bg-white flex flex-col max-h-full min-h-0"
    >
      <div className="overflow-auto min-w-0 flex-1 min-h-0">
        <table className="table-fixed w-full min-w-[500px]">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`${headerCellClass(header.column.id, header.column.columnDef)} ${
                      (header.column.columnDef.meta as { className?: string })?.className ?? ""
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`group hover:bg-gray-50 transition-colors duration-150 ${
                  row.getIsSelected() ? "bg-indigo-50/40" : ""
                } ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row) ?? ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`py-3 px-4 text-sm text-gray-700 ${
                      (cell.column.columnDef.meta as { className?: string })?.className ?? ""
                    } ${bodyCellClass(cell.column.id, cell.column.columnDef)}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No data to display</div>
        )}
      </div>
    </div>
  );
};
