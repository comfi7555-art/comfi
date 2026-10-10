import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  const authUser = await verifyAuth(request);
  if (!authUser || authUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const products = await db.products.find();
    const orders = await db.orders.find();
    const customers = await db.users.find();
    const coupons = await db.generic.getCollection('coupons');
    const collections = await db.generic.getCollection('collections');
    const inventoryLogs = await db.generic.getCollection('inventoryLogs');
    const shippingRates = await db.generic.getCollection('shippingRates');
    const supportTickets = await db.generic.getCollection('supportTickets');
    const auditLogs = await db.generic.getCollection('auditLogs');
    const contentSettings = (await db.generic.getCollection('contentSettings')) || {};

    return NextResponse.json({
      products,
      orders,
      customers,
      coupons,
      collections,
      inventoryLogs,
      shippingRates,
      supportTickets,
      auditLogs,
      contentSettings
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const authUser = await verifyAuth(request);
  if (!authUser || authUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { action, collection, data, id } = await request.json();

    if (action === 'addItem') {
      const created = await db.generic.addItem(collection, data);
      await db.generic.addItem('auditLogs', {
        user: authUser.name || 'Admin',
        action: `Added new item to ${collection}: ${data.name || data.code || data.subject || created.id}`,
        ip: '127.0.0.1'
      });
      return NextResponse.json({ success: true, item: created });
    }

    if (action === 'updateItem') {
      const updated = await db.generic.updateItem(collection, id, data);
      await db.generic.addItem('auditLogs', {
        user: authUser.name || 'Admin',
        action: `Updated ${collection} item #${id}`,
        ip: '127.0.0.1'
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === 'deleteItem') {
      await db.generic.deleteItem(collection, id);
      await db.generic.addItem('auditLogs', {
        user: authUser.name || 'Admin',
        action: `Deleted ${collection} item #${id}`,
        ip: '127.0.0.1'
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error performing admin mutation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
