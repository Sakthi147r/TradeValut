import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { formatMoney } from "@/lib/format";

export default function SavedPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const favorites = trpc.customer.favorites.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const products = trpc.commerce.products.list.useQuery({ first: 50 }, { enabled: isAuthenticated });
  if (authLoading) return <div className="page-loading">Loading your saved products…</div>;
  if (!isAuthenticated) return <div className="empty-page"><Heart size={28} className="text-[#b47d22]" /><h1 className="mt-5 font-display text-5xl">Your shortlist is private.</h1><p className="mt-4 max-w-md text-sm leading-7 text-[#6b716f]">Sign in to keep products close while you compare suppliers and plan your next run.</p><button className="button-primary mt-7" onClick={() => startLogin()}>Sign in <ArrowRight size={16} /></button></div>;
  const saved = (products.data ?? []).filter(product => (favorites.data ?? []).includes(product.handle));
  return <div className="mx-auto max-w-[1200px] px-5 py-16 lg:px-10 lg:py-24"><Link href="/" className="back-link"><ArrowLeft size={15} /> Back to marketplace</Link><div className="mt-12 flex items-end justify-between gap-5"><div><p className="eyebrow text-[#b47d22]">Your shortlist</p><h1 className="mt-4 font-display text-6xl leading-none">Saved products.</h1></div><span className="text-sm text-[#6b716f]">{saved.length} saved</span></div>{saved.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{saved.map(product => <Link key={product.id} href={`/product/${product.handle}`} className="rounded-2xl border border-[#e5e1d9] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b47d22]"><div className="aspect-[1.25] overflow-hidden rounded-xl bg-[#f3f0e9]">{product.images[0] && <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-full w-full object-cover" loading="lazy" />}</div><p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#b47d22]">{product.productType}</p><h2 className="mt-2 font-display text-3xl leading-none">{product.title}</h2><p className="mt-4 text-sm font-semibold">From {formatMoney(product.priceRange.min)}</p></Link>)}</div> : <div className="empty-state mt-10"><Heart size={24} /><h2 className="font-display text-3xl">Nothing saved yet.</h2><p>Use the heart on a product to build your sourcing shortlist.</p><Link href="/#collection" className="button-primary mt-4">Explore products <ArrowRight size={16} /></Link></div>}</div>;
}
