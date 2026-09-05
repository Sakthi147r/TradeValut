import { memo, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, Globe2, Leaf, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatMoney, getOptimizedImageUrl } from "@/lib/format";
import { getMoq, getMoqNumber, getOrigin } from "@/lib/catalog";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@shared/commerce/types";

const SupplierProduct = memo(function SupplierProduct({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const variant = product.variants[0];
  const moq = getMoqNumber(product);

  const handleAdd = async () => {
    if (!variant?.availableForSale || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(variant.id, moq);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="supplier-product">
      <Link href={`/product/${product.handle}`} className="supplier-product-img">
        {product.images[0] && (
          <img
            src={getOptimizedImageUrl(product.images[0].url, 480)}
            alt={product.images[0].altText ?? product.title}
            loading="lazy"
            width={480}
            height={422}
          />
        )}
        <span>{getMoq(product)} min</span>
      </Link>
      <div className="p-5">
        <p className="product-type">{product.productType}</p>
        <Link href={`/product/${product.handle}`} className="mt-2 block font-display text-2xl leading-none hover:text-[#b47d22]">
          {product.title}
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <strong>{formatMoney(product.priceRange.min)}<span className="text-xs font-normal text-[#8b8d87]"> / unit</span></strong>
          <button className="quick-add" onClick={handleAdd} disabled={!variant?.availableForSale || isAdding}>
            {isAdding ? "Adding" : `Add ${moq}`}
          </button>
        </div>
      </div>
    </article>
  );
});

export default function SupplierPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 50 });
  const product = useMemo(
    () => products.find(item => item.vendor && item.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug),
    [products, slug]
  );
  const supplierName = product?.vendor ?? "Supplier";
  const supplierProducts = useMemo(
    () => (product?.vendor ? products.filter(item => item.vendor === product.vendor) : []),
    [products, product?.vendor]
  );
  const origin = useMemo(() => getOrigin(supplierName), [supplierName]);
  const heroImage = product?.images[0]?.url;

  if (!isLoading && !product) return <div className="empty-page"><h1 className="font-display text-5xl">Supplier not found.</h1><p className="mt-4 text-sm text-[#6b716f]">This source profile is not currently in the live catalog.</p><Link href="/#collection" className="button-primary mt-6">Return to collection <ArrowRight size={16} /></Link></div>;

  return <div className="supplier-page"><section className="supplier-hero" style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}><div className="supplier-hero-overlay" /><div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-10 lg:py-28"><Link href="/#collection" className="back-link light"><ArrowLeft size={15} /> Back to collection</Link><div className="mt-14 max-w-2xl"><p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Supplier profile</p><h1 className="mt-6 font-display text-[clamp(4rem,8vw,7.2rem)] leading-[0.85] tracking-[-0.055em] text-white">{supplierName}</h1><p className="mt-6 max-w-lg text-base leading-7 text-white/70">A source partner in the live TradeVault catalog. Ask the sourcing desk for documentation, capacity, lead time, and destination-specific terms.</p><div className="mt-8 flex flex-wrap gap-3"><span className="supplier-hero-pill"><MapPin size={15} /> {origin}</span><span className="supplier-hero-pill"><BadgeCheck size={15} /> Catalog supplier</span></div></div></div></section><section className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-24"><div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> The profile</p><h2 className="mt-5 font-display text-5xl leading-[0.9] tracking-[-0.04em]">Rooted in the<br /><em>right details.</em></h2><p className="mt-6 text-sm leading-7 text-[#6b716f]">This profile reflects supplier information currently attached to the live catalog. Ask the sourcing desk for evidence-backed claims and trade terms before ordering.</p><div className="mt-8 space-y-4"><div className="profile-stat"><ShieldCheck size={20} /><div><strong>Documentation</strong><span>Available on request</span></div></div><div className="profile-stat"><Leaf size={20} /><div><strong>Catalog focus</strong><span>Organic-first product range</span></div></div><div className="profile-stat"><Globe2 size={20} /><div><strong>Trade support</strong><span>Confirm delivery terms by quote</span></div></div></div></div><div><div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> In the collection</p><h2 className="mt-4 font-display text-4xl">Goods from this source</h2></div><span className="hidden text-sm text-[#8b8d87] sm:inline">{supplierProducts.length} product{supplierProducts.length === 1 ? "" : "s"}</span></div>{isLoading ? <div className="mt-8 h-60 animate-pulse rounded-2xl bg-[#ece9e2]" /> : supplierProducts.length ? <div className="supplier-products-grid mt-8">{supplierProducts.map(item => <SupplierProduct product={item} key={item.id} />)}</div> : <div className="empty-state mt-8"><Sparkles size={20} /><p>Supplier catalog is being refreshed.</p></div>}</div></div></section><section className="supplier-bottom-cta"><div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-7 px-5 py-12 lg:flex-row lg:items-center lg:px-10"><div><p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Need a custom run?</p><h2 className="mt-3 font-display text-4xl text-white">Talk to the source desk.</h2></div><a href={`mailto:buyers@tradevault.co?subject=Supplier introduction: ${supplierName}`} className="button-amber">Start a conversation <ArrowRight size={16} /></a></div></section></div>;
}
