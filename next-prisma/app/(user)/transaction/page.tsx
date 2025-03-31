
import TransactionTable from '@/components/transaction_table'
import { Metadata } from 'next'



export const metadata: Metadata = {
  title: 'Transaction',
  description: 'Transaction page',
}

export default function transactionPage() {
  return (
    <>
      <TransactionTable/>
    </>
  )
}
