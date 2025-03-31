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
  ChevronsRight,
  PlusCircle,
  Trash2
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  fraudScore?: number; // Add fraud score field
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

// Add this before the TransactionTable component
interface AddTransactionFormData {
  senderName: string;
  senderAccountNumber: string;
  receiverName: string;
  receiverAccountNumber: string;
  amount: string;
  transactionMode: string;
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5, // Fixed to 5 transactions per page
  });
  
  // Total count for pagination
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<string>("transactionDateTime");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [transactionMode, setTransactionMode] = useState<string | null>(null);

  // Form for adding a new transaction
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [formData, setFormData] = useState<AddTransactionFormData>({
    senderName: "",
    senderAccountNumber: "",
    receiverName: "",
    receiverAccountNumber: "",
    amount: "",
    transactionMode: "NEFT"
  });

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Build query parameters for sorting
      const params = new URLSearchParams();
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      if (transactionMode) {
        params.append("transactionMode", transactionMode);
      }
      
      // Use the non-admin API endpoint
      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle array response
      const allTransactions = Array.isArray(data) ? data : (data.transactions || []);
      
      // Fixed page size of 5 for client-side pagination
      const total = allTransactions.length;
      const start = pagination.pageIndex * 5; // Always 5 items per page
      const end = start + 5;
      
      setTotalCount(total);
      setTransactions(allTransactions.slice(start, end));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add a new transaction
  const handleAddTransaction = async () => {
    try {
      // Basic validation
      if (!formData.senderAccountNumber || !formData.receiverAccountNumber || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Check if amount is a valid number
      if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      
      setLoading(true);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add transaction");
      }
      
      // Success
      toast.success("Transaction added successfully");
      setIsAddingTransaction(false);
      
      // Reset form
      setFormData({
        senderName: "",
        senderAccountNumber: "",
        receiverName: "",
        receiverAccountNumber: "",
        amount: "",
        transactionMode: "NEFT"
      });
      
      // Refresh data
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete transaction");
      }
      
      // Success
      toast.success("Transaction deleted successfully");
      
      // Refresh data
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete transaction");
    } finally {
      setLoading(false);
    }
  };

  // Handle transaction mode filter change
  const handleTransactionModeChange = (value: string) => {
    setTransactionMode(value === "all" ? null : value);
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
    {
      id: "fraudScore",
      header: "Fraud Risk",
      cell: ({ row }) => {
        // Generate a random fraud score if one doesn't exist
        const fraudScore = row.original.fraudScore ?? Math.floor(Math.random() * 101);
        
        // Determine risk level based on score
        let riskLabel = "Low Risk";
        let bgColor = "bg-green-100";
        let textColor = "text-green-800";
        
        if (fraudScore > 80) {
          riskLabel = "High Risk";
          bgColor = "bg-red-100";
          textColor = "text-red-800";
        } else if (fraudScore > 50) {
          riskLabel = "Medium Risk";
          bgColor = "bg-orange-100";
          textColor = "text-orange-800";
        }
        
        return (
          <span
            className={`inline-flex items-center justify-between w-28 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
          >
            {riskLabel}
            <span className="ml-1 font-bold">{fraudScore}</span>
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTransaction(row.original.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Transaction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
  ];

  // Set up table
  const table = useReactTable({
    data: transactions,
    columns,
    pageCount: Math.ceil(totalCount / 5), // Always 5 items per page
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    // Prevent page size from being changed programmatically
    manualPagination: true,
    state: {
      pagination,
    },
  });

  // Fetch data when filters change (but not for pagination which is now client-side)
  useEffect(() => {
    fetchTransactions();
  }, [sortBy, sortOrder, transactionMode]);

  return (
    <Card className="p-4">
      <CardContent>
        {/* Add Transaction Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaction Details</h2>
          
          <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for the new transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="senderName" className="text-right">
                    Sender Name
                  </Label>
                  <Input
                    id="senderName"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="senderAccountNumber" className="text-right">
                    Sender Account*
                  </Label>
                  <Input
                    id="senderAccountNumber"
                    name="senderAccountNumber"
                    value={formData.senderAccountNumber}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="receiverName" className="text-right">
                    Receiver Name
                  </Label>
                  <Input
                    id="receiverName"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="receiverAccountNumber" className="text-right">
                    Receiver Account*
                  </Label>
                  <Input
                    id="receiverAccountNumber"
                    name="receiverAccountNumber"
                    value={formData.receiverAccountNumber}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount*
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transactionMode" className="text-right">
                    Mode*
                  </Label>
                  <Select
                    value={formData.transactionMode}
                    onValueChange={(value) => 
                      setFormData({...formData, transactionMode: value})
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEFT">NEFT</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="IMPS">IMPS</SelectItem>
                      <SelectItem value="RTGS">RTGS</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddTransaction} 
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Transaction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Transaction Mode:</label>
            <Select
              value={transactionMode || "all"}
              onValueChange={handleTransactionModeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
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
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, Math.ceil(totalCount / 5))}
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