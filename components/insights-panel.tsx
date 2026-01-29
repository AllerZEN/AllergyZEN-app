"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Download,
  Trash2,
  Clock,
  Activity,
} from "lucide-react"
import {
  getCurrentMonthStats,
  getRecentScans,
  exportAnalyticsLog,
  clearAnalytics,
  verifyLogIntegrity,
} from "@/lib/analytics-logger"
import { StatusDot } from "@/components/status-dot"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function InsightsPanel() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalScans: 0,
    safeResults: 0,
    dangerResults: 0,
    warningResults: 0,
    unknownResults: 0,
    alternativesClicked: 0,
  })
  const [recentScans, setRecentScans] = useState<ReturnType<typeof getRecentScans>>([])
  const [showAllScans, setShowAllScans] = useState(false)

  const refreshStats = useCallback(() => {
    setStats(getCurrentMonthStats())
    setRecentScans(getRecentScans(showAllScans ? 50 : 5))
  }, [showAllScans])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      refreshStats()
    }
  }, [mounted, refreshStats])

  const handleExport = useCallback(() => {
    const exportData = exportAnalyticsLog()
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `allergyzen_logs_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const handleClearData = useCallback(() => {
    clearAnalytics()
    refreshStats()
  }, [refreshStats])

  const getMonthName = () => {
    return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const safetyScore = stats.totalScans > 0 ? Math.round((stats.safeResults / stats.totalScans) * 100) : 100

  if (!mounted) {
    return (
      <Card className="bg-card/50 backdrop-blur border-primary/20 animate-pulse">
        <CardContent className="p-6 h-40" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Monthly Overview */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Usage Insights
          </CardTitle>
          <p className="text-sm text-muted-foreground">{getMonthName()}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalScans}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 text-center">
              <p className="text-3xl font-bold text-success">{safetyScore}%</p>
              <p className="text-xs text-muted-foreground">Safety Score</p>
            </div>
          </div>

          {/* Result Breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Results Breakdown</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-4 h-4 text-success mb-1" />
                <p className="text-lg font-bold text-success">{stats.safeResults}</p>
                <p className="text-xs text-muted-foreground">Safe</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive mb-1" />
                <p className="text-lg font-bold text-destructive">{stats.dangerResults}</p>
                <p className="text-xs text-muted-foreground">Danger</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-warning/10">
                <Shield className="w-4 h-4 text-warning mb-1" />
                <p className="text-lg font-bold text-warning">{stats.warningResults}</p>
                <p className="text-xs text-muted-foreground">Caution</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <HelpCircle className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{stats.unknownResults}</p>
                <p className="text-xs text-muted-foreground">Unknown</p>
              </div>
            </div>
          </div>

          {/* Alternatives Clicked */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm">Safe Alternatives Clicked</span>
            </div>
            <Badge variant="secondary">{stats.alternativesClicked}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scan History */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Scans
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAllScans(!showAllScans)}>
              {showAllScans ? "Show Less" : "Show All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No scans recorded yet. Start scanning products to see your history.
            </p>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    scan.resultType === "safe" && "bg-success/5 border-success/20",
                    scan.resultType === "danger" && "bg-destructive/5 border-destructive/20",
                    scan.resultType === "warning" && "bg-warning/5 border-warning/20",
                    scan.resultType === "unknown" && "bg-muted/50 border-border",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={scan.resultType === "warning" ? "caution" : scan.resultType} size="sm" />
                    <div>
                      <p className="font-medium text-sm leading-tight">{scan.productName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(scan.timestamp).toLocaleDateString()}
                        {scan.triggersFound.length > 0 && (
                          <span className="text-destructive">{scan.triggersFound.length} triggers</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {verifyLogIntegrity(scan) && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Your scan logs are stored locally and encrypted with integrity hashes for liability protection. Export your
            logs anytime for support or personal records.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Logs
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all analytics data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your scan history and usage statistics. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
