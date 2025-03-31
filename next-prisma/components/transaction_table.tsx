'use client'
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel,
  PaginationState
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionMode } from "@prisma/client";

// Transaction interface for API data
interface Transaction {
  id: string;
  amount: number;
  transactionDateTime: string;
  transactionMode: string;
  sender: {
    id?: string;
    name: string;
    email?: string;
    accountNumber: string;
  } | null;
  receiver: {
    id?: string;
    name: string;
    email?: string;
    accountNumber: string;
  } | null;
}

// Colors for transaction modes (matching dashboard)
const TRANSACTION_COLORS: Record<string, string> = {
  NEFT: '#0088FE',
  UPI: '#00C49F',
  IMPS: '#FFBB28',
  RTGS: '#FF8042',
  BANK_TRANSFER: '#8884d8',
  DEFAULT: '#CCCCCC'
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Total count for pagination
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<string>("transactionDateTime");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [transactionMode, setTransactionMode] = useState<string | null>(null);

  // Define columns based on API data structure
  const columns: ColumnDef<Transaction>[] = [
    { 
      accessorKey: "id", 
      header: "ID",
      cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>
    },
    { 
      accessorKey: "sender", 
      header: "Sender",
      cell: ({ row }) => {
        const sender = row.original.sender;
        return (
          <div>
            <div className="font-medium">{sender?.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">{sender?.accountNumber || "N/A"}</div>
          </div>
        );
      }
    },
    { 
      accessorKey: "receiver", 
      header: "Receiver",
      cell: ({ row }) => {
        const receiver = row.original.receiver;
        return (
          <div>
            <div className="font-medium">{receiver?.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">{receiver?.accountNumber || "N/A"}</div>
          </div>
        );
      }
    },
    { 
      accessorKey: "amount", 
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount"))
    },
    { 
      accessorKey: "transactionDateTime", 
      header: "Date & Time",
      cell: ({ row }) => {
        const date = new Date(row.getValue("transactionDateTime"));
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    { 
      accessorKey: "transactionMode", 
      header: "Mode",
      cell: ({ row }) => {
        const mode = row.getValue("transactionMode") as string;
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${
                TRANSACTION_COLORS[mode] || 
                TRANSACTION_COLORS.DEFAULT || 
                '#CCCCCC'
              }20`,
              color: TRANSACTION_COLORS[mode] || 
                    TRANSACTION_COLORS.DEFAULT || 
                    '#CCCCCC'
            }}
          >
            {mode}
          </span>
        );
      }
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        // Normally this would be from the database, but for now we'll just show "Completed"
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            COMPLETED
          </span>
        );
      }
    },
  ];

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Calculate API pagination (1-indexed vs 0-indexed)
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      if (transactionMode) {
        params.append("transactionMode", transactionMode);
      }
      
      const response = await fetch(`/api/admin/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTransactions(data.transactions);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when pagination or filters change
  useEffect(() => {
    fetchTransactions();
  }, [pagination.pageIndex, pagination.pageSize, sortBy, sortOrder, transactionMode]);

  // Set up table
  const table = useReactTable({
    data: transactions,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  // Handle transaction mode filter change
  const handleTransactionModeChange = (value: string) => {
    setTransactionMode(value === "" ? null : value);
    // Reset to first page when changing filters
    setPagination({
      ...pagination,
      pageIndex: 0
    });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    // If clicking the same field, toggle order
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc"); // Default to descending when changing field
    }
    // Reset to first page when changing sort
    setPagination({
      ...pagination,
      pageIndex: 0
    });
  };

  return (
    <Card className="p-4">
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Transaction Mode:</label>
            <Select
              value={transactionMode || ""}
              onValueChange={handleTransactionModeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Modes</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="IMPS">IMPS</SelectItem>
                <SelectItem value="RTGS">RTGS</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Sort by:</label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactionDateTime">Date & Time</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="transactionMode">Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Order:</label>
            <Select value={sortOrder} onValueChange={(value) => {
              setSortOrder(value);
              setPagination({
                ...pagination,
                pageIndex: 0
              });
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchTransactions} className="mt-4">Retry</Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className="cursor-pointer"
                        onClick={() => handleSortChange(header.id)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.id === sortBy && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2 mt-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value: string) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(1, Math.ceil(totalCount / pagination.pageSize))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || loading}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage() || loading}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}