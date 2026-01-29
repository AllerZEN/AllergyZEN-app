"use client"

import { motion } from "framer-motion"
import { ShieldCheck, ShoppingCart, PlusCircle, FileText, Sparkles, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SafeAlternativesProps {
  productName: string
  alternatives: any[]
  onAction?: (action: string, item: string) => void
}

export function SafeAlternatives({ productName, alternatives, onAction }: SafeAlternativesProps) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="p-1.5 bg-green-100 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="font-bold text-sm uppercase tracking-tight">Safe Swaps for {productName}</h3>
      </div>

      <div className="grid gap-3">
        {alternatives.map((alt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-2 border-green-100 shadow-sm hover:border-green-300 transition-all bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 relative overflow-hidden">
                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-green-500" />
                    <img src={alt.image || "/api/placeholder/80/80"} alt={alt.name} className="w-16 h-16 object-contain" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 leading-tight truncate">{alt.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{alt.brand}</p>
                      </div>
                      <Badge className="bg-green-500 text-white border-none text-[9px] px-1.5 py-0">VERIFIED SAFE</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{alt.description || "Safe alternative found for your profile."}</p>
                  </div>
                </div>

                {/* INTERACTIVE BUTTON BAR */}
                <div className="grid grid-cols-3 border-t border-slate-50 bg-slate-50/30">
                  <button 
                    onClick={() => onAction?.("meal", alt.name)}
                    className="flex flex-col items-center py-2 gap-1 border-r border-slate-100 hover:bg-green-50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-green-600" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">Add Meal</span>
                  </button>
                  <button 
                    onClick={() => onAction?.("note", alt.name)}
                    className="flex flex-col items-center py-2 gap-1 border-r border-slate-100 hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">Save Note</span>
                  </button>
                  <button 
                    onClick={() => window.open(alt.purchaseUrl, '_blank')}
                    className="flex flex-col items-center py-2 gap-1 hover:bg-orange-50 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">Shop</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
