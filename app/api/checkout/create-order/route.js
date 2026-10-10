import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
if (keyId && keySecret && keyId !== 'YOUR_KEY_ID' && keySecret !== 'YOUR_KEY_SECRET') {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.error("Razorpay setup failed:", err);
  }
}

export async function POST(request) {
  try {
    let user = await verifyAuth(request);

    const { 
      amount, 
      subtotal, 
      discountAmount, 
      deliveryCharge,
      gstAmount,
      couponCode, 
      gstin, 
      gstinDetails, 
      isMockPayment,
      items, 
      shippingAddress, 
      customerName, 
      customerEmail 
    } = await request.json();

    // Guest checkout fallback if token missing or unauthenticated
    if (!user) {
      user = {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: customerName || shippingAddress?.name || 'Guest Customer',
        email: customerEmail || user?.email || 'customer@comfi.shop',
        role: 'customer'
      };
    }
    
    if (!amount || !items || !shippingAddress) {
      return NextResponse.json({ message: 'Missing order parameters' }, { status: 400 });
    }

    const internalOrderId = 'ord_' + Math.random().toString(36).substr(2, 9);

    // If Mock Payment Mode selected OR Razorpay instance unavailable:
    if (isMockPayment || !razorpayInstance) {
      const order = await db.orders.create({
        userId: user.id,
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        items,
        totalAmount: amount,
        subtotal: subtotal || amount,
        discountAmount: discountAmount || 0,
        deliveryCharge: deliveryCharge || 0,
        gstAmount: gstAmount || 0,
        couponCode: couponCode || null,
        gstin: gstin || null,
        gstinDetails: gstinDetails || null,
        shippingAddress,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        razorpayOrderId: `mock_rzp_${Math.random().toString(36).substr(2, 9)}`
      });

      return NextResponse.json({
        success: true,
        isMockPayment: true,
        orderId: order.razorpayOrderId,
        amount: amount,
        currency: "INR",
        dbOrderId: order.id
      });

    } else {
      // Razorpay Live Mode
      const options = {
        amount: Math.round(amount * 100), // in paise
        currency: "INR",
        receipt: internalOrderId
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      const order = await db.orders.create({
        userId: user.id,
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        items,
        totalAmount: amount,
        subtotal: subtotal || amount,
        discountAmount: discountAmount || 0,
        deliveryCharge: deliveryCharge || 0,
        gstAmount: gstAmount || 0,
        couponCode: couponCode || null,
        gstin: gstin || null,
        gstinDetails: gstinDetails || null,
        shippingAddress,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        razorpayOrderId: razorpayOrder.id
      });

      return NextResponse.json({
        success: true,
        isMockPayment: false,
        keyId,
        orderId: razorpayOrder.id,
        amount: options.amount,
        currency: "INR",
        dbOrderId: order.id
      });
    }
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ message: err.message || 'Error initiating order creation' }, { status: 500 });
  }
}
