import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Heart,
  Leaf,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="TradeVault home">
      <span className="logo-mark"><span>TV</span></span>
      <span className="leading-none">
        <span className="block font-display text-[20px] tracking-[0.16em] text-white">TRADEVAULT</span>
        <span className="mt-1 block font-sans text-[9px] font-semibold uppercase tracking-[0.27em] text-amber-200/80">Organic wholesale</span>
      </span>
    </Link>
  );
}

function CartDrawer() {
  const { cart, isOpen, loading, closeCart, updateQuantity, removeItem, proceedToCheckout } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button aria-label="Close cart" className="absolute inset-0 bg-[#061324]/70 backdrop-blur-sm" onClick={closeCart} />
      <aside className="cart-drawer absolute right-0 top-0 h-full w-full max-w-[440px] overflow-y-auto bg-[#fbfaf7] text-[#0b1830] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d9d4c9] px-6 py-5">
          <div>
            <p className="eyebrow text-[#ad7921]">Your sourcing list</p>
            <h2 className="mt-1 font-display text-3xl">Bulk cart <span className="font-sans text-sm text-[#6b716f]">({cart?.itemCount ?? 0})</span></h2>
          </div>
          <button className="icon-button" aria-label="Close cart" onClick={closeCart}><X size={20} /></button>
        </div>
        {!cart || cart.items.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 grid h-16 w-16 place-items-center rounded-full border border-[#d9d4c9] text-[#ad7921]"><ShoppingBag size={26} /></span>
            <h3 className="font-display text-3xl">Your cart is waiting.</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#6b716f]">Add a few verified organic goods to start a wholesale order.</p>
            <Link href="/#collection" onClick={closeCart} className="button-primary mt-7">Explore collection <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="space-y-5 px-6 py-6">
              {cart.items.map(item => (
                <div key={item.lineId} className="flex gap-4 border-b border-[#e8e3db] pb-5">
                  <Link href={`/product/${item.productHandle}`} onClick={closeCart} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#e8e3db]">
                    {item.image ? <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="h-full w-full object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/product/${item.productHandle}`} onClick={closeCart} className="font-display text-lg leading-tight hover:text-[#b78026]">{item.productTitle}</Link>
                        {item.variantTitle !== "Default Title" && <p className="mt-1 text-xs text-[#6b716f]">{item.variantTitle}</p>}
                      </div>
                      <button className="text-[#989a95] transition hover:text-[#0b1830]" onClick={() => removeItem(item.lineId)} aria-label={`Remove ${item.productTitle}`}><X size={15} /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-[#d9d4c9] bg-white px-2 py-1">
                        <button className="grid h-5 w-5 place-items-center text-[#6b716f]" onClick={() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1))} disabled={loading}><Minus size={12} /></button>
                        <span className="min-w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button className="grid h-5 w-5 place-items-center text-[#6b716f]" onClick={() => updateQuantity(item.lineId, item.quantity + 1)} disabled={loading}><Plus size={12} /></button>
                      </div>
                      <span className="font-semibold text-[#0b1830]">{formatMoney(item.lineTotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto border-t border-[#d9d4c9] bg-[#f3f0e9] px-6 py-6">
              <div className="flex items-end justify-between">
                <div><p className="text-xs uppercase tracking-[0.16em] text-[#6b716f]">Subtotal</p><p className="mt-1 text-xs text-[#6b716f]">Shipping calculated at checkout</p></div>
                <span className="font-display text-3xl">{formatMoney(cart.subtotal)}</span>
              </div>
              <button className="button-primary mt-5 w-full justify-center" onClick={proceedToCheckout} disabled={loading}>Continue to Shopify checkout <ArrowRight size={16} /></button>
              <p className="mt-3 text-center text-[11px] leading-5 text-[#777a74]">Secure checkout powered by Shopify. Prices shown are wholesale starting rates.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const subscribe = trpc.customer.newsletter.subscribe.useMutation({
    onSuccess: () => { setEmail(""); toast.success("You’re on the TradeVault list."); },
    onError: error => toast.error(error.message),
  });
  const submit = (event: FormEvent) => { event.preventDefault(); subscribe.mutate({ email, source: "footer" }); };
  return <form onSubmit={submit} className="mt-5 flex border-b border-white/20 pb-3"><input aria-label="Email address" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Your work email" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" /><button type="submit" disabled={subscribe.isPending} className="text-amber-200" aria-label="Subscribe"><ArrowRight size={18} /></button></form>;
}

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const favorites = trpc.customer.favorites.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const closeMobile = () => setMobileOpen(false);
  const openSearch = () => {
    if (location === "/") document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    else window.location.href = "/#collection";
  };
  const openAccount = () => {
    if (!isAuthenticated) startLogin();
    else toast.success(`Signed in${favorites.data?.length ? ` · ${favorites.data.length} saved` : ""}`);
  };
  const openSaved = () => {
    if (!isAuthenticated) startLogin();
    else toast.success(`${favorites.data?.length ?? 0} saved product${favorites.data?.length === 1 ? "" : "s"}`);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#0b1830]">
      <div className="announcement-bar"><Sparkles size={13} /> <span>Verified organic supply, from source to scale.</span><span className="hidden sm:inline text-amber-200/60">—</span><span className="hidden sm:inline text-amber-100/70">New season sourcing guide is live</span><ArrowRight size={13} /></div>
      <header className="site-header">
        <div className="mx-auto flex h-[78px] max-w-[1360px] items-center justify-between px-5 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            <Link href="/#collection" className={`nav-link ${location === "/" ? "active" : ""}`}>Explore <ChevronDown size={14} /></Link>
            <Link href="/supplier/forest-canopy-co" className="nav-link">Suppliers</Link>
            <Link href="/buyer-guide" className="nav-link">Buyer guide</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="header-icon hidden sm:grid" aria-label="Search" onClick={openSearch}><Search size={18} /></button>
            <button className="header-icon hidden sm:grid" aria-label="Account" onClick={openAccount}><CircleUserRound size={19} /></button>
            <button className="header-icon hidden sm:grid" aria-label="Saved products" onClick={openSaved}><Heart size={18} /></button>
            <button className="cart-button" onClick={openCart} aria-label={`Open cart with ${itemCount} items`}><ShoppingBag size={18} /><span className="hidden sm:inline">Cart</span>{itemCount > 0 && <b>{itemCount}</b>}</button>
            <button className="header-icon lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        {mobileOpen && <div className="mobile-menu lg:hidden"><Link href="/#collection" onClick={closeMobile}>Explore <ChevronRight size={16} /></Link><Link href="/supplier/forest-canopy-co" onClick={closeMobile}>Suppliers <ChevronRight size={16} /></Link><Link href="/buyer-guide" onClick={closeMobile}>Buyer guide <ChevronRight size={16} /></Link></div>}
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
            <div><Logo /><p className="mt-6 max-w-sm text-sm leading-7 text-white/60">A considered marketplace for buyers who care where ingredients come from — and how far they can go.</p><div className="mt-7 flex items-center gap-2 text-xs text-amber-100/80"><ShieldCheck size={16} /> Verified suppliers, considered goods</div></div>
            <div><p className="footer-label">Explore</p><div className="mt-5 space-y-3 text-sm text-white/70"><Link href="/#collection">All products</Link><Link href="/#collection">Mushrooms</Link><Link href="/#collection">Coconut & oils</Link><Link href="/#collection">Seeds & grains</Link></div></div>
            <div><p className="footer-label">For buyers</p><div className="mt-5 space-y-3 text-sm text-white/70"><Link href="/buyer-guide">Buyer guide</Link><a href="mailto:buyers@tradevault.co">Talk to sourcing</a><a href="mailto:support@tradevault.co">Support</a><span>Shipping & trade terms</span></div></div>
            <div><p className="footer-label">Stay close to the source</p><p className="mt-5 text-sm leading-6 text-white/60">Seasonal drops, supplier stories, and practical buying notes.</p><NewsletterForm /></div>
          </div>
          <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.12em] text-white/35 sm:flex-row"><span>© 2026 TradeVault</span><span>Organic. Wholesale. Verified.</span></div>
        </div>
      </footer>
      <CartDrawer />
    </div>
  );
}

export { Logo };
