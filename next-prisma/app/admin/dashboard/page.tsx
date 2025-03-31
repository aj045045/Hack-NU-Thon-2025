"use client";

import { useState, useEffect, ReactNode } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSideBar } from "@/components/side-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, DollarSign, AlertTriangle, Wallet,
  CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight,

} from "lucide-react";
import { AccountType, ReviewStatus, TransactionMode } from "@prisma/client";
import { useSetAdminText } from "../layout";


// Types for the dashboard API response
interface DashboardData {
  users: {
    total: number;
    byAccountType: Array<{
      accountType: AccountType;
      _count: { _all: number };
    }>;
    admins: number;
  };
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
      sender: {
        name: string;
        accountNumber: string;
      };
      receiver: {
        name: string;
        accountNumber: string;
      };
    }>;
    chartData: Array<{
      date: string;
      count: number;
      volume: number;
    }>;
  };
  fraud: {
    total: number;
    byStatus: Array<{
      reviewStatus: ReviewStatus;
      _count: { _all: number };
    }>;
    highRiskUsers: number;
  };
  financials: {
    totalBalance: number;
  };
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description: string;
  trend?: "up" | "down" | null;
  trendValue?: string | null;
}

// Custom components for dashboard
const DashboardCard = ({
  title,
  value,
  icon,
  description,
  trend = null,
  trendValue = null
}: DashboardCardProps) => {
  useSetAdminText("Dashboard");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-green-100 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="flex items-center text-xs mt-1">
            {trend === "up" ? (
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
              {trendValue}
            </span>
            <span className="text-muted-foreground ml-1">{description}</span>
          </p>
        )}
        {!trend && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Define colors for charts
const TRANSACTION_COLORS: Record<string, string> = {
  NEFT: '#0088FE',
  UPI: '#00C49F',
  IMPS: '#FFBB28',
  RTGS: '#FF8042',
  BANK_TRANSFER: '#8884d8',
  // Add fallback colors for any other transaction modes
  DEFAULT: '#CCCCCC'
};

const ACCOUNT_COLORS: Record<AccountType, string> = {
  SAVINGS: '#0088FE',
  CURRENT: '#00C49F',
  BUSINESS: '#FFBB28'
};

const FRAUD_COLORS: Record<ReviewStatus, string> = {
  PENDING: '#FFBB28',
  REVIEWED: '#00C49F',
  FRAUD_CONFIRMED: '#FF8042',
  FALSE_ALARM: '#0088FE'
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await res.json();

        // Sanitize potentially null values in the data
        if (data.transactions) {
          // Ensure volume is a number, not null
          data.transactions.volume = data.transactions.volume ?? 0;

          // Handle null values in transaction mode data
          if (data.transactions.byMode) {
            data.transactions.byMode = data.transactions.byMode.map((mode: DashboardData['transactions']['byMode'][number]) => ({
              ...mode,
              _sum: { amount: mode._sum?.amount ?? 0 }
            }));
          }

          // Ensure chart data has valid numbers
          if (data.transactions.chartData) {
            data.transactions.chartData = data.transactions.chartData.map((item: DashboardData['transactions']['chartData'][number]) => ({
              ...item,
              volume: item.volume ?? 0,
              count: item.count ?? 0
            }));
          }

          // Ensure recent transactions are properly structured
          if (data.transactions.recent) {
            data.transactions.recent = data.transactions.recent.map((tx: DashboardData['transactions']['recent'][number]) => {
              // Normalize transaction mode to a valid enum value
              let normalizedMode = tx.transactionMode;

              // Check if transactionMode is a valid key in our color map
              if (normalizedMode && !TRANSACTION_COLORS[normalizedMode]) {
                // If not, normalize to a default value
                console.log(`Unknown transaction mode: ${normalizedMode}, defaulting to BANK_TRANSFER`);
                normalizedMode = 'BANK_TRANSFER';
              }

              return {
                ...tx,
                id: tx.id || `tx-${Math.random().toString(36).substring(2, 9)}`,
                amount: tx.amount ?? 0,
                transactionDateTime: tx.transactionDateTime || new Date().toISOString(),
                transactionMode: normalizedMode || 'BANK_TRANSFER',
                sender: tx.sender || { name: 'Unknown', accountNumber: 'N/A' },
                receiver: tx.receiver || { name: 'Unknown', accountNumber: 'N/A' }
              };
            });
          } else {
            data.transactions.recent = [];
          }
        }

        // Ensure financial data is valid
        if (data.financials) {
          data.financials.totalBalance = data.financials.totalBalance ?? 0;
        }

        console.log("Dashboard data:", data); // For debugging
        setDashboardData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSideBar />
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSideBar />
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-muted-foreground">Error: {error}</p>
        </div>
      </div>
    );
  }

  // If no data yet
  if (!dashboardData) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSideBar />
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for pie charts
  const accountTypePieData = dashboardData.users.byAccountType.map(type => ({
    name: type.accountType,
    value: type._count._all,
    color: ACCOUNT_COLORS[type.accountType] || '#CCCCCC'
  }));

  const transactionModePieData = dashboardData.transactions.byMode.map(mode => ({
    name: mode.transactionMode || 'UNKNOWN',
    value: mode._count?._all ?? 0,
    amount: mode._sum?.amount ?? 0,
    color: TRANSACTION_COLORS[mode.transactionMode] || TRANSACTION_COLORS.DEFAULT || '#CCCCCC'
  }));

  const fraudStatusPieData = dashboardData.fraud.byStatus.map(status => ({
    name: status.reviewStatus,
    value: status._count._all,
    color: FRAUD_COLORS[status.reviewStatus] || '#CCCCCC'
  }));

  return (
    <div className="grid min-h-screen w-full">
      <AdminSideBar />
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Users"
                value={dashboardData.users.total}
                icon={<Users className="h-4 w-4 text-green-600" />}
                description="Total registered users"
              />
              <DashboardCard
                title="Admins"
                value={dashboardData.users.admins}
                icon={<Users className="h-4 w-4 text-blue-600" />}
                description="Admin users"
              />
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Transaction Overview</CardTitle>
                  <CardDescription>
                    Transaction volume for the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={dashboardData.transactions.chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          return name === "volume"
                            ? formatCurrency(value as number)
                            : value;
                        }}
                      />
                      <Legend />
                      <Bar
                        name="Transaction Count"
                        dataKey="count"
                        fill="#0088FE"
                      />
                      <Bar
                        name="Volume (₹)"
                        dataKey="volume"
                        fill="#00C49F"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>
                    Users by account type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={accountTypePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {accountTypePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} users`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Fraud Alerts"
                value={dashboardData.fraud.total}
                icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
                description="Total fraud alerts"
                trend="up"
                trendValue={`${fraudStatusPieData.find(f => f.name === "PENDING")?.value || 0} pending`}
              />
              <DashboardCard
                title="High Risk Users"
                value={dashboardData.fraud.highRiskUsers}
                icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
                description="Users with confirmed fraud"
              />
              <DashboardCard
                title="Total Balance"
                value={formatCurrency(dashboardData.financials.totalBalance)}
                icon={<Wallet className="h-4 w-4 text-green-600" />}
                description="Combined account balance"
                trend="up"
                trendValue="4.5% this month"
              />
              <DashboardCard
                title="Active Transactions"
                value={dashboardData.transactions.recent.length}
                icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
                description="Recent transactions"
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction by Mode</CardTitle>
                  <CardDescription>
                    Distribution of transaction methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={transactionModePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {transactionModePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (!props || !props.payload) {
                            return ['No data', ''];
                          }

                          return name === "value"
                            ? [`${value} transactions`, "Count"]
                            : [formatCurrency(props.payload.amount || 0), "Volume"];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fraud Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of fraud detection status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={fraudStatusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fraudStatusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} alerts`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}


          {/* Fraud Monitoring Tab */}
          <TabsContent value="fraud" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <DashboardCard
                title="Pending Review"
                value={fraudStatusPieData.find(f => f.name === "PENDING")?.value || 0}
                icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
                description="Alerts awaiting review"
              />
              <DashboardCard
                title="Confirmed Fraud"
                value={fraudStatusPieData.find(f => f.name === "FRAUD_CONFIRMED")?.value || 0}
                icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
                description="Confirmed fraud cases"
              />
              <DashboardCard
                title="False Alarms"
                value={fraudStatusPieData.find(f => f.name === "FALSE_ALARM")?.value || 0}
                icon={<AlertTriangle className="h-4 w-4 text-green-600" />}
                description="Dismissed fraud alerts"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Detection Summary</CardTitle>
                <CardDescription>
                  Overview of fraud detection system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Total Alerts</p>
                      <div className="text-2xl font-bold">{dashboardData.fraud.total}</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">High-Risk Users</p>
                      <div className="text-2xl font-bold">{dashboardData.fraud.highRiskUsers}</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm font-medium mb-3">Alert Status Distribution</p>
                    {fraudStatusPieData.map((status) => (
                      <div key={status.name} className="flex items-center mb-2">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm">{status.name}</span>
                          <span className="text-sm font-medium">{status.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <button className="text-sm text-green-600 hover:underline">
                  View Detailed Fraud Report →
                </button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
