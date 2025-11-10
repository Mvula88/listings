'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

export function AnalyticsCharts({ data }: { data: any }) {
  // Process user growth data
  const userGrowthData = useMemo(() => {
    if (!data.userGrowth) return []
    const grouped: Record<string, number> = {}
    data.userGrowth.forEach((item: any) => {
      const date = new Date(item.created_at).toLocaleDateString()
      grouped[date] = (grouped[date] || 0) + 1
    })
    return Object.entries(grouped).map(([date, count]) => ({
      date,
      users: count,
    }))
  }, [data.userGrowth])

  // Process property growth data
  const propertyGrowthData = useMemo(() => {
    if (!data.propertyGrowth) return []
    const grouped: Record<string, number> = {}
    data.propertyGrowth.forEach((item: any) => {
      const date = new Date(item.created_at).toLocaleDateString()
      grouped[date] = (grouped[date] || 0) + 1
    })
    return Object.entries(grouped).map(([date, count]) => ({
      date,
      properties: count,
    }))
  }, [data.propertyGrowth])

  // Process revenue data by month
  const revenueByMonthData = useMemo(() => {
    if (!data.revenueData) return []
    const grouped: Record<string, number> = {}
    data.revenueData.forEach((item: any) => {
      const month = new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
      grouped[month] = (grouped[month] || 0) + parseFloat(item.amount || 0)
    })
    return Object.entries(grouped).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }))
  }, [data.revenueData])

  // Process user types distribution
  const userTypesData = useMemo(() => {
    if (!data.userTypes) return []
    const counts: Record<string, number> = {}
    data.userTypes.forEach((item: any) => {
      const type = item.user_type || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [data.userTypes])

  // Process property statuses
  const propertyStatusData = useMemo(() => {
    if (!data.propertyStatuses) return []
    const counts: Record<string, number> = {}
    data.propertyStatuses.forEach((item: any) => {
      const status = item.status || 'unknown'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [data.propertyStatuses])

  // Process transaction statuses
  const transactionStatusData = useMemo(() => {
    if (!data.transactionStatuses) return []
    const counts: Record<string, number> = {}
    data.transactionStatuses.forEach((item: any) => {
      const status = item.status || 'unknown'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }))
  }, [data.transactionStatuses])

  return (
    <div className="space-y-6">
      {/* Growth Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
            <CardDescription>Daily new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Listings (Last 30 Days)</CardTitle>
            <CardDescription>Daily new property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={propertyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="properties" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Month</CardTitle>
          <CardDescription>Monthly revenue over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueByMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Types</TabsTrigger>
          <TabsTrigger value="properties">Property Status</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Status</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Type Distribution</CardTitle>
              <CardDescription>Breakdown of users by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={userTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Property Status Distribution</CardTitle>
              <CardDescription>Breakdown of properties by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Status Distribution</CardTitle>
              <CardDescription>Breakdown of transactions by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={transactionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
