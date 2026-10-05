import React, { useEffect, useState } from 'react';
import './status-banner.css';

const languages = [
  ['en', 'English'], ['hi', 'हिन्दी'], ['pa', 'ਪੰਜਾਬੀ'], ['mr', 'मराठी'], ['gu', 'ગુજરાતી'],
  ['te', 'తెలుగు'], ['ta', 'தமிழ்'], ['bn', 'বাংলা'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം']
];

const translations = {
  en: { home: 'Overview', farmer: 'Farmer / Seller', buyer: 'Buyer / Corporate', government: 'Government', admin: 'Admin', live: 'Live marketplace', trusted: 'Farmer-to-buyer marketplace', hero: 'Better prices for growers. Better supply for India.', heroSub: 'A shared marketplace for crops, nursery plants, transparent offers, and order follow-up — from Bhuna to Bharat.', explore: 'Explore marketplace', listCrop: 'List a crop', verified: 'Approved buyers', listings: 'Live listings', activeBids: 'Active bids', value: 'Accepted-order value', portal: 'Choose your workspace', farmerDesc: 'List harvests, review incoming offers, and accept a bid.', buyerDesc: 'Browse live crop and nursery plant listings, submit offers, and track accepted orders.', govtDesc: 'Review marketplace activity and export available platform data.', adminDesc: 'Review buyer applications and farmer listings, and resolve order disputes.', marketplace: 'Pan-India marketplace', crops: 'Agricultural crops', plants: 'Nursery plants', radius: 'Radius', allStates: 'All states', allDistricts: 'All districts', search: 'Search crops, plants or locations', placeBid: 'Place bid', viewBids: 'View bids', quality: 'Provided quality score', accept: 'Accept offer', draftSaved: 'Draft saved offline', liveStream: 'Live bid stream', govtTitle: 'Government data portal', adminTitle: 'Platform operations', login: 'Secure admin login', mobile: 'Mobile number', pin: 'PIN', signIn: 'Sign in', logout: 'Sign out', approvalQueue: 'Approval queue', disputes: 'Dispute resolution', tier: 'Dashboard tier', block: 'Block', district: 'District', state: 'State', national: 'National', compliance: 'MSP compliance', verifiedFarmers: 'Verified farmers', mandi: 'Mandi tax tracked', activity: 'Activity feed', close: 'Close', submit: 'Submit listing', quantity: 'Quantity', location: 'Location', cropName: 'Crop / plant name', price: 'Starting price', category: 'Category' },
  hi: { home: 'अवलोकन', farmer: 'किसान / विक्रेता', buyer: 'खरीदार / कॉर्पोरेट', government: 'सरकार', admin: 'एडमिन', live: 'लाइव मार्केटप्लेस', trusted: 'विश्वसनीय किसान-से-खरीदार व्यापार', hero: 'किसानों के लिए बेहतर भाव। भारत के लिए बेहतर आपूर्ति।', heroSub: 'फसलों, नर्सरी पौधों, पारदर्शी बोली और भरोसेमंद पिकअप का एक सत्यापित नेटवर्क — भुना से भारत तक।', explore: 'मार्केटप्लेस देखें', listCrop: 'फसल सूचीबद्ध करें', verified: 'सत्यापित नेटवर्क', listings: 'लाइव लिस्टिंग', activeBids: 'सक्रिय बोलियां', value: 'लेनदेन मूल्य', portal: 'अपना कार्यक्षेत्र चुनें', farmerDesc: 'कुछ ही सेकंड में उपज सूचीबद्ध करें, स्थानीय बोलियां सुनें और ग्रीन टिक से स्वीकार करें।', buyerDesc: 'लैब-आधारित गुणवत्ता के साथ सत्यापित फसल और नर्सरी पौधे खरीदें।', govtDesc: 'एमएसपी अनुपालन, किसान सत्यापन और मंडी अर्थव्यवस्था पर नज़र रखें।', adminDesc: 'एक नियंत्रण कक्ष से अनुमोदन, विवाद और प्लेटफॉर्म स्वास्थ्य संभालें।', marketplace: 'पैन-इंडिया मार्केटप्लेस', crops: 'कृषि फसलें', plants: 'नर्सरी पौधे', radius: 'दायरा', allStates: 'सभी राज्य', allDistricts: 'सभी जिले', search: 'फसल, पौधे या स्थान खोजें', placeBid: 'बोली लगाएं', viewBids: 'बोलियां देखें', quality: 'एआई गुणवत्ता स्कोर', accept: 'ग्रीन टिक से स्वीकार करें', draftSaved: 'ड्राफ्ट ऑफलाइन सेव', liveStream: 'लाइव बोली स्ट्रीम', govtTitle: 'सार्वजनिक कृषि इंटेलिजेंस', adminTitle: 'प्लेटफॉर्म संचालन', login: 'सुरक्षित एडमिन लॉगिन', mobile: 'मोबाइल नंबर', pin: 'पिन', signIn: 'साइन इन', logout: 'साइन आउट', approvalQueue: 'अनुमोदन कतार', disputes: 'विवाद समाधान', tier: 'डैशबोर्ड स्तर', block: 'ब्लॉक', district: 'जिला', state: 'राज्य', national: 'राष्ट्रीय', compliance: 'एमएसपी अनुपालन', verifiedFarmers: 'सत्यापित किसान', mandi: 'मंडी टैक्स ट्रैक', activity: 'गतिविधि फ़ीड', close: 'बंद करें', submit: 'लिस्टिंग भेजें', quantity: 'मात्रा', location: 'स्थान', cropName: 'फसल / पौधे का नाम', price: 'शुरुआती भाव', category: 'श्रेणी' }
};

Object.assign(translations.en, {
  buyerDesc: 'Browse live crop and nursery plant listings, submit offers, and review accepted orders.',
  compliance: 'Official MSP data',
  liveStream: 'Recent bid updates',
  quality: 'No independent quality score'
});
Object.assign(translations.hi, {
  trusted: 'किसान-से-खरीदार मार्केटप्लेस',
  heroSub: 'फसलों और नर्सरी पौधों की लिस्टिंग, ऑफ़र और ऑर्डर रिकॉर्ड देखने का एक साझा मार्केटप्लेस।',
  verified: 'एडमिन द्वारा स्वीकृत खरीदार',
  farmerDesc: 'उपज सूचीबद्ध करें, मिले हुए ऑफ़र देखें और बोली स्वीकार करें।',
  buyerDesc: 'लाइव लिस्टिंग देखें, ऑफ़र भेजें और स्वीकृत ऑर्डर देखें।',
  govtDesc: 'मार्केटप्लेस गतिविधि देखें और उपलब्ध प्लेटफॉर्म डेटा निर्यात करें।',
  compliance: 'आधिकारिक MSP डेटा',
  verifiedFarmers: 'लिस्टिंग वाले किसान',
  mandi: 'मंडी डेटा फ़ीड',
  liveStream: 'हाल की बोली अपडेट',
  quality: 'स्वतंत्र गुणवत्ता स्कोर उपलब्ध नहीं',
  accept: 'ऑफ़र स्वीकार करें',
  govtTitle: 'सरकारी डेटा पोर्टल'
});

const fallbackCopy = translations.en;
const t = (lang, key) => (translations[lang]?.[key] || fallbackCopy[key] || key);
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const number = value => new Intl.NumberFormat('en-IN').format(value || 0);

async function api(path, options = {}) {
  const token = sessionStorage.getItem('skb-admin-session');
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });
    let body = {};
    try { body = await response.json(); } catch { /* Non-JSON upstream errors are reported below. */ }
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'API request failed';
    window.dispatchEvent(new CustomEvent('skb:api-error', { detail: message }));
    throw error;
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    leaf: <><path d="M20 4C12 4 5 8 4 20c12-1 16-8 16-16Z"/><path d="M4 20c4-5 8-8 13-11"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.7 5.8 3.7 9s-1.2 6.2-3.7 9c-2.5-2.8-3.7-5.8-3.7-9S9.5 5.8 12 3Z"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/></>,
    sprout: <><path d="M12 21V9"/><path d="M12 12C7 12 4 9 4 4c5 0 8 3 8 8ZM12 9c0-4 3-7 8-7 0 5-3 8-8 8"/></>,
    chart: <><path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-3.3 3-5 7-5s6.3 1.7 7 5"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 16-5-5L5 20"/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    external: <><path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.leaf}</svg>;
}

function Brand() {
  return <div className="brand" aria-label="Smart Kisan Bharat">
    <div className="brand-mark"><Icon name="sprout" size={23} /></div>
    <div><strong>Smart Kisan</strong><span>भारत · Smart Star Solutions</span></div>
  </div>;
}

function Header({ lang, setLang, page, setPage, online }) {
  const nav = [['home', 'Overview'], ['farmer', 'Farmer / Seller'], ['buyer', 'Buyer / Corporate'], ['government', 'Government'], ['admin', 'Admin']];
  return <header className="topbar">
    <Brand />
    <nav className="desktop-nav">{nav.map(([id, label]) => <button key={id} className={page === id ? 'nav-link active' : 'nav-link'} onClick={() => setPage(id)}>{t(lang, id)}</button>)}</nav>
    <div className="header-actions">
      <span className={online ? 'live-status' : 'live-status offline'}><i /> {online ? 'Live' : 'Offline'}</span>
      <label className="language-select"><Icon name="globe" size={16} /><select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language"><>{languages.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</></select></label>
      <button className="mobile-menu"><Icon name="menu" /></button>
    </div>
  </header>;
}

function StatCard({ label, value, note, tone = 'green' }) {
  return <div className={`stat-card ${tone}`}><span className="stat-label">{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

function PortalCard({ icon, title, desc, tone, onClick, action }) {
  return <button className={`portal-card ${tone}`} onClick={onClick}><div className="portal-top"><span className="portal-icon"><Icon name={icon} size={24} /></span><span className="portal-arrow"><Icon name="arrow" size={17} /></span></div><h3>{title}</h3><p>{desc}</p><span className="portal-action">{action} <Icon name="arrow" size={14} /></span></button>;
}

function Overview({ lang, setPage, dashboard }) {
  const metrics = dashboard?.metrics || {};
  const participants = (metrics.farmers || 0) + (metrics.buyers || 0);
  return <main className="page overview-page">
    <section className="hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> {t(lang, 'trusted')}</div>
        <h1>{t(lang, 'hero')}<span>.</span></h1>
        <p>{t(lang, 'heroSub')}</p>
        <div className="hero-actions"><button className="button primary" onClick={() => setPage('buyer')}>{t(lang, 'explore')} <Icon name="arrow" size={17} /></button><button className="button ghost" onClick={() => setPage('farmer')}><Icon name="plus" size={17} /> {t(lang, 'listCrop')}</button></div>
        <div className="trust-row"><span><Icon name="shield" size={16} /> Marketplace records</span><span><Icon name="check" size={16} /> Admin-reviewed buyers</span><span><Icon name="bolt" size={16} /> Live updates</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-image-wrap"><img src={`${import.meta.env.BASE_URL}attached_assets/marketplace-hero.jpg`} alt="Farmer standing in a wheat field" /><div className="image-caption"><span className="pulse" /> <b>MARKETPLACE</b><small>{number(participants)} participant profiles</small></div></div>
        <div className="floating-ticket"><span className="ticket-check"><Icon name="check" size={15} /></span><div><b>Live opportunities</b><small>{number(metrics.marketListings || 0)} published listings</small></div></div>
      </div>
    </section>
    <section className="stats-row">
      <StatCard label="Farmers with listings" value={number(metrics.farmers || 0)} tone="green" />
      <StatCard label={t(lang, 'listings')} value={number(metrics.marketListings || 0)} tone="gold" />
      <StatCard label={t(lang, 'activeBids')} value={number(metrics.activeBids || 0)} tone="blue" />
      <StatCard label="Accepted-order value" value={money(metrics.transactionValue || 0)} tone="slate" />
    </section>
    <section className="section-block portals-section"><div className="section-heading"><div><span className="section-kicker">SMART WORKSPACES</span><h2>{t(lang, 'portal')}</h2></div><span className="section-meta">One marketplace · Four perspectives</span></div>
      <div className="portal-grid">
        <PortalCard icon="sprout" tone="farmer-card" title={t(lang, 'farmer')} desc={t(lang, 'farmerDesc')} action={t(lang, 'listCrop')} onClick={() => setPage('farmer')} />
        <PortalCard icon="chart" tone="buyer-card" title={t(lang, 'buyer')} desc={t(lang, 'buyerDesc')} action={t(lang, 'explore')} onClick={() => setPage('buyer')} />
        <PortalCard icon="shield" tone="govt-card" title={t(lang, 'government')} desc={t(lang, 'govtDesc')} action={t(lang, 'govtTitle')} onClick={() => setPage('government')} />
        <PortalCard icon="lock" tone="admin-card" title={t(lang, 'admin')} desc={t(lang, 'adminDesc')} action={t(lang, 'adminTitle')} onClick={() => setPage('admin')} />
      </div>
    </section>
    <section className="trust-strip"><div className="trust-icon"><Icon name="shield" size={22} /></div><div><b>Counts are calculated from saved marketplace records.</b><span>External MSP, mandi, payment, and government data appears only after a real source is connected.</span></div><button onClick={() => setPage('government')}>Government data <Icon name="arrow" size={15} /></button></section>
  </main>;
}

function PortalHeader({ eyebrow, title, subtitle, icon }) {
  return <div className="portal-header"><div className="page-icon"><Icon name={icon} size={25} /></div><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></div>;
}

function FarmerPortal({ lang, refresh, realtimeVersion }) {
  const [farmerId] = useState(() => {
    let id = localStorage.getItem('skb-farmer-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('skb-farmer-id', id);
    }
    return id;
  });
  const [form, setForm] = useState({
    crop: '', quantity: '', location: '', price: '', category: 'Cereals',
    market: 'crops', unit: 'quintals'
  });
  const [draft, setDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listings, setListings] = useState([]);
  const [bids, setBids] = useState([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  const refreshMine = async () => {
    const [listingData, bidData] = await Promise.all([
      api(`/listings?farmerId=${encodeURIComponent(farmerId)}`),
      api(`/bids?farmerId=${encodeURIComponent(farmerId)}`)
    ]);
    setListings(listingData.listings);
    setBids(bidData.bids);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('skb-draft');
      if (saved) {
        setForm(current => ({ ...current, ...JSON.parse(saved) }));
        setDraft(true);
      }
    } catch {
      localStorage.removeItem('skb-draft');
    }
    refreshMine().catch(() => {});
  }, [farmerId, realtimeVersion]);

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    localStorage.setItem('skb-draft', JSON.stringify(next));
    setDraft(true);
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice input is not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onresult = event => update('crop', event.results[0][0].transcript);
    recognition.start();
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    const [block, district, state] = form.location.split(',').map(value => value.trim());
    if (!block || !district || !state) {
      setError('Enter Block, District, and State separated by commas.');
      return;
    }
    try {
      await api('/listings', {
        method: 'POST',
        body: JSON.stringify({
          crop: form.crop,
          category: form.category,
          market: form.market,
          quantity: Number(form.quantity),
          unit: form.unit,
          price: Number(form.price || 0),
          block,
          district,
          state,
          farmerId
        })
      });
      setSubmitted(true);
      localStorage.removeItem('skb-draft');
      setDraft(false);
      await refreshMine();
      refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const accept = async bidId => {
    try {
      await api(`/bids/${bidId}/accept`, { method: 'POST' });
      await refreshMine();
      refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const listingStatus = { draft: 'Awaiting admin review', live: 'Published', contracted: 'Order created', rejected: 'Declined' };
  return <main className="page portal-page">
    <PortalHeader eyebrow="FARMER / SELLER PORTAL" icon="sprout" title={t(lang, 'farmer')} subtitle="Submit a listing, review bids, and accept an offer." />
    <div className="portal-layout farmer-layout">
      <section className="panel listing-panel">
        <div className="panel-heading">
          <div><span className="panel-kicker">QUICK LISTING</span><h2>List a crop or plant</h2></div>
          <span className="offline-pill"><i /> {draft ? t(lang, 'draftSaved') : 'Draft saved on this device'}</span>
        </div>
        {submitted && <div className="success-state">
          <div className="success-mark"><Icon name="check" size={28} /></div>
          <h3>Listing submitted</h3>
          <p>It will appear in the marketplace after an administrator reviews it. Your offline draft is not sent until the server confirms submission.</p>
          <button className="button secondary" onClick={() => setSubmitted(false)}>List another item</button>
        </div>}
        {!submitted && <form onSubmit={submit} className="listing-form">
          <div className="field-row">
            <label><span>{t(lang, 'cropName')}</span><div className="input-with-action"><input required value={form.crop} onChange={event => update('crop', event.target.value)} placeholder="Crop or plant name" /><button type="button" onClick={startVoice} className={recording ? 'recording' : ''} title="Voice input"><Icon name="mic" size={18} /></button></div></label>
            <label><span>{t(lang, 'category')}</span><select value={form.category} onChange={event => update('category', event.target.value)}><option>Cereals</option><option>Oilseeds</option><option>Vegetables</option><option>Fruit</option><option>Nursery</option><option>General</option></select></label>
          </div>
          <div className="field-row">
            <label><span>Marketplace</span><select value={form.market} onChange={event => update('market', event.target.value)}><option value="crops">Agricultural crops</option><option value="plants">Nursery plants</option></select></label>
            <label><span>{t(lang, 'quantity')}</span><div className="unit-input"><input required type="number" min="0.01" step="any" value={form.quantity} onChange={event => update('quantity', event.target.value)} /><select value={form.unit} onChange={event => update('unit', event.target.value)}><option>quintals</option><option>kg</option><option>plants</option></select></div></label>
          </div>
          <div className="field-row">
            <label><span>{t(lang, 'price')} <small>₹ / unit</small></span><input type="number" min="0" step="any" value={form.price} onChange={event => update('price', event.target.value)} /></label>
            <label><span>Block, district, state</span><input required value={form.location} onChange={event => update('location', event.target.value)} placeholder="Block, District, State" /></label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-footer"><span><Icon name="shield" size={15} /> Enter block, district, and state only; do not enter a street address.</span><button className="button primary" type="submit">{t(lang, 'submit')} <Icon name="arrow" size={16} /></button></div>
        </form>}
        {listings.length > 0 && <div className="listing-history">
          <h3>Your listings</h3>
          {listings.map(listing => <div className="queue-row" key={listing.id}><div><b>{listing.crop}</b><span>{number(listing.quantity)} {listing.unit} · {listing.location}</span></div><small>{listingStatus[listing.status] || listing.status}</small></div>)}
        </div>}
      </section>
      <section className="panel bids-panel">
        <div className="panel-heading"><div><span className="panel-kicker">YOUR MARKET SIGNAL</span><h2>{t(lang, 'liveStream')}</h2></div></div>
        <p className="panel-intro">{listings.some(listing => listing.status === 'live') ? 'Offers on your published listings appear here.' : 'Approved listings and their bids appear here.'}</p>
        <div className="bid-list">{bids.slice(0, 5).map((bid, index) => <div className={`bid-row ${bid.status}`} key={bid.id}>
          <div className="bid-rank">{index + 1}</div>
          <div className="bid-main"><b>{bid.buyer}</b><span>{bid.buyerType} · {number(bid.quantity)} units{bid.verified ? ' · Approved buyer' : ''}</span></div>
          <div className="bid-price"><b>{money(bid.amount)}</b><small>/ unit</small></div>
          {bid.status === 'active' ? <button className="accept-button" onClick={() => accept(bid.id)} title={t(lang, 'accept')}><Icon name="check" size={16} /> <span>Accept</span></button> : <span className="accepted-tag">{bid.status}</span>}
        </div>)}</div>
        {!bids.length && <p className="empty-copy">No bids have been placed on your listings.</p>}
        {error && <div className="form-error">{error}</div>}
        <div className="bids-footer"><span>{number(listings.length)} listings on this device</span><span className="countdown"><Icon name="bolt" size={14} /> Refreshes while open</span></div>
      </section>
    </div>
    <section className="security-note"><div className="security-note-icon"><Icon name="lock" size={19} /></div><div><b>Offline drafts</b><span>Unsubmitted drafts stay in this browser. Submissions and bidding need a network connection.</span></div><span className="network-bars"><i /><i /><i /><i /></span></section>
  </main>;
}

function BuyerVerification({ onVerified, onClose }) {
  const [form, setForm] = useState({ businessName: '', gstin: '', pan: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitForReview = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api('/buyers/verify', { method: 'POST', body: JSON.stringify(form) });
      sessionStorage.setItem('skb-buyer', JSON.stringify(result.buyer));
      onVerified(result.buyer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="modal verification-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><span className="section-kicker">BUYER IDENTITY REVIEW</span><h2>Submit business details</h2><p>GSTIN and PAN formats are checked here; this app does not query a tax registry. An administrator must review the application before bidding is enabled.</p><form onSubmit={submitForReview}><label>Business / organization name<input required value={form.businessName} onChange={event => setForm({ ...form, businessName: event.target.value })} /></label><label>GSTIN<input required maxLength="15" value={form.gstin} onChange={event => setForm({ ...form, gstin: event.target.value.toUpperCase() })} placeholder="15-character GSTIN" /></label><label>PAN<input required maxLength="10" value={form.pan} onChange={event => setForm({ ...form, pan: event.target.value.toUpperCase() })} placeholder="10-character PAN" /></label>{error && <div className="form-error">{error}</div>}<div className="modal-trust"><Icon name="shield" size={18} /><span><b>Stored as salted hashes and masked values</b><small>Full tax identifiers are not retained in the application database.</small></span></div><button className="button primary full" disabled={loading} type="submit">{loading ? 'Submitting…' : 'Submit for review'} <Icon name="arrow" size={16} /></button></form></div></div>;
}

function BuyerPortal({ lang, refresh, realtimeVersion }) {
  const [market, setMarket] = useState('crops');
  const [filters, setFilters] = useState({ state: 'all', district: 'all', q: '' });
  const [options, setOptions] = useState({ states: [] });
  const [listings, setListings] = useState([]);
  const [bidsByListing, setBidsByListing] = useState({});
  const [bidModal, setBidModal] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [buyer, setBuyer] = useState(() => { try { return JSON.parse(sessionStorage.getItem('skb-buyer') || 'null'); } catch { return null; } });
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [expandedBids, setExpandedBids] = useState(null);
  const refreshAccount = async currentBuyer => {
    if (!currentBuyer?.id) return;
    const [profileData, orderData, notificationData] = await Promise.all([
      api(`/buyers/${encodeURIComponent(currentBuyer.id)}`),
      api(`/orders?buyerId=${encodeURIComponent(currentBuyer.id)}`),
      api(`/notifications?audience=${encodeURIComponent(currentBuyer.id)}`)
    ]);
    setBuyer(profileData.buyer);
    sessionStorage.setItem('skb-buyer', JSON.stringify(profileData.buyer));
    setOrders(orderData.orders);
    setNotifications(notificationData.notifications);
    setUnread(notificationData.unread);
  };
  useEffect(() => { api(`/marketplace/options?market=${market}`).then(setOptions).catch(() => setOptions({ states: [] })); setFilters(current => ({ ...current, state: 'all', district: 'all' })); }, [market]);
  useEffect(() => {
    const query = new URLSearchParams({ market, state: filters.state, district: filters.district, q: filters.q });
    api(`/listings?${query}`).then(async data => {
      setListings(data.listings);
      const entries = await Promise.all(data.listings.map(async listing => [listing.id, (await api(`/bids?listingId=${listing.id}`)).bids]));
      setBidsByListing(Object.fromEntries(entries));
    }).catch(() => setListings([]));
    refreshAccount(buyer).catch(() => {});
  }, [market, filters, realtimeVersion, buyer?.id]);
  const loadBids = async id => {
    const data = await api(`/bids?listingId=${id}`);
    setBidsByListing(current => ({ ...current, [id]: data.bids }));
    setExpandedBids(expandedBids === id ? null : id);
  };
  const placeBid = async event => {
    event.preventDefault();
    if (!buyer) { setBidModal(null); setVerifyOpen(true); return; }
    if (buyer.status !== 'verified') { alert('Your buyer application is awaiting administrator approval.'); return; }
    try {
      await api('/bids', { method: 'POST', body: JSON.stringify({ listingId: bidModal.id, amount: Number(bidAmount), quantity: bidModal.quantity, buyerId: buyer.id, buyer: buyer.businessName, buyerType: 'Corporate' }) });
      setBidModal(null); setBidAmount(''); refresh(); 
    } catch (error) { alert(error.message); }
  };
  const districts = options.states.find(item => item.name === filters.state)?.districts || [];
  const markNotificationsRead = async () => { if (!notifications.length) return; await api('/notifications/read', { method: 'POST', body: JSON.stringify({ ids: notifications.map(item => item.id) }) }); setUnread(0); };
  const reportIssue = async order => {
    try {
      await api(`/orders/${encodeURIComponent(order.id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'disputed', buyerId: buyer.id })
      });
      await refreshAccount(buyer);
      refresh();
    } catch (error) {
      alert(error.message);
    }
  };
  const statusLabel = { payment_pending: 'Payment pending', pickup_scheduled: 'Pickup scheduled', in_transit: 'In transit', delivered: 'Delivered', disputed: 'Under review', dispute_resolved: 'Issue resolved' };
  return <main className="page portal-page"><PortalHeader eyebrow="BUYER / CORPORATE PORTAL" icon="chart" title={t(lang, 'buyer')} subtitle="Browse listings, submit offers, and review accepted orders." />
    <div className="market-control"><div className="market-switch"><button className={market === 'crops' ? 'active' : ''} onClick={() => setMarket('crops')}><Icon name="sprout" size={18} /> {t(lang, 'crops')} <span>{market === 'crops' ? listings.length : ''}</span></button><button className={market === 'plants' ? 'active' : ''} onClick={() => setMarket('plants')}><Icon name="leaf" size={18} /> {t(lang, 'plants')} <span>{market === 'plants' ? listings.length : ''}</span></button></div><div className={buyer?.status === 'verified' ? 'buyer-verified verified' : 'buyer-verified'}><Icon name="shield" size={17} /> {buyer ? `${buyer.businessName} · ${buyer.status === 'verified' ? 'Approved' : 'Pending review'}` : 'Buyer approval required to bid'}<button onClick={() => buyer ? refreshAccount(buyer) : setVerifyOpen(true)}>{buyer ? 'Refresh status' : 'Apply'}</button></div></div>
    <section className="filter-bar">
      <div className="search-box"><Icon name="filter" size={18} /><input value={filters.q} onChange={event => setFilters({ ...filters, q: event.target.value })} placeholder={t(lang, 'search')} /></div>
      <select value={filters.state} onChange={event => setFilters({ ...filters, state: event.target.value, district: 'all' })}><option value="all">{t(lang, 'allStates')}</option>{options.states.map(state => <option key={state.name} value={state.name}>{state.name}</option>)}</select>
      <select value={filters.district} onChange={event => setFilters({ ...filters, district: event.target.value })} disabled={filters.state === 'all'}><option value="all">{t(lang, 'allDistricts')}</option>{districts.map(district => <option key={district} value={district}>{district}</option>)}</select>
      <span className="result-count">{listings.length} live results</span>
    </section>
    <section className="market-grid">{listings.map(listing => <article className="listing-card" key={listing.id}><div className="listing-image"><img src={listing.image || `${import.meta.env.BASE_URL}icon.svg`} alt="" /><span className="listing-live"><i /> Published</span><span className="distance">{listing.radiusKm ? `${listing.radiusKm} km away` : 'Marketplace listing'}</span></div><div className="listing-body"><div className="listing-label">{listing.category} <span>·</span> {listing.location}</div><h3>{listing.crop}</h3><div className="listing-meta"><span><b>{number(listing.quantity)}</b> {listing.unit}</span><span className="quality-score"><b>{listing.quality ?? '—'}</b>{listing.quality != null && ' / 10'} <small>{t(lang, 'quality')}</small></span></div><div className="listing-bottom"><div><small>Offers · {(bidsByListing[listing.id] || []).length}</small><strong>{money(Math.max(listing.price || 0, ...(bidsByListing[listing.id] || []).map(bid => bid.amount)))} <i>/ {listing.unit}</i></strong></div><div className="listing-actions"><button className="text-button" onClick={() => loadBids(listing.id)}>{expandedBids === listing.id ? 'Hide bids' : t(lang, 'viewBids')}</button><button className="button compact primary" onClick={() => setBidModal(listing)} disabled={buyer?.status !== 'verified'}>{t(lang, 'placeBid')}</button></div></div>{expandedBids === listing.id && <div className="expanded-bids">{(bidsByListing[listing.id] || []).slice(0, 3).map(bid => <div key={bid.id}><span>{bid.buyer}</span><b>{money(bid.amount)}</b></div>)}</div>}</div></article>)}</section>
    {!listings.length && <section className="panel empty-state"><h2>No live listings yet</h2><p>Approved farmer listings will appear here. This marketplace does not add sample records.</p></section>}
    {buyer && <section className="buyer-live-grid">
      <section className="panel notification-panel">
        <div className="panel-heading"><div><span className="panel-kicker">INSTANT NOTIFICATIONS</span><h2><Icon name="bell" size={18} /> Activity centre</h2></div>{unread > 0 && <span className="notification-count">{unread} new</span>}</div>
        {notifications.length ? <div className="notification-list">{notifications.slice(0, 3).map(notification => <div className={notification.read ? 'notification-row' : 'notification-row unread'} key={notification.id}><span className="notification-icon"><Icon name={notification.type === 'order' ? 'truck' : 'bell'} size={15} /></span><div><b>{notification.title}</b><span>{notification.detail}</span></div></div>)}</div> : <p className="empty-copy">Order and review updates will appear here.</p>}
        <button className="view-all" onClick={markNotificationsRead}>Mark updates as read <Icon name="check" size={14} /></button>
      </section>
      <section className="panel orders-panel">
        <div className="panel-heading"><div><span className="panel-kicker">ORDERS</span><h2><Icon name="truck" size={18} /> Order records</h2></div></div>
        {orders.length ? <div className="order-list">{orders.slice(0, 3).map(order => <div className="order-row" key={order.id}>
          <div><b>{order.orderNumber}</b><span>{order.crop} · {number(order.quantity)} units</span></div>
          <strong>{statusLabel[order.status] || order.status}</strong>
          {!['disputed', 'dispute_resolved'].includes(order.status) && <button className="review-btn" onClick={() => reportIssue(order)}>Report issue</button>}
        </div>)}</div> : <p className="empty-copy">Accepted bids become order records here.</p>}
      </section>
    </section>}
    {bidModal && <div className="modal-backdrop" onClick={() => setBidModal(null)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setBidModal(null)}><Icon name="close" size={18} /></button><span className="section-kicker">MARKETPLACE OFFER</span><h2>Bid for {bidModal.crop}</h2><p>Enter your offer for the full listed quantity. Payment processing is not connected.</p><form onSubmit={placeBid}><label>Offer price <span>₹ / {bidModal.unit}</span><input required type="number" min="0.01" step="any" value={bidAmount} onChange={event => setBidAmount(event.target.value)} placeholder={bidModal.price || ''} autoFocus /></label><div className="modal-trust"><Icon name="shield" size={18} /><span><b>Recorded offer</b><small>If the farmer accepts, the app creates an order record for follow-up.</small></span></div><button className="button primary full" type="submit">Submit offer <Icon name="arrow" size={16} /></button></form></div></div>}
    {verifyOpen && <BuyerVerification onClose={() => setVerifyOpen(false)} onVerified={verifiedBuyer => { setBuyer(verifiedBuyer); setVerifyOpen(false); refresh(); }} />}
  </main>;
}

function governmentCsv(report) {
  const rows = [
    ['Section', 'Name', 'Value'],
    ...Object.entries(report.kpis || {}).map(([key, value]) => ['Platform', key, value]),
    ...(report.activityByArea || []).map(item => ['Marketplace activity', item.name, `Farmers: ${item.farmers}; Live listings: ${item.liveListings}; Submitted listings: ${item.submittedListings}; Active bids: ${item.activeBids}; Orders: ${item.orders}`]),
    ...(report.alerts || []).map(item => ['Alert', item.title, item.severity])
  ];
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `smart-kisan-${report.tier || 'government'}-report.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function GovernmentPortal({ lang, realtimeVersion }) {
  const [tier, setTier] = useState('State');
  const [government, setGovernment] = useState({ kpis: {}, alerts: [], activityByArea: [], governmentFeedConnected: false });
  useEffect(() => { api(`/government?tier=${tier}`).then(setGovernment).catch(() => {}); }, [tier, realtimeVersion]);
  const kpis = government.kpis || {};
  const alerts = government.alerts || [];
  const activity = government.activityByArea || [];
  const updatedAt = government.updatedAt ? new Date(government.updatedAt).toLocaleString() : 'Waiting for API data';
  return <main className="page portal-page"><PortalHeader eyebrow="GOVERNMENT DATA PORTAL" icon="shield" title={t(lang, 'govtTitle')} subtitle="Marketplace activity is calculated from saved records. External compliance figures require a connected source." />
    <div className="govt-toolbar"><div className="tier-switch"><span>{t(lang, 'tier')}</span>{[['Block', 'block'], ['District', 'district'], ['State', 'state'], ['National', 'national']].map(([label, key]) => <button className={tier === label ? 'active' : ''} onClick={() => setTier(label)} key={key}>{t(lang, key)}</button>)}</div><div className="data-status"><span className="sync-dot" /> Updated {updatedAt} <button onClick={() => governmentCsv({ ...government, tier })}>Export CSV</button></div></div>
    {!government.governmentFeedConnected && <section className="panel empty-state"><h2>No external government feed connected</h2><p>MSP compliance, mandi, and government alerts are not reported until a real data source is configured. The counts below are limited to this marketplace.</p></section>}
    <section className="govt-kpis"><StatCard label={t(lang, 'compliance')} value={kpis.compliance ?? '—'} tone="green" /><StatCard label="Live listings" value={number(kpis.liveListings || 0)} tone="blue" /><StatCard label="Orders recorded" value={number(kpis.orders || 0)} tone="gold" /><StatCard label="Open alerts" value={number(kpis.openAlerts || alerts.length)} tone="slate" /></section>
    <div className="govt-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-kicker">MARKETPLACE ACTIVITY · {tier.toUpperCase()}</span><h2>Records by area</h2></div><span className="date-chip">Updated {updatedAt}</span></div>{activity.length ? <div className="govt-activity-table-wrap"><table className="govt-activity-table"><thead><tr><th>Area</th><th>Farmers</th><th>Live listings</th><th>Submitted</th><th>Active bids</th><th>Orders</th></tr></thead><tbody>{activity.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{number(row.farmers)}</td><td>{number(row.liveListings)}</td><td>{number(row.submittedListings)}</td><td>{number(row.activeBids)}</td><td>{number(row.orders)}</td></tr>)}</tbody></table></div> : <p className="empty-copy">No marketplace records are available for this area level.</p>}</section>
      <section className="panel alert-panel"><div className="panel-heading"><div><span className="panel-kicker">ACTION CENTRE</span><h2>Government alerts</h2></div><span className="alert-count">{alerts.length}</span></div>{alerts.length ? <div className="alert-list">{alerts.map((alert, index) => <div className={`alert-row ${(alert.severity || 'normal').toLowerCase()}`} key={alert.id || alert.title || index}><div className="alert-mark"><Icon name={alert.type === 'Tax' ? 'chart' : 'shield'} size={15} /></div><div><b>{alert.title || 'Government alert'}</b><span>{alert.detail || ''}</span></div></div>)}</div> : <p className="empty-copy">No government alerts are configured from an external feed.</p>}</section></div>
    <section className="data-ribbon"><div><span className="ribbon-icon"><Icon name="check" size={18} /></span><span><b>Platform record counts</b><small>Not a substitute for official government statistics.</small></span></div><div><b>{number(kpis.liveListings || 0)}</b><small>live listings</small></div><div><b>{number(kpis.openBids || 0)}</b><small>active bids</small></div><div><b>{number(kpis.orders || 0)}</b><small>orders</small></div></section>
  </main>;
}

function AdminPortal({ lang, refresh }) {
  const [authed, setAuthed] = useState(() => Boolean(sessionStorage.getItem('skb-admin-session')));
  const [form, setForm] = useState({ mobile: '', pin: '' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const loadData = async () => {
    try {
      setData(await api('/admin/metrics'));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
      if (loadError.message.includes('session')) {
        sessionStorage.removeItem('skb-admin-session');
        setAuthed(false);
      }
    }
  };
  useEffect(() => { if (authed) loadData(); }, [authed, refresh]);
  const login = async e => { e.preventDefault(); setError(''); try { const result = await api('/admin/login', { method: 'POST', body: JSON.stringify(form) }); sessionStorage.setItem('skb-admin-session', result.session); setAuthed(true); } catch (err) { setError(err.message); } };
  const logout = () => {
    sessionStorage.removeItem('skb-admin-session');
    setAuthed(false);
    setData(null);
  };
  const decide = async (id, decision) => {
    try {
      await api(`/admin/approvals/${encodeURIComponent(id)}/decision`, { method: 'POST', body: JSON.stringify({ decision }) });
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    }
  };
  const resolveDispute = async id => {
    try {
      await api(`/admin/disputes/${encodeURIComponent(id)}/resolve`, { method: 'POST' });
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    }
  };
  if (!authed) return <main className="page admin-login-page"><div className="admin-login-card"><div className="admin-emblem"><Icon name="lock" size={26} /></div><span className="section-kicker">RESTRICTED OPERATIONS</span><h1>{t(lang, 'login')}</h1><p>Sign in with the administrator credentials configured for this deployment.</p><form onSubmit={login}><label>{t(lang, 'mobile')}<input required inputMode="numeric" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Administrator mobile" /></label><label>{t(lang, 'pin')}<input required type="password" inputMode="numeric" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} placeholder="Administrator PIN" /></label>{error && <div className="form-error">{error}</div>}<button className="button primary full" type="submit">{t(lang, 'signIn')} <Icon name="arrow" size={16} /></button></form><small className="login-note"><Icon name="shield" size={14} /> Session expires after 8 hours.</small></div></main>;
  const metrics = data?.metrics || {};
  const approvals = data?.approvals || [];
  const disputes = data?.disputes || [];
  return <main className="page portal-page"><div className="admin-topline"><PortalHeader eyebrow="ADMIN CONTROL CENTRE" icon="lock" title={t(lang, 'adminTitle')} subtitle="Review submitted buyer applications and farmer listings." /><button className="button ghost" onClick={logout}>{t(lang, 'logout')}</button></div>{error && <div className="form-error">{error}</div>}<section className="admin-kpis"><StatCard label="Farmers with listings" value={number(metrics.activeFarmers)} tone="green" /><StatCard label="Approved buyers" value={number(metrics.verifiedBuyers)} tone="blue" /><StatCard label="Active bids" value={number(metrics.activeBids)} tone="gold" /><StatCard label="Accepted-order value" value={money(metrics.totalValue)} tone="slate" /></section><div className="admin-grid"><section className="panel queue-panel"><div className="panel-heading"><div><span className="panel-kicker">IDENTITY & LISTINGS</span><h2>{t(lang, 'approvalQueue')}</h2></div><span className="queue-count">{approvals.length} waiting</span></div><div className="queue-list">{approvals.length ? approvals.map(item => <div className="queue-row" key={item.id}><div className={`avatar ${String(item.type).toLowerCase()}`}>{String(item.name || '?').charAt(0)}</div><div><b>{item.name}</b><span>{item.type} · {item.location}</span></div><small>{item.submitted}</small><button className="approve-btn" onClick={() => decide(item.id, 'approve')}>Approve</button><button className="review-btn" onClick={() => decide(item.id, 'reject')}>Reject</button></div>) : <p className="empty-copy">No buyer applications or draft listings are waiting for review.</p>}</div></section><section className="panel queue-panel"><div className="panel-heading"><div><span className="panel-kicker">TRUST & SAFETY</span><h2>{t(lang, 'disputes')}</h2></div><span className="queue-count danger">{disputes.length} open</span></div><div className="queue-list">{disputes.length ? disputes.map(item => <div className="queue-row dispute-row" key={item.id}><div className={`priority ${(item.priority || 'normal').toLowerCase()}`} /><div><b>{item.subject || `Order ${item.orderId}`}</b><span>{item.id} · {item.status || 'Open'}</span></div><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</small><button className="review-btn" onClick={() => resolveDispute(item.id)}>Resolve</button></div>) : <p className="empty-copy">No open order disputes.</p>}</div></section></div></main>;
}

function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [online, setOnline] = useState(navigator.onLine);
  const [dashboard, setDashboard] = useState(null);
  const [apiError, setApiError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const loadDashboard = () => api('/dashboard').then(setDashboard).catch(() => {});
    loadDashboard();
    const on = () => { setOnline(true); loadDashboard(); };
    const off = () => setOnline(false);
    const onApiError = event => setApiError(event.detail || 'The API is unavailable.');
    const dismissApiError = () => setApiError('');
    const poll = window.setInterval(() => {
      if (!navigator.onLine) return;
      loadDashboard();
      setRefreshKey(value => value + 1);
    }, 15000);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    window.addEventListener('skb:api-error', onApiError);
    window.addEventListener('skb:dismiss-api-error', dismissApiError);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {});
    }
    return () => {
      window.clearInterval(poll);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('skb:api-error', onApiError);
      window.removeEventListener('skb:dismiss-api-error', dismissApiError);
    };
  }, []);
  const changePage = next => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <><Header lang={lang} setLang={setLang} page={page} setPage={changePage} online={online} />
    {apiError && <div className="api-status-banner" role="status"><span>{online ? apiError : 'Offline: only the app shell, saved drafts, and previously cached responses are available.'}</span><button onClick={() => { setApiError(''); window.dispatchEvent(new Event('skb:dismiss-api-error')); }} aria-label="Dismiss status">×</button></div>}
    <div className="mobile-nav">{[['home', 'Overview'], ['farmer', 'Farmer'], ['buyer', 'Buyer'], ['government', 'Govt'], ['admin', 'Admin']].map(([id, label]) => <button className={page === id ? 'active' : ''} onClick={() => changePage(id)} key={id}><Icon name={id === 'farmer' ? 'sprout' : id === 'buyer' ? 'chart' : id === 'government' ? 'shield' : id === 'admin' ? 'lock' : 'leaf'} size={17} /><span>{t(lang, id)}</span></button>)}</div>
    <div className="app-shell">{page === 'home' && <Overview lang={lang} setPage={changePage} dashboard={dashboard} />}{page === 'farmer' && <FarmerPortal lang={lang} realtimeVersion={refreshKey} refresh={() => setRefreshKey(x => x + 1)} />}{page === 'buyer' && <BuyerPortal lang={lang} realtimeVersion={refreshKey} refresh={() => setRefreshKey(x => x + 1)} />}{page === 'government' && <GovernmentPortal lang={lang} realtimeVersion={refreshKey} />}{page === 'admin' && <AdminPortal lang={lang} refresh={refreshKey} />}</div>
    <footer className="footer"><Brand /><span>© 2026 Smart Star Solutions · Marketplace records only</span><span>Offline drafts stay on this device</span></footer></>;
}

export default App;