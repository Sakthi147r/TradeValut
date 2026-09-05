import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight, BadgeCheck, ChevronDown, Filter, Heart, Leaf, Search, Sparkles, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatMoney, getOptimizedImageUrl } from "@/lib/format";
import type { Product } from "@shared/commerce/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { getMoq, getMoqNumber } from "@/lib/catalog";

const HERO_ART = "/manus-storage/tradevault-hero-art_2a325192.png";
const PRODUCT_CONCEPT = "/manus-storage/tradevault-product-concept_82bb906c.png";

const ProductCard = memo(function ProductCard({
  product,
  featured = false,
  isSaved,
  onToggleSave,
}: {
  product: Product;
  featured?: boolean;
  isSaved: boolean;
  onToggleSave: (handle: string) => void;
}) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const variant = product.variants[0];
  const moqNumber = getMoqNumber(product);

  const handleAdd = async () => {
    if (!variant?.availableForSale || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(variant.id, moqNumber);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className={`product-card group ${featured ? "featured" : ""}`}>
      <Link href={`/product/${product.handle}`} className="product-image-wrap">
        {product.images[0] ? (
          <img
            src={getOptimizedImageUrl(product.images[0].url, 480)}
            alt={product.images[0].altText ?? product.title}
            className="product-image"
            loading="lazy"
            width={480}
            height={446}
          />
        ) : (
          <div className="image-placeholder"><Leaf size={30} /></div>
        )}
        <span className="product-badge">{getMoq(product)} min</span>
        <span className="product-arrow"><ArrowRight size={17} /></span>
      </Link>
      <div className="product-card-body">
        <div className="flex items-center justify-between gap-3">
          <span className="product-type">{product.productType}</span>
          <div className="flex items-center gap-3">
            <span className="verified-line"><BadgeCheck size={13} /> Verified</span>
            <button
              className={isSaved ? "saved-heart active" : "saved-heart"}
              aria-label={isSaved ? `Remove ${product.title} from saved products` : `Save ${product.title}`}
              onClick={() => onToggleSave(product.handle)}
            >
              <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <Link href={`/product/${product.handle}`} className="mt-3 block font-display text-[26px] leading-[1.05] tracking-[-0.02em] transition-colors group-hover:text-[#b47d22]">
          {product.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6b716f]">
          {product.description.replace(/<[^>]*>/g, "")}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#e5e1d9] pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8c8e87]">Starting price</p>
            <p className="mt-1 font-semibold text-[#0b1830]">
              {formatMoney(product.priceRange.min)} <span className="text-xs font-normal text-[#8c8e87]">/ unit</span>
            </p>
            <p className="mt-1 text-[11px] text-[#8c8d87]">MOQ {getMoq(product)}</p>
          </div>
          <button
            className="quick-add"
            disabled={!variant?.availableForSale || isAdding}
            onClick={handleAdd}
          >
            {isAdding ? "Adding" : `Add ${moqNumber}`}
          </button>
        </div>
      </div>
    </article>
  );
});

function FilterBar({
  products,
  category,
  setCategory,
  moq,
  setMoq,
  search,
  setSearch,
}: {
  products: Product[];
  category: string;
  setCategory: (value: string) => void;
  moq: string;
  setMoq: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map(product => product.productType ?? "Other")))],
    [products]
  );
  const moqs = useMemo(
    () => ["All", ...Array.from(new Set(products.map(getMoq)))],
    [products]
  );

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search size={17} />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search products or suppliers"
          aria-label="Search products or suppliers"
        />
      </div>
      <label className="filter-select">
        <span>Category</span>
        <select value={category} onChange={event => setCategory(event.target.value)}>
          {categories.map(value => (
            <option value={value} key={value}>{value}</option>
          ))}
        </select>
        <ChevronDown size={15} />
      </label>
      <label className="filter-select">
        <span>MOQ</span>
        <select value={moq} onChange={event => setMoq(event.target.value)}>
          {moqs.map(value => (
            <option value={value} key={value}>{value === "All" ? "All order sizes" : `${value}+`}</option>
          ))}
        </select>
        <ChevronDown size={15} />
      </label>
    </div>
  );
}

export default function Home() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 50 });
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const favorites = trpc.customer.favorites.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const addFavorite = trpc.customer.favorites.add.useMutation({ onSuccess: () => utils.customer.favorites.list.invalidate() });
  const removeFavorite = trpc.customer.favorites.remove.useMutation({ onSuccess: () => utils.customer.favorites.list.invalidate() });
  const [category, setCategory] = useState("All");
  const [moq, setMoq] = useState("All");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    return products.filter(product => {
      const haystack = `${product.title} ${product.vendor} ${product.productType} ${product.tags.join(" ")}`.toLowerCase();
      return (
        (category === "All" || product.productType === category) &&
        (moq === "All" || getMoq(product) === moq) &&
        (!query || haystack.includes(query))
      );
    });
  }, [products, category, moq, deferredSearch]);

  const savedHandles = useMemo(() => new Set(favorites.data ?? []), [favorites.data]);
  const toggleSave = useCallback((handle: string) => {
    if (!isAuthenticated) { startLogin(); return; }
    if (savedHandles.has(handle)) {
      removeFavorite.mutate({ productHandle: handle });
      toast.success("Removed from saved products.");
    } else {
      addFavorite.mutate({ productHandle: handle });
      toast.success("Saved for later.");
    }
  }, [isAuthenticated, savedHandles, removeFavorite, addFavorite]);

  return <div>
    <section className="hero-section" style={{ backgroundImage: `url(${HERO_ART})` }}>
      <div className="hero-overlay" />
      <div className="mx-auto grid min-h-[calc(100vh-110px)] max-w-[1360px] items-center px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="hero-copy">
          <p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Thoughtful sourcing. Clearer buying.</p>
          <h1 className="mt-7 max-w-[650px] font-display text-[clamp(4.2rem,8vw,7.8rem)] leading-[0.86] tracking-[-0.055em] text-white">Source better.<br /><em className="text-amber-200">Buy in bulk.</em></h1>
          <p className="mt-7 max-w-[440px] text-base leading-7 text-white/65 sm:text-lg">Explore a curated marketplace of organic, sustainable products with supplier context, wholesale quantities, and a clearer path to your next order.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a className="button-amber" href="#collection">Explore the collection <ArrowRight size={16} /></a><Link className="button-ghost-light" href="/buyer-guide">How it works <ArrowDown size={15} /></Link></div>
          <div className="mt-16 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/45"><span className="scroll-orb"><ArrowDown size={14} /></span> Scroll to discover</div>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span className="orbit-ring one" /><span className="orbit-ring two" /><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><div className="hero-note"><Sparkles size={14} className="text-amber-200" /><span>Live catalog</span><b>50</b></div></div>
      </div>
    </section>

    <section className="trust-strip"><div className="mx-auto grid max-w-[1360px] gap-5 px-5 py-5 sm:grid-cols-3 lg:grid-cols-3 lg:px-10"><div className="trust-item"><BadgeCheck size={20} /><div><strong>Supplier context</strong><span>Origin and source details</span></div></div><div className="trust-item"><Truck size={20} /><div><strong>Wholesale ready</strong><span>MOQ-led order planning</span></div></div><div className="trust-item"><Leaf size={20} /><div><strong>Considered goods</strong><span>Organic-first catalog</span></div></div></div></section>

    <section id="collection" className="collection-section mx-auto max-w-[1360px] px-5 py-20 lg:px-10 lg:py-28">
      <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> The collection · 50 live listings</p><h2 className="section-title mt-5 max-w-2xl">A better starting point<br /><em>for your next order.</em></h2></div><p className="max-w-sm text-sm leading-6 text-[#6b716f]">From first sample to full production run, make every ingredient count. Explore products with the context to buy them well.</p></div>
      <div className="mt-11"><FilterBar products={products} category={category} setCategory={setCategory} moq={moq} setMoq={setMoq} search={search} setSearch={setSearch} /></div>
      {isLoading ? <div className="product-grid mt-8">{[1, 2, 3, 4].map(value => <div className="skeleton-card" key={value}><div className="skeleton-image" /><div className="h-5 w-2/3 animate-pulse rounded bg-[#ece9e2]" /><div className="mt-3 h-4 w-full animate-pulse rounded bg-[#ece9e2]" /></div>)}</div> : filteredProducts.length > 0 ? <div className="product-grid mt-8">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} featured={index === 0} isSaved={savedHandles.has(product.handle)} onToggleSave={toggleSave} />)}</div> : <div className="empty-state mt-8"><Filter size={24} /><h3 className="font-display text-3xl">No goods match that brief.</h3><p>Try a wider category or MOQ, or clear the search.</p><button className="button-outline mt-4" onClick={() => { setCategory("All"); setMoq("All"); setSearch(""); }}>Reset filters</button></div>}
    </section>

    <section className="story-section"><div className="mx-auto grid max-w-[1360px] items-center gap-12 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-10 lg:py-28"><div className="story-art"><img src={PRODUCT_CONCEPT} alt="Premium organic ingredients arranged on a stone pedestal" loading="lazy" /><div className="story-stamp"><span>01</span><b>Field notes</b><small>From the source</small></div></div><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> The TradeVault standard</p><h2 className="section-title mt-5">The details are<br /><em>part of the product.</em></h2><p className="mt-7 max-w-lg text-base leading-8 text-[#6b716f]">Buying in bulk should feel considered, not complicated. We pair catalog goods with clear MOQs, supplier context, and a checkout flow built for business buyers.</p><div className="mt-9 space-y-5"><div className="story-point"><span>01</span><div><strong>Curated by category</strong><p>Focused ingredients for food, wellness, hospitality, and retail.</p></div></div><div className="story-point"><span>02</span><div><strong>Context at the source</strong><p>Every supplier profile carries origin and catalog context.</p></div></div><div className="story-point"><span>03</span><div><strong>Built for the next run</strong><p>MOQ-led buying and clearer quote requests support planning.</p></div></div></div><Link href="/buyer-guide" className="button-outline mt-10">Read the buyer guide <ArrowRight size={16} /></Link></div></div></section>

    <section className="supplier-cta"><div className="mx-auto grid max-w-[1360px] items-center gap-8 px-5 py-16 lg:grid-cols-[1fr_auto] lg:px-10"><div><p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Meet the source</p><h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl">Great goods have a<br /><em className="text-amber-200">story worth knowing.</em></h2></div><Link href="/supplier/forest-canopy-co" className="button-amber">Meet our suppliers <ArrowRight size={16} /></Link></div></section>
  </div>;
}
