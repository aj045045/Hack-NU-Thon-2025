"use client"

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Plus,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TransactionMode } from "@prisma/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the transaction type to match Prisma model
type Transaction = {
  id: string;
  displayNumber?: number;
  senderId: string;
  receiverId: string;
  sender: {
    name: string;
    accountNumber: string;
  };
  receiver: {
    name: string;
    accountNumber: string;
  };
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  transactionDateTime: Date;
  transactionMode: TransactionMode;
  _deleteRow?: (id: string) => void;
};

// Define the form data type
type TransactionFormData = {
  senderName: string;
  receiverName: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: string;
  transactionMode: TransactionMode | "";
}

// Define columns for the data table
const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "displayNumber",
    header: "Transaction #",
    cell: ({ row }) => {
      const number = row.original.displayNumber;
      return number ? `TXN-${number.toString().padStart(6, '0')}` : 'New';
    }
  },
  { 
    accessorKey: "sender", 
    header: "Sender",
    cell: ({ row }) => row.original.sender?.name || "Unknown" 
  },
  { 
    accessorKey: "receiver", 
    header: "Receiver",
    cell: ({ row }) => row.original.receiver?.name || "Unknown"
  },
  { accessorKey: "senderAccountNumber", header: "Sender Account" },
  { accessorKey: "receiverAccountNumber", header: "Receiver Account" },
  { 
    accessorKey: "amount", 
    header: "Amount (₹)",
    cell: ({ row }) => `₹${row.getValue("amount")}`
  },
  { 
    accessorKey: "transactionDateTime", 
    header: "Date & Time",
    cell: ({ row }) => {
      const date = row.original.transactionDateTime;
      return date instanceof Date 
        ? date.toLocaleString() 
        : new Date(date).toLocaleString();
    }
  },
  { accessorKey: "transactionMode", header: "Mode" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => row.original._deleteRow?.(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      );
    }
  }
];

export default function TransactionTable() {
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // State for error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for form inputs
  const [formData, setFormData] = useState<TransactionFormData>({
    senderName: "",
    receiverName: "",
    senderAccountNumber: "",
    receiverAccountNumber: "",
    amount: "",
    transactionMode: ""
  });

  // State for dialog open/close
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select input changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch transactions from the API
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Fetching transactions...");
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(`Failed to fetch transactions: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Received transactions data:", data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array of transactions');
      }
      
      // Map the transactions and add the delete function
      const transactionsWithDelete = data.map((transaction: Transaction) => ({
        ...transaction,
        _deleteRow: (id: string) => handleDeleteTransaction(id)
      }));
      
      setTransactions(transactionsWithDelete);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  // Function to delete a transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      console.log(`Deleting transaction with ID: ${id}`);
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(`Failed to delete transaction: ${errorData.error || response.statusText}`);
      }
      
      console.log(`Successfully deleted transaction with ID: ${id}`);
      
      // Remove the transaction from the local state
      setTransactions(prev => 
        prev.filter(t => t.id !== id)
          .map(t => ({ ...t, _deleteRow: (id) => handleDeleteTransaction(id) }))
      );
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Function to add a new transaction
  const handleAddTransaction = async () => {
    // Validate form data
    if (!formData.senderName || !formData.receiverName || !formData.senderAccountNumber || 
        !formData.receiverAccountNumber || !formData.amount || !formData.transactionMode) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: formData.senderName,
          receiverName: formData.receiverName,
          senderAccountNumber: formData.senderAccountNumber,
          receiverAccountNumber: formData.receiverAccountNumber,
          amount: parseFloat(formData.amount),
          transactionMode: formData.transactionMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create transaction: ${errorData.error || response.statusText}`);
      }

      // Refresh the transactions list
      fetchTransactions();
      
      // Reset form and close dialog
      setFormData({
        senderName: "",
        receiverName: "",
        senderAccountNumber: "",
        receiverAccountNumber: "",
        amount: "",
        transactionMode: ""
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed pagination with 5 items per page
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,  // Fixed to 5 items per page
  });

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    // Prevent page size from being changed programmatically
    manualPagination: false,
  });

  return (
    <Card className="bg-white border-none shadow-none">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-green-800 hover:text-green-600 transition-colors duration-300">Transaction Details</h2>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new transaction below
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Sender Name</Label>
                      <Input
                        id="senderName"
                        name="senderName"
                        placeholder="John Doe"
                        value={formData.senderName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiverName">Receiver Name</Label>
                      <Input
                        id="receiverName"
                        name="receiverName"
                        placeholder="Jane Smith"
                        value={formData.receiverName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senderAccountNumber">Sender Account</Label>
                      <Input
                        id="senderAccountNumber"
                        name="senderAccountNumber"
                        placeholder="1234567890"
                        value={formData.senderAccountNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiverAccountNumber">Receiver Account</Label>
                      <Input
                        id="receiverAccountNumber"
                        name="receiverAccountNumber"
                        placeholder="0987654321"
                        value={formData.receiverAccountNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1000.00"
                        value={formData.amount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionMode">Transaction Mode</Label>
                      <Select 
                        value={formData.transactionMode} 
                        onValueChange={(value) => handleSelectChange(value, 'transactionMode')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="IMPS">IMPS</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                          <SelectItem value="BANK_TRANSFER">BANK TRANSFER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleAddTransaction}>
                    Add Transaction
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div>
          <Table>
            <TableHeader className="bg-green-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-green-800 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
                      <span className="ml-2 text-green-700">Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                    <div className="flex flex-col items-center">
                      <span>Error: {errorMessage}</span>
                      <Button 
                        onClick={fetchTransactions}
                        variant="outline"
                        className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-green-50 border-b border-green-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-green-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-green-600">
                    No transactions available. Add a new transaction to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Simplified Pagination Controls */}
        <div className="flex items-center justify-between px-2 mt-4">
          <div className="text-sm text-green-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
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