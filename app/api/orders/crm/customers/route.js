import { NextResponse } from 'next/server';
import { db, isSupabaseConfigured, supabase } from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    let customersList = [];

    if (isSupabaseConfigured) {
      // Supabase CRM query
      const { data: users, error: usersErr } = await supabase.from('profiles').select('*').eq('role', 'customer');
      if (usersErr) throw usersErr;

      const { data: orders, error: ordersErr } = await supabase.from('orders').select('*');
      if (ordersErr) throw ordersErr;

      customersList = (users || []).map(u => {
        const userOrders = (orders || []).filter(o => o.user_id === u.id);
        const totalSpent = userOrders.reduce((sum, o) => {
          if (o.payment_status === 'Paid') {
            return sum + o.total_amount;
          }
          return sum;
        }, 0);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          totalOrdersCount: userOrders.length,
          totalSpent,
          orders: userOrders
        };
      });

    } else {
      // JSON CRM query
      const users = await db.users.find({ role: 'customer' });
      const orders = await db.orders.find({});

      customersList = users.map(user => {
        const userOrders = orders.filter(o => o.userId === user.id);
        const totalSpent = userOrders.reduce((sum, o) => {
          if (o.paymentStatus === 'Paid') {
            return sum + o.totalAmount;
          }
          return sum;
        }, 0);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          totalOrdersCount: userOrders.length,
          totalSpent,
          orders: userOrders
        };
      });
    }

    return NextResponse.json(customersList);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error retrieving CRM database' }, { status: 500 });
  }
}
