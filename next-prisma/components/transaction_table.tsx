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
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample transactions for the table
const transactions = [
  {
    id: 1,
    senderId: "U001",
    receiverId: "U002",
    sender: "John Doe",
    receiver: "Jane Smith",
    senderAccountNumber: "1234567890",
    receiverAccountNumber: "0987654321",
    amount: 250.75,
    transactionDateTime: "2025-03-30 14:30:00",
    transactionMode: "Online Transfer",
  },
  {
    id: 2,
    senderId: "U003",
    receiverId: "U004",
    sender: "Alice Brown",
    receiver: "Bob White",
    senderAccountNumber: "1122334455",
    receiverAccountNumber: "5544332211",
    amount: 500.0,
    transactionDateTime: "2025-03-30 15:00:00",
    transactionMode: "UPI",
  },
  // Adding more sample data for pagination
  {
    id: 3,
    senderId: "U005",
    receiverId: "U006",
    sender: "Emma Wilson",
    receiver: "Michael Johnson",
    senderAccountNumber: "2233445566",
    receiverAccountNumber: "6677889900",
    amount: 750.50,
    transactionDateTime: "2025-03-29 10:15:00",
    transactionMode: "NEFT",
  },
  {
    id: 4,
    senderId: "U007",
    receiverId: "U008",
    sender: "David Lee",
    receiver: "Sarah Chen",
    senderAccountNumber: "7788990011",
    receiverAccountNumber: "1122334455",
    amount: 1200.25,
    transactionDateTime: "2025-03-28 16:45:00",
    transactionMode: "RTGS",
  },
  {
    id: 5,
    senderId: "U009",
    receiverId: "U010",
    sender: "Robert Garcia",
    receiver: "Jennifer Lopez",
    senderAccountNumber: "9900112233",
    receiverAccountNumber: "3344556677",
    amount: 320.00,
    transactionDateTime: "2025-03-27 09:30:00",
    transactionMode: "UPI",
  },
  {
    id: 6,
    senderId: "U011",
    receiverId: "U012",
    sender: "Thomas Wright",
    receiver: "Olivia Davis",
    senderAccountNumber: "1133557799",
    receiverAccountNumber: "2244668800",
    amount: 450.75,
    transactionDateTime: "2025-03-26 14:20:00",
    transactionMode: "IMPS",
  },
  {
    id: 7,
    senderId: "U013",
    receiverId: "U014",
    sender: "Daniel Miller",
    receiver: "Sophia Brown",
    senderAccountNumber: "3355779911",
    receiverAccountNumber: "4466880022",
    amount: 900.50,
    transactionDateTime: "2025-03-25 11:05:00",
    transactionMode: "BANK_TRANSFER",
  },
  {
    id: 8,
    senderId: "U015",
    receiverId: "U016",
    sender: "James Anderson",
    receiver: "Elizabeth Wilson",
    senderAccountNumber: "5577991133",
    receiverAccountNumber: "6688002244",
    amount: 675.25,
    transactionDateTime: "2025-03-24 13:40:00",
    transactionMode: "NEFT",
  },
];

const columns: ColumnDef<typeof transactions[0]>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "sender", header: "Sender" },
  { accessorKey: "receiver", header: "Receiver" },
  { accessorKey: "senderAccountNumber", header: "Sender Account" },
  { accessorKey: "receiverAccountNumber", header: "Receiver Account" },
  { 
    accessorKey: "amount", 
    header: "Amount ($)",
    cell: ({ row }) => `$${row.getValue("amount")}`
  },
  { accessorKey: "transactionDateTime", header: "Date & Time" },
  { accessorKey: "transactionMode", header: "Mode" },
];

export default function TransactionTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
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
  });

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
                  {[5, 10, 15, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
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