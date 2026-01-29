import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

// API route to get customer ID from a checkout session
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      customerId: session.customer,
      subscriptionId: session.subscription,
    })
  } catch (error) {
    console.error("Get customer error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get customer" },
      { status: 500 },
    )
  }
}
