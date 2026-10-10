import { NextResponse } from 'next/server';

const VALID_COUPONS = {
  "COMFI10": { type: "percentage", value: 10, description: "10% off entire order" },
  "COMFI10OFF": { type: "percentage", value: 10, description: "10% off entire order" },
  "WELCOME15": { type: "percentage", value: 15, description: "15% off first order discount" },
  "SAVE100": { type: "flat", value: 100, minSubtotal: 299, description: "₹100 flat discount on orders over ₹299" },
  "PERIODCARE": { type: "flat", value: 150, minSubtotal: 499, description: "₹150 flat discount on custom bundles over ₹499" }
};

export async function POST(req) {
  try {
    const { code, subtotal = 0 } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = VALID_COUPONS[cleanCode];

    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid coupon code. Try 'COMFI10' for 10% off or 'WELCOME15' for 15% off!" 
      }, { status: 400 });
    }

    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return NextResponse.json({ 
        success: false, 
        message: `Coupon '${cleanCode}' requires a minimum subtotal of ₹${coupon.minSubtotal}.` 
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else if (coupon.type === "flat") {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: cleanCode,
      discountType: coupon.type,
      discountValue: coupon.value,
      discountAmount,
      description: coupon.description,
      message: `🎉 Coupon '${cleanCode}' applied! Saved ₹${discountAmount}.`
    });

  } catch (error) {
    console.error("Coupon verification error:", error);
    return NextResponse.json({ success: false, message: "Internal server error verifying coupon" }, { status: 500 });
  }
}
