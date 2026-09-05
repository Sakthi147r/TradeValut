import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, CircleHelp, Globe2, Heart, Leaf, Minus, Plus, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatMoney, getOptimizedImageUrl } from "@/lib/format";
import { getMoq, getMoqNumber, getOrigin } from "@/lib/catalog";
import type { Product } from "@shared/commerce/types";
import { toast } from "sonner";

function DetailView({ product }: { product: Product }) {
  const { addItem, loading } = useCart();
  const initialVariant = product.variants[0];
  const supplierName = product.vendor ?? "Verified supplier";
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const variant = product.variants.find(item => item.id === selectedVariantId) ?? initialVariant;
  const moq = getMoq(product);
  const moqNumber = getMoqNumber(product);
  const [quantity, setQuantity] = useState(moqNumber);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [packaging, setPackaging] = useState("standard");
  const quoteRequest = trpc.customer.quotes.create.useMutation({
    onSuccess: () => { setQuoteOpen(false); setQuoteEmail(""); setQuoteMessage(""); toast.success("Quote request sent to the sourcing desk."); },
    onError: error => toast.error(error.message),
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const pricing = useMemo(() => {
    const base = Number.parseFloat(variant?.price.amount ?? product.priceRange.min.amount);
    const firstLabel = Number.isFinite(moqNumber)
      ? `${moq} – ${Math.max(moqNumber * 2 - 1, moqNumber + 10)} units`
      : "Made to order · request pricing";
    return [
      { label: firstLabel, price: base },
      { label: "100 – 499 units", price: base * 0.92 },
      { label: "500 – 999 units", price: base * 0.86 },
      { label: "1000+ units", price: base * 0.78 },
    ];
  }, [moq, moqNumber, product.priceRange.min.amount, variant?.price.amount]);
  const image = product.images[selectedImage] ?? product.images[0];

  return <div className="product-detail-page">
    <div className="mx-auto max-w-[1360px] px-5 py-7 lg:px-10"><Link href="/#collection" className="back-link"><ArrowLeft size={15} /> Back to collection</Link><div className="breadcrumb mt-5"><span>Home</span><ChevronDown size={12} className="-rotate-90" /><span>{product.productType}</span><ChevronDown size={12} className="-rotate-90" /><strong>{product.title}</strong></div></div>
    <div className="mx-auto grid max-w-[1360px] gap-10 px-5 pb-20 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:px-10 lg:pb-28">
      <div className="detail-gallery"><div className="detail-main-image">{image ? <img src={getOptimizedImageUrl(image.url, 900)} alt={image.altText ?? product.title} /> : <Leaf size={44} /> }<span className="gallery-float"><Sparkles size={13} /> Curated quality</span></div>{product.images.length > 1 && <div className="detail-thumbs">{product.images.map((item, index) => <button className={index === selectedImage ? "active" : ""} key={item.url} onClick={() => setSelectedImage(index)}><img src={getOptimizedImageUrl(item.url, 160)} alt={item.altText ?? `${product.title} view ${index + 1}`} /></button>)}</div>}</div>
      <div className="detail-copy"><div className="flex flex-wrap items-center gap-2 text-sm text-[#b47d22]"><span className="detail-pill">Catalog listing</span><span className="text-[#6b716f]">Supplier information available on request</span></div><h1 className="mt-5 font-display text-[clamp(3.5rem,6vw,6.4rem)] leading-[0.86] tracking-[-0.055em]">{product.title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-[#6b716f]">{product.description.replace(/<[^>]*>/g, "")}</p>
        <div className="supplier-card mt-8"><div className="supplier-avatar"><Leaf size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong>{supplierName}</strong><span className="verified-line"><BadgeCheck size={13} /> Supplier profile</span></div><p className="mt-1 text-xs text-[#6b716f]">Origin listed as {getOrigin(supplierName)} <span className="mx-1">·</span> Verification documents available through sourcing</p></div><Link href={`/supplier/${encodeURIComponent(supplierName.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`} className="text-xs font-semibold text-[#0b1830] underline decoration-[#b47d22] underline-offset-4">View profile</Link></div>
        <div className="bulk-panel mt-5"><div className="flex items-center justify-between"><strong>Wholesale pricing <span className="font-normal text-[#6b716f]">(indicative starting rates)</span></strong><span className="text-sm">MOQ: <b>{moq}</b></span></div>{product.variants.length > 1 && <label className="detail-select mt-5"><span>Variant / specification</span><select value={selectedVariantId} onChange={event => { setSelectedVariantId(event.target.value); setQuantity(moqNumber); }}>{product.variants.map(item => <option key={item.id} value={item.id}>{item.title} · {formatMoney(item.price)}</option>)}</select><ChevronDown size={15} /></label>}<div className="mt-5 divide-y divide-[#e3dfd7]">{pricing.map((tier, index) => <div className="flex items-center justify-between py-3 text-sm" key={tier.label}><span className={index === pricing.length - 1 ? "font-semibold" : "text-[#6b716f]"}>{tier.label}</span><strong className={index === pricing.length - 1 ? "text-[#b47d22]" : ""}>{formatMoney(tier.price, variant?.price.currencyCode ?? product.priceRange.min.currencyCode)}</strong></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="detail-select"><span>Packaging preference</span><select value={packaging} onChange={event => setPackaging(event.target.value)}><option value="standard">Standard wholesale pack</option><option value="custom">Request custom pack</option></select><ChevronDown size={15} /></label><div className="quantity-stepper"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(moqNumber, quantity - 1))} disabled={quantity <= moqNumber}><Minus size={15} /></button><b>{quantity}</b><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div></div><p className="mt-3 text-xs text-[#8b8d87]">Wholesale quantities start at {moq}. Final price, packaging, lead time, and shipping are confirmed at checkout or by quote.</p><div className="mt-5 grid gap-2"><button className="button-primary w-full justify-center" onClick={() => variant && addItem(variant.id, quantity)} disabled={!variant?.availableForSale || loading}>{loading ? "Adding to cart…" : `Add ${quantity} units to cart`} <ArrowRight size={16} /></button><button className="button-secondary w-full justify-center" onClick={() => setQuoteOpen(value => !value)}>Request a quote <CircleHelp size={16} /></button></div>{quoteOpen && <form className="mt-4 grid gap-3 border-t border-[#e3dfd7] pt-4" onSubmit={event => { event.preventDefault(); quoteRequest.mutate({ email: quoteEmail, productHandle: product.handle, quantity, message: `Packaging: ${packaging === "custom" ? "Custom pack requested" : "Standard wholesale pack"}. ${quoteMessage}` }); }}><input className="h-11 border border-[#d9d4c9] bg-white px-3 text-sm outline-none focus:border-[#b47d22]" type="email" required value={quoteEmail} onChange={event => setQuoteEmail(event.target.value)} placeholder="Work email" /><textarea className="min-h-20 border border-[#d9d4c9] bg-white px-3 py-3 text-sm outline-none focus:border-[#b47d22]" value={quoteMessage} onChange={event => setQuoteMessage(event.target.value)} placeholder="Tell us about your run, delivery destination, and requirements" /><button className="button-primary justify-center" type="submit" disabled={quoteRequest.isPending}>{quoteRequest.isPending ? "Sending…" : "Send quote request"}</button></form>}</div>
        <div className="detail-benefits"><div><Globe2 size={20} /><span>Trade destinations<small>Confirm shipping with a quote</small></span></div><div><ShieldCheck size={20} /><span>Quality documentation<small>Available from the sourcing desk</small></span></div><div><Truck size={20} /><span>Trade support<small>Help with your buying brief</small></span></div></div>
        <div className="spec-list mt-8"><div><Check size={16} /> <span><b>Supplier origin</b>{getOrigin(supplierName)}</span></div><div><Check size={16} /> <span><b>Product category</b>{product.productType ?? "Organic goods"}</span></div><div><Check size={16} /> <span><b>Buyer note</b>Organic-first sourcing</span></div></div>
      </div>
    </div>
  </div>;
}

export default function ProductPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? (typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean).pop() ?? "" : "");
  const { data: product, isLoading, error } = trpc.commerce.products.byHandle.useQuery({ handle }, { enabled: Boolean(handle) });
  if (isLoading) return <div className="page-loading"><Sparkles size={20} /> Loading product details…</div>;
  if (error || !product) return <div className="empty-page"><h1 className="font-display text-5xl">This product moved on.</h1><Link href="/#collection" className="button-primary mt-6">Return to collection <ArrowRight size={16} /></Link></div>;
  return <DetailView product={product} />;
}
