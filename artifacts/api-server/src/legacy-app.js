import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 3000);
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);
const DB_FILE = process.env.DEV_DB_FILE || path.join('/tmp', 'smart-kisan-bharat-dev-db.json');
const app = express();
const clients = new Set();
let db;
let saveQueue = Promise.resolve();
const PII_HASH_SALT = process.env.PII_HASH_SALT || '';
const ADMIN_MOBILE_HASH = process.env.ADMIN_MOBILE_HASH || '';
const ADMIN_PIN_HASH = process.env.ADMIN_PIN_HASH || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url: url.replace(/\/+$/, ''), key } : null;
}

function emptyDb() {
  return {
    listings: [],
    bids: [],
    buyers: [],
    orders: [],
    notifications: [],
    approvals: [],
    disputes: [],
    government: { kpis: {}, alerts: [], complianceByDistrict: [] }
  };
}

async function supabaseRequest(pathname, options = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error('Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const response = await fetch(`${config.url}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    console.error(`Supabase storage request failed (${response.status}): ${detail}`);
    const error = new Error(`Database request failed (${response.status}). Check the server logs and Supabase table configuration.`);
    error.status = 503;
    throw error;
  }
  if (response.status === 204 || options.method === 'POST') return null;
  return response.json();
}

function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function createAdminSession() {
  if (!SESSION_SECRET) {
    const error = new Error('Admin sessions are not configured. Set SESSION_SECRET before enabling admin access.');
    error.status = 503;
    throw error;
  }
  const payload = Buffer.from(JSON.stringify({
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    nonce: randomUUID()
  })).toString('base64url');
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function isValidAdminSession(token) {
  if (!SESSION_SECRET || !token) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!constantTimeEqual(signature, expected)) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.role === 'admin' && Number(claims.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function hashPii(value) {
  return createHash('sha256').update(`${PII_HASH_SALT}${String(value || '').trim().toUpperCase()}`).digest('hex');
}

function maskPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 4 ? `+91 ******${digits.slice(-4)}` : 'Phone hidden';
}

function maskTax(value, label) {
  const normalized = String(value || '').replace(/\s/g, '').toUpperCase();
  return normalized ? `${label}: ${'*'.repeat(Math.max(0, normalized.length - 3))}${normalized.slice(-3)}` : `${label}: hidden`;
}

function maskPan(value) {
  const normalized = String(value || '').replace(/\s/g, '').toUpperCase();
  return normalized ? `PAN: ******${normalized.slice(-4)}` : 'PAN: hidden';
}

function publicLocation(item) {
  return item.block && item.district ? `${item.block}, ${item.district}` : 'District not provided';
}

function safeListing(item) {
  return {
    id: item.id, market: item.market, crop: item.crop, category: item.category,
    quantity: item.quantity, unit: item.unit, location: publicLocation(item),
    state: item.state, district: item.district,
    price: item.price, msp: item.msp, quality: item.quality, status: item.status,
    farmer: 'Farmer', certified: Boolean(item.certified),
    postedAt: item.postedAt, image: item.image || null
  };
}

function safeBid(item) {
  return {
    id: item.id, listingId: item.listingId, buyer: item.buyerDisplay || 'Buyer',
    buyerType: item.buyerType, amount: item.amount, quantity: item.quantity,
    status: item.status, verified: Boolean(item.verified), placedAt: item.placedAt
  };
}

function safeBuyer(item) {
  return {
    id: item.id, businessName: item.status === 'verified' ? item.businessName : 'Buyer profile',
    status: item.status,
    gstin: item.gstinMasked || maskTax(item.gstin, 'GST'),
    pan: item.panMasked || maskPan(item.pan),
    verifiedAt: item.verifiedAt
  };
}

function safeOrder(item) {
  return {
    id: item.id, orderNumber: item.orderNumber, crop: item.crop,
    quantity: item.quantity, amount: item.amount, status: item.status,
    updatedAt: item.updatedAt, createdAt: item.createdAt
  };
}

function safeNotification(item) {
  return {
    id: item.id, type: item.type, title: item.title,
    detail: item.type === 'order'
      ? 'Your order status has changed.'
      : item.type === 'bid'
        ? 'A new marketplace offer needs your attention.'
        : item.type === 'listing'
          ? 'Your listing review status has changed.'
          : item.type === 'verification'
            ? 'Your buyer application status has changed.'
            : 'A marketplace update needs your attention.',
    read: Boolean(item.read), createdAt: item.createdAt
  };
}

function safeApproval(item) {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    location: item.location,
    submitted: item.submitted,
    risk: item.risk || 'review'
  };
}

function safeEventPayload(event, payload) {
  if (event === 'listing.created') return safeListing(payload);
  if (event === 'buyer.verified') return safeBuyer(payload);
  if (event === 'buyer.submitted') return { buyer: safeBuyer(payload) };
  if (event === 'bid.created') return { bid: safeBid(payload.bid), notification: safeNotification(payload.notification) };
  if (event === 'bid.accepted') return { bid: safeBid(payload.bid), listing: safeListing(payload.listing), order: safeOrder(payload.order), notification: safeNotification(payload.notification) };
  if (event === 'order.updated') return { order: safeOrder(payload.order), notification: safeNotification(payload.notification) };
  return { event: 'updated' };
}

function migrateDb(data) {
  let changed = false;
  data.buyers = (data.buyers || []).map(item => {
    if (item.gstin) { item.gstinHash = hashPii(item.gstin); item.gstinMasked = maskTax(item.gstin, 'GST'); delete item.gstin; changed = true; }
    if (item.pan) { item.panHash = hashPii(item.pan); item.panMasked = maskPan(item.pan); delete item.pan; changed = true; }
    return item;
  });
  data.listings.forEach(item => {
    if (item.farmer) { delete item.farmer; changed = true; }
    if (item.exactAddress) { delete item.exactAddress; changed = true; }
  });
  data.bids.forEach(item => {
    if (item.buyer) { delete item.buyer; changed = true; }
  });
  return changed;
}

async function loadDb() {
  if (!db) {
    const config = getSupabaseConfig();
    if (config) {
      const rows = await supabaseRequest('app_state?select=payload&id=eq.smart-kisan-bharat');
      db = Array.isArray(rows) && rows[0]?.payload ? rows[0].payload : emptyDb();
    } else if (IS_SERVERLESS) {
      const error = new Error('Live database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
      error.status = 503;
      throw error;
    } else {
      try {
        db = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        db = emptyDb();
      }
    }
    db.listings ||= [];
    db.bids ||= [];
    db.buyers ||= [];
    db.orders ||= [];
    db.notifications ||= [];
    db.approvals ||= [];
    db.disputes ||= [];
    db.government ||= { kpis: {}, alerts: [], complianceByDistrict: [] };
    if (migrateDb(db)) await saveDb();
  }
  return db;
}

async function saveDb() {
  const snapshot = JSON.stringify(db, null, 2);
  saveQueue = saveQueue.then(async () => {
    if (getSupabaseConfig()) {
      await supabaseRequest('app_state?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: 'smart-kisan-bharat',
          payload: JSON.parse(snapshot),
          updated_at: new Date().toISOString()
        })
      });
    } else if (!IS_SERVERLESS) {
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      const tempFile = `${DB_FILE}.${process.pid}.tmp`;
      await fs.writeFile(tempFile, snapshot, 'utf8');
      await fs.rename(tempFile, DB_FILE);
    } else {
      const error = new Error('Live database is not configured. Refusing to use ephemeral serverless storage.');
      error.status = 503;
      throw error;
    }
  });
  return saveQueue.catch(error => {
    saveQueue = Promise.resolve();
    throw error;
  });
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(safeEventPayload(event, payload))}\n\n`;
  clients.forEach(client => {
    try { client.write(message); } catch { clients.delete(client); }
  });
}

function id(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function addNotification(data, notification) {
  const item = { id: id('notification'), read: false, createdAt: new Date().toISOString(), ...notification };
  data.notifications.unshift(item);
  return item;
}

function normalizeTaxId(value) {
  return String(value || '').trim().toUpperCase().replace(/\s/g, '');
}

app.use(express.json({ limit: '5mb' }));

app.get(['/api/health', '/api/healthz'], async (_req, res) => {
  const data = await loadDb();
  res.json({
    ok: true,
    service: 'smart-kisan-bharat-api',
    port: PORT,
    bind: '0.0.0.0',
    realtime: !IS_SERVERLESS,
    updates: IS_SERVERLESS ? 'polling' : 'server-sent-events',
    supabaseConfigured: Boolean(getSupabaseConfig()),
    persistence: getSupabaseConfig() ? 'supabase-app-state' : 'local-json',
    records: { listings: data.listings.length, bids: data.bids.length, orders: data.orders.length },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard', async (_req, res) => {
  const data = await loadDb();
  const activeBids = data.bids.filter(b => b.status === 'active').length;
  const value = data.orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const farmerCount = new Set(data.listings.map(listing => listing.farmerId).filter(Boolean)).size;
  const verifiedBuyers = data.buyers.filter(buyer => buyer.status === 'verified').length;
  const liveListings = data.listings.filter(listing => listing.status === 'live').length;
  res.json({
    metrics: {
      farmers: farmerCount,
      buyers: verifiedBuyers,
      activeBids,
      transactions: data.orders.length,
      transactionValue: value,
      marketListings: liveListings
    },
    highlights: [
      { label: 'Live listings', value: liveListings, tone: 'green' },
      { label: 'Verified buyers', value: verifiedBuyers, tone: 'gold' },
      { label: 'Completed order value', value, tone: 'blue' }
    ],
    updatedAt: new Date().toISOString()
  });
});

app.get('/api/listings', async (req, res) => {
  const data = await loadDb();
  const market = ['crops', 'plants'].includes(req.query.market) ? req.query.market : 'crops';
  const state = req.query.state || 'all';
  const district = req.query.district || 'all';
  const q = String(req.query.q || '').toLowerCase();
  const listings = data.listings.filter(item => {
    const farmerId = String(req.query.farmerId || '');
    if (farmerId) return item.farmerId === farmerId;
    const matchesMarket = item.market === market;
    const matchesState = state === 'all' || item.state === state;
    const matchesDistrict = district === 'all' || item.district === district;
    const matchesStatus = item.status === 'live';
    const matchesSearch = !q || `${item.crop} ${item.category} ${publicLocation(item)}`.toLowerCase().includes(q);
    return matchesMarket && matchesState && matchesDistrict && matchesStatus && matchesSearch;
  });
  const marketListings = data.listings.filter(item => item.market === market && item.status === 'live');
  const states = [...new Set(marketListings.map(item => item.state))].sort().map(name => ({
    name,
    districts: [...new Set(marketListings.filter(item => item.state === name).map(item => item.district))].sort()
  }));
  res.json({ listings: listings.map(safeListing), total: listings.length, filters: { market, state, district, q }, options: { states } });
});

app.get('/api/marketplace/options', async (req, res) => {
  const data = await loadDb();
  const market = ['crops', 'plants'].includes(req.query.market) ? req.query.market : 'crops';
  const rows = data.listings.filter(item => item.market === market && item.status === 'live');
  const states = [...new Set(rows.map(item => item.state))].sort().map(name => ({
    name,
    districts: [...new Set(rows.filter(item => item.state === name).map(item => item.district))].sort()
  }));
  res.json({ market, states });
});

app.get('/api/bids', async (req, res) => {
  const data = await loadDb();
  const farmerListingIds = req.query.farmerId
    ? new Set(data.listings.filter(item => item.farmerId === req.query.farmerId).map(item => item.id))
    : null;
  const bids = data.bids.filter(bid =>
    (!req.query.listingId || bid.listingId === req.query.listingId) &&
    (!farmerListingIds || farmerListingIds.has(bid.listingId))
  );
  res.json({ bids: bids.sort((a, b) => b.amount - a.amount).map(safeBid) });
});

app.get('/api/buyers/:buyerId', async (req, res) => {
  const data = await loadDb();
  const buyer = data.buyers.find(item => item.id === req.params.buyerId);
  if (!buyer) return res.status(404).json({ error: 'Buyer profile not found' });
  res.json({ buyer: safeBuyer(buyer) });
});

app.post('/api/buyers/verify', async (req, res) => {
  const data = await loadDb();
  if (!PII_HASH_SALT) return res.status(503).json({ error: 'Buyer identity storage is not configured. Set PII_HASH_SALT before accepting applications.' });
  const businessName = String(req.body?.businessName || '').trim();
  const gstin = normalizeTaxId(req.body?.gstin);
  const pan = normalizeTaxId(req.body?.pan);
  const gstValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gstin);
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  if (!businessName || !gstValid || !panValid) {
    return res.status(422).json({ error: 'Enter a valid business name, GSTIN and PAN to continue verification.', fields: { gstin: gstValid, pan: panValid, businessName: Boolean(businessName) } });
  }
  const gstHash = hashPii(gstin);
  const panHash = hashPii(pan);
  let buyer = data.buyers.find(item => item.gstinHash === gstHash || item.panHash === panHash);
  if (buyer && buyer.status === 'verified') return res.json({ buyer: safeBuyer(buyer), message: 'Buyer identity already verified.' });
  buyer = buyer || { id: `buyer-${randomUUID()}` };
  Object.assign(buyer, {
    businessName,
    gstinHash: gstHash,
    gstinMasked: maskTax(gstin, 'GST'),
    panHash,
    panMasked: maskPan(pan),
    status: 'pending',
    submittedAt: new Date().toISOString()
  });
  const existingIndex = data.buyers.findIndex(item => item.id === buyer.id);
  if (existingIndex >= 0) data.buyers[existingIndex] = buyer; else data.buyers.push(buyer);
  addNotification(data, { audience: 'admin', type: 'verification', title: 'Buyer review requested', detail: 'A buyer submitted business details for manual review.', buyerId: buyer.id });
  await saveDb();
  broadcast('buyer.submitted', buyer);
  res.json({ buyer: safeBuyer(buyer), message: 'Details submitted. Bidding will unlock after admin approval.' });
});

app.get('/api/notifications', async (req, res) => {
  const data = await loadDb();
  const audience = String(req.query.audience || '');
  const notifications = data.notifications.filter(item => !audience || item.audience === audience || item.buyerId === audience || item.farmerId === audience).slice(0, 30);
  res.json({ notifications: notifications.map(safeNotification), unread: notifications.filter(item => !item.read).length });
});

app.post('/api/notifications/read', async (req, res) => {
  const data = await loadDb();
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  data.notifications.forEach(item => { if (!ids.length || ids.includes(item.id)) item.read = true; });
  await saveDb();
  res.json({ ok: true });
});

app.get('/api/orders', async (req, res) => {
  const data = await loadDb();
  const orders = data.orders.filter(order => !req.query.buyerId || order.buyerId === req.query.buyerId);
  res.json({ orders: orders.map(safeOrder) });
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const data = await loadDb();
  const order = data.orders.find(item => item.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.body?.status !== 'disputed') return res.status(422).json({ error: 'Buyers can only report an order issue here.' });
  if (req.body?.buyerId !== order.buyerId) return res.status(403).json({ error: 'Buyer profile does not match this order.' });
  order.status = 'disputed';
  order.updatedAt = new Date().toISOString();
  let dispute = data.disputes.find(item => item.orderId === order.id && item.status !== 'resolved');
  if (!dispute) {
    dispute = {
      id: `dispute-${randomUUID()}`,
      orderId: order.id,
      subject: `Order ${order.orderNumber}`,
      priority: 'normal',
      status: 'open',
      createdAt: new Date().toISOString()
    };
    data.disputes.unshift(dispute);
  }
  const notification = addNotification(data, {
    audience: order.buyerId,
    buyerId: order.buyerId,
    type: 'order',
    title: 'Order issue reported',
    detail: `${order.orderNumber} · ${order.crop}`
  });
  await saveDb();
  broadcast('order.updated', { order, notification });
  res.json({ order: safeOrder(order), dispute: { id: dispute.id, status: dispute.status } });
});

app.get('/api/government', async (req, res) => {
  const data = await loadDb();
  const requestedTier = String(req.query.tier || 'State');
  const tier = ['Block', 'District', 'State', 'National'].includes(requestedTier) ? requestedTier : 'State';
  const activeBidsByListing = new Map();
  const ordersByListing = new Map();
  data.bids.filter(item => item.status === 'active').forEach(item => {
    activeBidsByListing.set(item.listingId, (activeBidsByListing.get(item.listingId) || 0) + 1);
  });
  data.orders.forEach(item => {
    ordersByListing.set(item.listingId, (ordersByListing.get(item.listingId) || 0) + 1);
  });
  const groups = new Map();
  data.listings.forEach(listing => {
    const name = tier === 'National'
      ? 'All marketplace regions'
      : tier === 'State'
        ? listing.state
        : tier === 'District'
          ? `${listing.district}, ${listing.state}`
          : `${listing.block}, ${listing.district}, ${listing.state}`;
    const group = groups.get(name) || {
      name,
      farmers: new Set(),
      liveListings: 0,
      submittedListings: 0,
      activeBids: 0,
      orders: 0
    };
    if (listing.farmerId) group.farmers.add(listing.farmerId);
    if (listing.status === 'live') group.liveListings += 1;
    if (listing.status === 'draft') group.submittedListings += 1;
    group.activeBids += activeBidsByListing.get(listing.id) || 0;
    group.orders += ordersByListing.get(listing.id) || 0;
    groups.set(name, group);
  });
  const activityByArea = [...groups.values()]
    .map(({ farmers, ...group }) => ({ ...group, farmers: farmers.size }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const governmentFeedConnected = Boolean(data.government.feedSource);
  const officialKpis = governmentFeedConnected ? data.government.kpis : {};
  const officialAlerts = governmentFeedConnected ? data.government.alerts : [];
  const platformMetrics = {
    liveListings: data.listings.filter(item => item.status === 'live').length,
    submittedListings: data.listings.filter(item => item.status === 'draft').length,
    verifiedBuyers: data.buyers.filter(item => item.status === 'verified').length,
    openBids: data.bids.filter(item => item.status === 'active').length,
    orders: data.orders.length
  };
  res.json({
    tier,
    kpis: { ...officialKpis, ...platformMetrics, compliance: officialKpis.compliance ?? null, openAlerts: officialAlerts.length },
    alerts: officialAlerts,
    complianceByDistrict: governmentFeedConnected ? data.government.complianceByDistrict : [],
    activityByArea,
    governmentFeedConnected,
    updatedAt: new Date().toISOString()
  });
});

app.post('/api/listings', async (req, res) => {
  const data = await loadDb();
  const body = req.body || {};
  const crop = String(body.crop || '').trim();
  const quantity = Number(body.quantity);
  const publicBlock = String(body.block || '').trim();
  const publicDistrict = String(body.district || '').trim();
  const state = String(body.state || '').trim();
  if (!crop || !Number.isFinite(quantity) || quantity <= 0 || !publicBlock || !publicDistrict || !state || !body.farmerId) {
    return res.status(400).json({ error: 'Crop, positive quantity, farmer profile, block, district and state are required.' });
  }
  const price = Number(body.price || 0);
  if (!Number.isFinite(price) || price < 0) return res.status(422).json({ error: 'Price must be a non-negative number.' });
  // Never promote the free-text location field to a public address. Only
  // structured block/district fields are allowed across the privacy boundary.
  const listing = {
    id: `listing-${randomUUID()}`,
    market: body.market === 'plants' ? 'plants' : 'crops',
    crop,
    category: String(body.category || 'General'),
    quantity,
    unit: String(body.unit || 'quintals'),
    location: `${publicBlock}, ${publicDistrict}`,
    block: publicBlock,
    state,
    district: publicDistrict,
    price,
    msp: Number(body.msp || 0),
    quality: null,
    status: 'draft',
    farmerId: String(body.farmerId),
    certified: false,
    postedAt: new Date().toISOString(),
    image: null
  };
  data.listings.unshift(listing);
  await saveDb();
  broadcast('listing.created', listing);
  res.status(201).json({ listing: safeListing(listing) });
});

app.post('/api/bids', async (req, res) => {
  const data = await loadDb();
  const body = req.body || {};
  if (!body.listingId || !body.amount || !body.quantity) return res.status(400).json({ error: 'listingId, amount and quantity are required' });
  const listing = data.listings.find(item => item.id === body.listingId && item.status === 'live');
  if (!listing) return res.status(404).json({ error: 'Live listing not found' });
  const buyer = data.buyers.find(item => item.id === body.buyerId);
  if (!buyer || buyer.status !== 'verified') return res.status(403).json({ error: 'Buyer review must be approved before bidding.' });
  const amount = Number(body.amount);
  const quantity = Number(body.quantity);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(quantity) || quantity <= 0 || quantity > listing.quantity) {
    return res.status(422).json({ error: 'Bid price and quantity must be valid and within the listing quantity.' });
  }
  const bid = {
    id: id('bid'),
    listingId: body.listingId,
    buyerId: buyer.id,
    buyerDisplay: buyer.businessName,
    buyerType: String(body.buyerType || 'Corporate'),
    amount,
    quantity,
    status: 'active',
    verified: true,
    placedAt: new Date().toISOString()
  };
  data.bids.push(bid);
  const notification = addNotification(data, { audience: 'farmer', farmerId: listing.farmerId, type: 'bid', title: 'New live bid received', detail: `A verified buyer offered for ${listing.crop}`, listingId: listing.id });
  await saveDb();
  broadcast('bid.created', { bid, notification });
  res.status(201).json({ bid: safeBid(bid), notification: safeNotification(notification) });
});

app.post('/api/bids/:id/accept', async (req, res) => {
  const data = await loadDb();
  const bid = data.bids.find(item => item.id === req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });
  if (bid.status !== 'active') return res.status(409).json({ error: 'This bid is no longer active.' });
  data.bids.forEach(item => { if (item.listingId === bid.listingId) item.status = item.id === bid.id ? 'accepted' : 'closed'; });
  const listing = data.listings.find(item => item.id === bid.listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (!bid.buyerId) return res.status(422).json({ error: 'Bid has no verified buyer profile.' });
  listing.status = 'contracted';
  const order = {
    id: id('order'),
    orderNumber: `SKB-${new Date().getFullYear()}-${String(data.orders.length + 1).padStart(4, '0')}`,
    listingId: bid.listingId,
    bidId: bid.id,
    buyerId: bid.buyerId,
    crop: listing?.crop || 'Marketplace order',
    quantity: bid.quantity,
    amount: bid.amount * bid.quantity,
    status: 'payment_pending',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  data.orders.unshift(order);
  const notification = addNotification(data, { audience: bid.buyerId, buyerId: bid.buyerId, type: 'bid', title: 'Your bid was accepted', detail: `${order.orderNumber} · Payment and pickup are ready`, orderId: order.id });
  await saveDb();
  broadcast('bid.accepted', { bid, listing, order, notification });
  res.json({ bid: safeBid(bid), listing: safeListing(listing), order: safeOrder(order), message: 'Green Tick confirmation recorded' });
});

app.post('/api/admin/login', (req, res) => {
  const { mobile, pin } = req.body || {};
  if (!ADMIN_MOBILE_HASH || !ADMIN_PIN_HASH || !PII_HASH_SALT || !SESSION_SECRET) {
    return res.status(503).json({ ok: false, error: 'Admin login is not configured. Set the admin credential hashes, PII_HASH_SALT, and SESSION_SECRET.' });
  }
  if (constantTimeEqual(hashPii(mobile), ADMIN_MOBILE_HASH) && constantTimeEqual(hashPii(pin), ADMIN_PIN_HASH)) {
    return res.json({ ok: true, role: 'admin', session: createAdminSession() });
  }
  res.status(401).json({ ok: false, error: 'Invalid mobile or PIN' });
});

function requireAdmin(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!SESSION_SECRET) return res.status(503).json({ error: 'Admin sessions are not configured.' });
  if (!isValidAdminSession(token)) return res.status(401).json({ error: 'Admin session required or expired.' });
  next();
}

function pendingApprovals(data) {
  const buyerApprovals = data.buyers
    .filter(buyer => buyer.status === 'pending')
    .map(buyer => ({
      id: `buyer.${buyer.id}`,
      type: 'Buyer',
      name: buyer.businessName || 'Buyer application',
      location: 'Business details submitted',
      submitted: buyer.submittedAt || 'Pending review',
      risk: 'review'
    }));
  const listingApprovals = data.listings
    .filter(listing => listing.status === 'draft')
    .map(listing => ({
      id: `listing.${listing.id}`,
      type: 'Listing',
      name: listing.crop,
      location: `${listing.district}, ${listing.state}`,
      submitted: listing.postedAt || 'Pending review',
      risk: 'review'
    }));
  return [...buyerApprovals, ...listingApprovals, ...data.approvals.map(safeApproval)];
}

app.get('/api/admin/metrics', requireAdmin, async (_req, res) => {
  const data = await loadDb();
  const totalValue = data.orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  res.json({
    metrics: {
      activeFarmers: new Set(data.listings.map(item => item.farmerId).filter(Boolean)).size,
      verifiedBuyers: data.buyers.filter(buyer => buyer.status === 'verified').length,
      activeBids: data.bids.filter(bid => bid.status === 'active').length,
      totalValue
    },
    approvals: pendingApprovals(data),
    disputes: data.disputes.filter(item => item.status !== 'resolved')
  });
});

app.post('/api/admin/approvals/:id/decision', requireAdmin, async (req, res) => {
  const data = await loadDb();
  const decision = String(req.body?.decision || '');
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(422).json({ error: 'Decision must be approve or reject.' });
  }
  const separator = req.params.id.indexOf('.');
  if (separator < 1) return res.status(400).json({ error: 'Invalid approval ID.' });
  const kind = req.params.id.slice(0, separator);
  const recordId = req.params.id.slice(separator + 1);
  if (kind === 'buyer') {
    const buyer = data.buyers.find(item => item.id === recordId && item.status === 'pending');
    if (!buyer) return res.status(404).json({ error: 'Pending buyer application not found.' });
    buyer.status = decision === 'approve' ? 'verified' : 'rejected';
    if (decision === 'approve') buyer.verifiedAt = new Date().toISOString();
    const notification = addNotification(data, {
      audience: buyer.id,
      buyerId: buyer.id,
      type: 'verification',
      title: decision === 'approve' ? 'Buyer application approved' : 'Buyer application declined',
      detail: decision === 'approve' ? 'Your account can now place bids.' : 'Your account application was declined.'
    });
    await saveDb();
    broadcast('buyer.verified', buyer);
    return res.json({ approval: { id: req.params.id, status: buyer.status }, notification: safeNotification(notification) });
  }
  if (kind === 'listing') {
    const listing = data.listings.find(item => item.id === recordId && item.status === 'draft');
    if (!listing) return res.status(404).json({ error: 'Pending listing not found.' });
    listing.status = decision === 'approve' ? 'live' : 'rejected';
    if (decision === 'approve') listing.approvedAt = new Date().toISOString();
    const notification = addNotification(data, {
      audience: listing.farmerId,
      farmerId: listing.farmerId,
      type: 'listing',
      title: decision === 'approve' ? 'Listing approved' : 'Listing declined',
      detail: `${listing.crop} · ${decision === 'approve' ? 'now visible in the marketplace' : 'not published'}`
    });
    await saveDb();
    broadcast('listing.updated', listing);
    return res.json({ approval: { id: req.params.id, status: listing.status }, notification: safeNotification(notification) });
  }
  return res.status(400).json({ error: 'Unsupported approval type.' });
});

app.post('/api/admin/disputes/:id/resolve', requireAdmin, async (req, res) => {
  const data = await loadDb();
  const dispute = data.disputes.find(item => item.id === req.params.id && item.status !== 'resolved');
  if (!dispute) return res.status(404).json({ error: 'Open dispute not found.' });
  dispute.status = 'resolved';
  dispute.resolvedAt = new Date().toISOString();
  const order = data.orders.find(item => item.id === dispute.orderId);
  if (order) {
    order.status = 'dispute_resolved';
    order.updatedAt = dispute.resolvedAt;
  }
  await saveDb();
  if (order) broadcast('order.updated', { order, notification: { type: 'order', title: 'Dispute resolved' } });
  res.json({ dispute: { id: dispute.id, status: dispute.status } });
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ connectedAt: new Date().toISOString() })}\n\n`);
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found.' });
  next();
});

app.use((error, _req, res, _next) => {
  const status = Number(error.status) || 500;
  if (status >= 500) console.error(`Smart Kisan Bharat API error: ${error.message}`);
  res.status(status).json({
    error: status === 500 ? 'Internal server error.' : error.message
  });
});

export default app;
export { app };