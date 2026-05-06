import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, PackageSearch, Search, ShieldCheck, SlidersHorizontal, Store } from 'lucide-react';
import { getProducts, getCategories } from '../../api/productApi';
import { demoProducts } from '../../data/demoProducts';
import { money } from '../../utils/formatters';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    const featuredCount = products.filter((product) => Number(product.stock) > 0).length;

    // Single fetch function that takes explicit page parameter
    const fetchProducts = useCallback(async (pageNumber, currentSearch, currentCategory) => {
        setLoading(true);
        setError('');

        try {
            const params = {
                search: currentSearch || undefined,
                category: currentCategory || undefined,
                page: pageNumber,
            };

            const data = await getProducts(params);

            setTotalCount(data.count || 0);
            setProducts(data.results || []);
            setHasNext(!!data.next);
            setHasPrev(!!data.previous);
            setPage(pageNumber);
            setPreviewMode(false);
        } catch (err) {
            const filteredDemo = demoProducts.filter((product) => {
                const matchesSearch =
                    !currentSearch ||
                    product.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                    product.description.toLowerCase().includes(currentSearch.toLowerCase());
                const matchesCategory = !currentCategory || product.category === currentCategory;
                return matchesSearch && matchesCategory;
            });

            setTotalCount(filteredDemo.length);
            setProducts(filteredDemo);
            setHasNext(false);
            setHasPrev(false);
            setPage(1);
            setPreviewMode(true);
            setError('Django API is offline, so this page is showing preview products.');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);
    


    // Fetch categories on mount
    useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await getCategories();

            console.log("RAW CATEGORY RESPONSE:", data);

            let categoriesArray = [];

            // 🔥 Handle ALL possible API shapes
            let raw;

            if (Array.isArray(data)) {
                raw = data; // already array
            } else if (Array.isArray(data?.results)) {
                raw = data.results; // DRF paginated
            } else if (Array.isArray(data?.data)) {
                raw = data.data;
            } else if (Array.isArray(data?.categories)) {
                raw = data.categories;
            } else {
                raw = [];
            }

            categoriesArray = raw.map((cat) => ({
                value: String(cat.id ?? cat.value),
                label: cat.name ?? cat.title ?? cat.label ?? "Unnamed",
            }));

            console.log("PROCESSED CATEGORIES:", categoriesArray);

            setCategories(categoriesArray);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setCategories([]);
        }
    };

    fetchCategories();
}, []);

    // Initial fetch and filter changes -> reset to page 1
    useEffect(() => {
        fetchProducts(1, search, category);
    }, [search, category, fetchProducts]);

    // Handle page navigation
    const goToPage = (newPage) => {
        if (newPage >= 1 && !loading) {
            fetchProducts(newPage, search, category);
        }
    };

    const selectedCategoryLabel = useMemo(() => {
        if (!category) return 'All Categories';
        const found = categories.find((item) => item.value === category);
        return found ? found.label : 'All Categories';
    }, [category, categories]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchDraft.trim());
    };

    const PAGE_SIZE = 12;
    const totalPages = loading ? Math.max(page, Math.ceil(totalCount / PAGE_SIZE) || 1) : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    return (
        <div>
            <section className="mesh-hero text-white">
                <div className="page-shell !pb-10 !pt-10">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                        <div className="max-w-2xl">
                            <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white">
                                Buyers and vendors in one clean workspace
                            </p>
                            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">MarketHub</h1>
                            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-white/90">
                                Browse products, manage orders, and run a vendor storefront from one responsive marketplace UI.
                            </p>
                            <div className="mt-6 hidden max-w-xl gap-3 sm:grid sm:grid-cols-3">
                                <HeroMetric label="Products" value={loading ? '...' : totalCount} />
                                <HeroMetric label="Available" value={loading ? '...' : featuredCount} />
                                <HeroMetric label="Category" value={selectedCategoryLabel} />
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="surface-card p-4 text-[#17211d] shadow-2xl">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="eyebrow">Find Products</p>
                                    <h2 className="section-title mt-1 text-xl">Search the marketplace</h2>
                                </div>
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
                                    <SlidersHorizontal size={20} />
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
                                <label className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or description"
                                        value={searchDraft}
                                        onChange={(e) => setSearchDraft(e.target.value)}
                                        className="form-input pl-10"
                                    />
                                </label>
<select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="form-input"
>
    <option value="">All Categories</option>

    {categories.length === 0 ? (
        <option disabled>Loading categories...</option>
    ) : (
        categories.map((item) => (
            <option key={item.value} value={item.value}>
                {item.label}
            </option>
        ))
    )}
</select>
                                <button type="submit" className="btn btn-accent whitespace-nowrap">
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <section className="page-shell">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Marketplace</p>
                        <h2 className="section-title mt-1">Available Products</h2>
                    </div>
                    <Link to="/vendor/create-store" className="btn btn-ghost w-full sm:w-auto">
                        <Store size={18} />
                        Open a Store
                    </Link>
                </div>

                {error && <div className="alert alert-error mb-6">{error}</div>}

                {loading ? (
                    <ProductSkeleton />
                ) : products.length === 0 ? (
                    <EmptyMarketplace />
                ) : (
                    <>
                        {previewMode && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#dfe7e2] bg-white px-4 py-3 text-sm font-semibold text-[#66736d]">
                                <ShieldCheck size={18} className="text-[#0f766e]" />
                                Preview mode keeps the UI usable while your backend is not running.
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={!hasPrev || loading}
                                className="btn btn-ghost disabled:opacity-40"
                            >
                                ← Previous
                            </button>
                           
                            <span className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#66736d] shadow-sm">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={!hasNext || loading}
                                className="btn btn-ghost disabled:opacity-40"
                            >
                                Next →
                            </button>
                        </div>

                        <p className="mt-4 text-center text-sm text-[#66736d]">
                            Showing {products.length} of {totalCount} products
                        </p>
                    </>
                )}
            </section>
        </div>
    );
};

const HeroMetric = ({ label, value }) => (
    <div className="rounded-lg border border-white/20 bg-white/10 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/72">{label}</p>
        <p className="mt-1 truncate text-2xl font-black text-white">{value}</p>
    </div>
);

const ProductSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, index) => (
            <div key={index} className="surface-card overflow-hidden">
                <div className="h-52 animate-pulse bg-[#e7eee9]" />
                <div className="space-y-3 p-4">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#e7eee9]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#eef3ef]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef3ef]" />
                </div>
            </div>
        ))}
    </div>
);

const EmptyMarketplace = () => (
    <div className="surface-card grid place-items-center px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d9f3ee] text-[#115e59]">
            <PackageSearch size={26} />
        </div>
        <h3 className="mt-5 text-2xl font-black text-[#17211d]">No products found</h3>
        <p className="mt-2 max-w-md text-[#66736d]">Try a different search term or switch to another category.</p>
    </div>
);

const ProductCard = ({ product }) => {
    const inStock = Number(product.stock) > 0;

    return (
        <Link to={`/product/${product.id}`} className="group surface-card overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#eef7f4]">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#d9f3ee,#fff2e9)] text-[#115e59]">
                        <Boxes size={44} />
                    </div>
                )}
                <span className={`badge absolute left-3 top-3 ${inStock ? 'badge-success' : 'badge-danger'}`}>
                    {inStock ? `${product.stock} in stock` : 'Out of stock'}
                </span>
            </div>
            <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-lg font-black leading-snug text-[#17211d] group-hover:text-[#115e59]">
                        {product.name}
                    </h3>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-[#66736d] transition group-hover:translate-x-1 group-hover:text-[#115e59]" />
                </div>
                <p className="line-clamp-2 min-h-[42px] text-sm leading-6 text-[#66736d]">{product.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xl font-black text-[#0f766e]">{money(product.price)}</span>
                    {product.vendor?.store_name && (
                        <span className="truncate text-xs font-bold text-[#66736d]">{product.vendor.store_name}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default Marketplace;