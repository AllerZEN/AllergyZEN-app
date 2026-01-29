"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Check, 
  Crown,
  Star,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscriptionData {
  plan: "free" | "premium" | "family"
  expiresAt: string | null
  features: string[]
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    features: [
      "Basic allergen search",
      "3 family profiles",
      "Safe list (50 items)",
      "Basic scanning"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "4.99",
    features: [
      "Unlimited allergen database",
      "5 family profiles",
      "Unlimited safe lists",
      "Business QR scanning",
      "Priority support"
    ],
    recommended: true
  },
  {
    id: "family",
    name: "Family",
    price: "9.99",
    features: [
      "Everything in Premium",
      "Unlimited profiles",
      "Shared family dashboard",
      "Meal planning",
      "Diabetes tracking",
      "24/7 support"
    ]
  }
]

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: "free",
    expiresAt: null,
    features: []
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem("allergyzen_subscription")
      if (stored) {
        setSubscription(JSON.parse(stored))
      }
    } catch {
      // Use defaults
    }
  }, [])

  const currentPlan = PLANS.find(p => p.id === subscription.plan) || PLANS[0]

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-800">Subscription</h1>
        </div>
        <p className="text-gray-500 italic">Manage your plan</p>
      </div>

      {/* Current Plan */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge className="bg-purple-600">{currentPlan.name}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-xl font-bold">${currentPlan.price}/mo</span>
          </div>
          <ul className="space-y-1">
            {currentPlan.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-3 h-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Available Plans</h3>
        {PLANS.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "cursor-pointer transition-all hover:border-purple-300",
              plan.recommended && "border-purple-400 bg-purple-50/30",
              subscription.plan === plan.id && "ring-2 ring-purple-500"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {plan.recommended && <Star className="w-4 h-4 text-amber-500" />}
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <span className="font-bold text-purple-600">${plan.price}/mo</span>
              </div>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {subscription.plan !== plan.id && (
                <Button 
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {plan.id === "free" ? "Downgrade" : "Upgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
