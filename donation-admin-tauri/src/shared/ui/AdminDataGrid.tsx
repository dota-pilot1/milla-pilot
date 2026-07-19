import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import type { Ref } from "react";
import { cn } from "../lib/cn";

ModuleRegistry.registerModules([AllCommunityModule]);

export type AdminDataGridProps<TData extends object> = AgGridReactProps<TData> & {
  height?: number | string;
  className?: string;
  gridRef?: Ref<AgGridReact<TData>>;
};

export function AdminDataGrid<TData extends object>({
  height = 560,
  className,
  gridRef,
  defaultColDef: defaultColDefOverride,
  rowHeight = 66,
  headerHeight = 42,
  animateRows = true,
  suppressCellFocus = true,
  sortingOrder = ["asc", "desc"],
  ...props
}: AdminDataGridProps<TData>) {
  const defaultColDef: ColDef<TData> = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120,
  };

  return (
    <div
      className={cn("admin-grid ag-theme-quartz", className)}
      style={{ height }}
    >
      <AgGridReact<TData>
        ref={gridRef}
        defaultColDef={{ ...defaultColDef, ...defaultColDefOverride }}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        animateRows={animateRows}
        suppressCellFocus={suppressCellFocus}
        sortingOrder={sortingOrder}
        {...props}
      />
    </div>
  );
}
