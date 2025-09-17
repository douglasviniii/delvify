

import { NextRequest, NextResponse } from 'next/headers';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config({ path: '.env' });

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Error message: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('✅ Checkout session completed:', session.id);

            const { userId, tenantId, courseId } = session.metadata || {};
            
            if (!userId || !tenantId || !courseId) {
                console.error('❌ Missing metadata in checkout session:', session.id);
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
            }

            let paymentMethod: 'card' | 'boleto' | 'pix' | 'free' = 'card'; // default to card
            
            try {
                // To get the payment method, we need to retrieve the payment intent if it exists
                if (session.payment_intent) {
                    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                    const paymentMethodType = paymentIntent.payment_method_types[0];

                     if (paymentMethodType === 'card') {
                        paymentMethod = 'card';
                    } else if (paymentMethodType === 'boleto') {
                        paymentMethod = 'boleto';
                    } else if (paymentMethodType === 'pix') {
                        paymentMethod = 'pix';
                    }
                } else if (session.mode === 'payment' && session.payment_method_types.length > 0) {
                    // Fallback for some checkout modes
                     const pmType = session.payment_method_types[0];
                     if (pmType === 'card' || pmType === 'boleto' || pmType === 'pix') {
                         paymentMethod = pmType;
                     }
                }


                // Grant course access to the user
                const userDocRef = adminDb.collection('users').doc(userId);
                await userDocRef.set({
                    purchasedCourses: {
                        [courseId]: {
                            tenantId: tenantId,
                            purchasedAt: FieldValue.serverTimestamp(),
                            price: session.amount_total ? session.amount_total / 100 : 0,
                        }
                    }
                }, { merge: true });

                console.log(`Granted access to course ${courseId} for user ${userId}`);

                // Add to tenant's purchase history
                const purchaseRef = adminDb.collection(`tenants/${tenantId}/purchases`).doc();
                await purchaseRef.set({
                    userId,
                    courseId,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency,
                    stripeCheckoutSessionId: session.id,
                    paymentMethod: paymentMethod, // Save the determined payment method
                    createdAt: FieldValue.serverTimestamp(),
                    status: 'completed', // Set status to completed
                });

                console.log(`Purchase recorded for tenant ${tenantId} via ${paymentMethod}`);

            } catch (dbError) {
                console.error('❌ Database error after successful payment:', dbError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
            
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

// Simple GET handler for testing endpoint availability
export async function GET() {
    return NextResponse.json({ message: "Stripe webhook endpoint is active. Use POST for events." });
}
