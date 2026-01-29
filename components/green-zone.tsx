"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Sparkles, ChevronRight } from "lucide-react"
import { safeAlternatives } from "@/lib/allergen-data"
import { motion } from "framer-motion"

export function GreenZone() {
  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur border-success/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="w-5 h-5 text-success" />
            Green Zone
            <Badge variant="outline" className="ml-auto text-success border-success/30">
              Super-Safe
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Your trusted substitutes that are always safe to use</p>

          <div className="space-y-3">
            {safeAlternatives.map((alt, index) => (
              <motion.div
                key={alt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-success/5 border-success/20 hover:bg-success/10 transition-colors cursor-pointer">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-success/10">
                        <Sparkles className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-success">{alt.name}</h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{alt.category}</p>
                        <p className="text-sm text-foreground/80 mt-1">{alt.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {alt.replaces.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              Replaces: {r}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
