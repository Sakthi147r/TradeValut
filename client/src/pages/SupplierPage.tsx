import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, Globe2, Leaf, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatMoney } from "@/lib/format";
import { getMoq, getOrigin } from "@/lib/catalog";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@shared/commerce/types";

function SupplierProduct({ product }: { product: Product }) {
  const { addItem, loading } = useCart();
  const variant = product.variants[0];
  return <article className="supplier-product"><Link href={`/product/${product.handle}`} className="supplier-product-img">{product.images[0] && <img src={product.images[0].url} alt={product.title} />}<span>{getMoq(product)} min</span></Link><div className="p-5"><p className="product-type">{product.productType}</p><Link href={`/product/${product.handle}`} className="mt-2 block font-display text-2xl leading-none hover:text-[#b47d22]">{product.title}</Link><div className="mt-4 flex items-center justify-between"><strong>{formatMoney(product.priceRange.min)}<span className="text-xs font-normal text-[#8b8d87]"> / unit</span></strong><button className="quick-add" onClick={() => addItem(variant.id, 1)} disabled={loading}>{loading ? "Adding" : "Add"}</button></div></div></article>;
}

export default function SupplierPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 50 });
  const product = products.find(item => item.vendor && item.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug);
  const supplierName = product?.vendor ?? slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const supplierProducts = products.filter(item => item.vendor === product?.vendor);
  const origin = getOrigin(supplierName);
  const heroImage = product?.images[0]?.url;

  return <div className="supplier-page"><section className="supplier-hero" style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}><div className="supplier-hero-overlay" /><div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-10 lg:py-28"><Link href="/#collection" className="back-link light"><ArrowLeft size={15} /> Back to collection</Link><div className="mt-14 max-w-2xl"><p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Verified supplier</p><h1 className="mt-6 font-display text-[clamp(4rem,8vw,7.2rem)] leading-[0.85] tracking-[-0.055em] text-white">{supplierName}</h1><p className="mt-6 max-w-lg text-base leading-7 text-white/70">A source partner for buyers who want consistency, context, and considered organic goods.</p><div className="mt-8 flex flex-wrap gap-3"><span className="supplier-hero-pill"><MapPin size={15} /> {origin}</span><span className="supplier-hero-pill"><BadgeCheck size={15} /> Verified since 2021</span></div></div></div></section>
    <section className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-24"><div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> The profile</p><h2 className="mt-5 font-display text-5xl leading-[0.9] tracking-[-0.04em]">Rooted in the<br /><em>right details.</em></h2><p className="mt-6 text-sm leading-7 text-[#6b716f]">Our source partners are selected for a clear point of view: grow well, communicate clearly, and deliver consistently at wholesale scale.</p><div className="mt-8 space-y-4"><div className="profile-stat"><ShieldCheck size={20} /><div><strong>Verified quality</strong><span>Documentation on file</span></div></div><div className="profile-stat"><Leaf size={20} /><div><strong>Organic-first</strong><span>Considered inputs & practices</span></div></div><div className="profile-stat"><Globe2 size={20} /><div><strong>Trade ready</strong><span>Global delivery support</span></div></div></div></div><div><div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-[#b47d22]"><span className="eyebrow-rule amber" /> In the collection</p><h2 className="mt-4 font-display text-4xl">Goods from this source</h2></div><span className="hidden text-sm text-[#8b8d87] sm:inline">{supplierProducts.length} product{supplierProducts.length === 1 ? "" : "s"}</span></div>{isLoading ? <div className="mt-8 h-60 animate-pulse rounded-2xl bg-[#ece9e2]" /> : supplierProducts.length ? <div className="supplier-products-grid mt-8">{supplierProducts.map(item => <SupplierProduct product={item} key={item.id} />)}</div> : <div className="empty-state mt-8"><Sparkles size={20} /><p>Supplier catalog is being refreshed.</p></div>}</div></div></section>
    <section className="supplier-bottom-cta"><div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-7 px-5 py-12 lg:flex-row lg:items-center lg:px-10"><div><p className="eyebrow text-amber-200"><span className="eyebrow-rule" /> Need a custom run?</p><h2 className="mt-3 font-display text-4xl text-white">Talk to the source directly.</h2></div><a href={`mailto:buyers@tradevault.co?subject=Supplier introduction: ${supplierName}`} className="button-amber">Start a conversation <ArrowRight size={16} /></a></div></section>
  </div>;
}
