import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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
];

const columns: ColumnDef<typeof transactions[0]>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "sender", header: "Sender" },
  { accessorKey: "receiver", header: "Receiver" },
  { accessorKey: "senderAccountNumber", header: "Sender Account" },
  { accessorKey: "receiverAccountNumber", header: "Receiver Account" },
  { accessorKey: "amount", header: "Amount ($)" },
  { accessorKey: "transactionDateTime", header: "Date & Time" },
  { accessorKey: "transactionMode", header: "Mode" },
];

export default function TransactionTable() {
  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        <DataTable columns={columns} data={transactions} />
      </CardContent>
    </Card>
  );
}