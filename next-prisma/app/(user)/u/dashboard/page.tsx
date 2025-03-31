"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CreditCard, DollarSign, TrendingUp, ShieldAlert } from "lucide-react";
import { TransactionMode } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { pageLinks } from "@/constants/links";

// Types for the dashboard API response
interface DashboardData {
  transactions: {
    total: number;
    volume: number;
    byMode: Array<{
      transactionMode: TransactionMode;
      _count: { _all: number };
      _sum: { amount: number };
    }>;
    recent: Array<{
      id: string;
      amount: number;
      transactionDateTime: string;
      transactionMode: TransactionMode;
      senderAccountNumber: string;
      receiverAccountNumber: string;
      fraudScore?: number; // Optional fraud score
    }>;
    chartData: Array<{
      date: string;
      count: number;
      volume: number;
      fraudCount: number; // Number of fraudulent transactions
    }>;
  };
  fraud: {
    total: number;
    percentage: number;
    byMode: Array<{
      transactionMode: TransactionMode;
      count: number;
    }>;
  };
}

// Colors for transaction modes
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

// Dashboard card component
function DashboardCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push(pageLinks.login);
      return;
    }

    // If user is admin, redirect to admin dashboard
    if (session?.user?.isAdmin) {
      router.push(pageLinks.admin.dashboard);
      return;
    }

    async function fetchDashboardData() {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    if (status === "authenticated" && !session?.user?.isAdmin) {
      fetchDashboardData();
    }
  }, [status, session, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-muted-foreground">Error: {error}</p>
      </div>
    );
  }

  // If no data yet
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  // Prepare data for pie charts
  const transactionModePieData = dashboardData.transactions.byMode.map(mode => ({
    name: mode.transactionMode || 'UNKNOWN',
    value: mode._count?._all ?? 0,
    amount: mode._sum?.amount ?? 0,
    color: TRANSACTION_COLORS[mode.transactionMode as string] || TRANSACTION_COLORS.DEFAULT
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Transactions"
              value={dashboardData.transactions.total}
              icon={<CreditCard className="h-4 w-4 text-indigo-600" />}
              description="Processed transactions"
            />
            <DashboardCard
              title="Transaction Volume"
              value={formatCurrency(dashboardData.transactions.volume)}
              icon={<DollarSign className="h-4 w-4 text-yellow-600" />}
              description="Total transaction amount"
            />
            <DashboardCard
              title="Recent Transactions"
              value={dashboardData.transactions.recent.length}
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
              description="Latest transactions processed"
            />
            <DashboardCard
              title="Fraud Alerts"
              value={dashboardData.fraud.total}
              icon={<ShieldAlert className="h-4 w-4 text-red-600" />}
              description={`${dashboardData.fraud.percentage.toFixed(2)}% of transactions`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Mode Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Transactions by payment mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionModePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {transactionModePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} transactions`, `${name}`]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest transaction activity with fraud scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.transactions.recent.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ 
                          backgroundColor: 
                            TRANSACTION_COLORS[transaction.transactionMode as string] || 
                            TRANSACTION_COLORS.DEFAULT 
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">
                            {formatCurrency(transaction.amount)} via {transaction.transactionMode}
                          </p>
                          {transaction.fraudScore !== undefined && (
                            <span 
                              className={`text-xs rounded-full px-2 py-0.5 ${
                                transaction.fraudScore > 80 ? 'bg-red-100 text-red-800' :
                                transaction.fraudScore > 50 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {transaction.fraudScore > 80 ? 'High Risk' :
                               transaction.fraudScore > 50 ? 'Medium Risk' :
                               'Low Risk'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.transactionDateTime).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume & Fraud Over Time</CardTitle>
              <CardDescription>Last 7 days transaction activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.transactions.chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "volume") return [formatCurrency(value as number), "Volume"];
                        if (name === "fraudCount") return [value, "Fraud Alerts"];
                        return [value, name === "count" ? "Count" : name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Transaction Count" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="fraudCount" name="Fraud Alerts" fill="#FF8042" />
                    <Bar yAxisId="right" dataKey="volume" name="Transaction Volume" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection by Payment Mode</CardTitle>
              <CardDescription>Suspicious activity by transaction method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.fraud.byMode.map((mode) => (
                  <div key={mode.transactionMode} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ 
                        backgroundColor: TRANSACTION_COLORS[mode.transactionMode as string] || TRANSACTION_COLORS.DEFAULT 
                      }}
                    ></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium">{mode.transactionMode}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{mode.count} alerts</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const total = dashboardData.transactions.byMode.find(
                              m => m.transactionMode === mode.transactionMode
                            )?._count?._all || 0;
                            return total ? `${((mode.count / total) * 100).toFixed(2)}% of ${mode.transactionMode} transactions` : '';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 