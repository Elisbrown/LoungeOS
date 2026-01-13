"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/context/settings-context'

type ReportViewerProps = {
  reportType: 'profit-loss' | 'balance-sheet' | 'cash-flow'
  title: string
  description: string
}

export function ReportViewer({ reportType, title, description }: ReportViewerProps) {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    asOfDate: new Date().toISOString().split('T')[0],
  })
  const { toast } = useToast()
  const { settings } = useSettings()

  useEffect(() => {
    generateReport()
  }, [])

  const generateReport = async () => {
    try {
      setLoading(true)
      let url = ''
      
      if (reportType === 'profit-loss') {
        url = `/api/accounting/reports/profit-loss?startDate=${dates.startDate}&endDate=${dates.endDate}`
      } else if (reportType === 'balance-sheet') {
        url = `/api/accounting/reports/balance-sheet?asOfDate=${dates.asOfDate}`
      } else if (reportType === 'cash-flow') {
        url = `/api/accounting/reports/cash-flow?startDate=${dates.startDate}&endDate=${dates.endDate}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate report"
        })
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    let url = ''
    
    if (reportType === 'profit-loss') {
      url = `/api/accounting/documents/profit-loss?startDate=${dates.startDate}&endDate=${dates.endDate}`
    } else if (reportType === 'balance-sheet') {
      url = `/api/accounting/documents/balance-sheet?asOfDate=${dates.asOfDate}`
    } else if (reportType === 'cash-flow') {
      url = `/api/accounting/documents/cash-flow?startDate=${dates.startDate}&endDate=${dates.endDate}`
    }

    window.open(url, '_blank')
  }

  const renderProfitLoss = () => {
    if (!reportData) return null

    if (reportData.revenue.length === 0 && reportData.expenses.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>No journal entries found for this period.</p>
          <p className="text-sm mt-2">Create journal entries in the Journals page to see data here.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Period: {new Date(reportData.period.start).toLocaleDateString()} - {new Date(reportData.period.end).toLocaleDateString()}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Revenue</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.revenue.length > 0 ? (
                reportData.revenue.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.account_code} - {item.account_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.balance, settings.defaultCurrency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">No revenue accounts</TableCell>
                </TableRow>
              )}
              <TableRow className="font-semibold bg-muted">
                <TableCell>Total Revenue</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.totalRevenue, settings.defaultCurrency)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Expenses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.expenses.length > 0 ? (
                reportData.expenses.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.account_code} - {item.account_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.balance, settings.defaultCurrency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">No expense accounts</TableCell>
                </TableRow>
              )}
              <TableRow className="font-semibold bg-muted">
                <TableCell>Total Expenses</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.totalExpenses, settings.defaultCurrency)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="pt-4 border-t-2">
          <Table>
            <TableBody>
              <TableRow className="text-lg font-bold">
                <TableCell>Net Income</TableCell>
                <TableCell className={`text-right ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.netIncome, settings.defaultCurrency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const renderBalanceSheet = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          As of: {new Date(reportData.asOfDate).toLocaleDateString()}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Assets</h3>
          <Table>
            <TableBody>
              {reportData.assets.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.account_code} - {item.account_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.balance, settings.defaultCurrency)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted">
                <TableCell>Total Assets</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.totalAssets, settings.defaultCurrency)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Liabilities</h3>
          <Table>
            <TableBody>
              {reportData.liabilities.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.account_code} - {item.account_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.balance, settings.defaultCurrency)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted">
                <TableCell>Total Liabilities</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.totalLiabilities, settings.defaultCurrency)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Equity</h3>
          <Table>
            <TableBody>
              {reportData.equity.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.account_code} - {item.account_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.balance, settings.defaultCurrency)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted">
                <TableCell>Total Equity</TableCell>
                <TableCell className="text-right">{formatCurrency(reportData.totalEquity, settings.defaultCurrency)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="pt-4 border-t-2">
          <Table>
            <TableBody>
              <TableRow className="text-lg font-bold">
                <TableCell>Total Liabilities + Equity</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.totalLiabilities + reportData.totalEquity, settings.defaultCurrency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const renderCashFlow = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Period: {new Date(reportData.period.start).toLocaleDateString()} - {new Date(reportData.period.end).toLocaleDateString()}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Operating Activities</h3>
          <Table>
            <TableBody>
              {reportData.operating.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount, settings.defaultCurrency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Beginning Cash:</span>
            <span className="font-medium">{formatCurrency(reportData.beginningCash, settings.defaultCurrency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Net Cash Flow:</span>
            <span className={`font-medium ${reportData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData.netCashFlow, settings.defaultCurrency)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Ending Cash:</span>
            <span>{formatCurrency(reportData.endingCash, settings.defaultCurrency)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {reportData && (
              <Button onClick={downloadPDF} variant="default" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            {reportType !== 'balance-sheet' ? (
              <>
                <div className="flex-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dates.startDate}
                    onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dates.endDate}
                    onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <Label htmlFor="asOfDate">As Of Date</Label>
                <Input
                  id="asOfDate"
                  type="date"
                  value={dates.asOfDate}
                  onChange={(e) => setDates({ ...dates, asOfDate: e.target.value })}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center p-8 text-muted-foreground">
              Generating report...
            </div>
          ) : reportData ? (
            <div className="mt-6">
              {reportType === 'profit-loss' && renderProfitLoss()}
              {reportType === 'balance-sheet' && renderBalanceSheet()}
              {reportType === 'cash-flow' && renderCashFlow()}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Click "Refresh" to generate the report
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
