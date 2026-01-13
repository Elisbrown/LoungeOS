"use client"

import { Header } from '@/components/dashboard/header'
import { JournalEntriesTable } from '@/components/dashboard/accounting/journal-entries-table'
import { SimpleExpenseForm } from '@/components/dashboard/accounting/simple-expense-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react'

export default function ExpensesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEntryCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Expenses" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="new">Record Expense</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>
                  View and manage all recorded expenses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JournalEntriesTable type="Expense" onRefresh={() => {}} key={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Record New Expense</CardTitle>
                <CardDescription>
                  Quickly record a business expense.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleExpenseForm onSuccess={handleEntryCreated} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
