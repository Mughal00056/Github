import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import { Product } from './types';
import { INITIAL_PRODUCTS } from './data';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/admin');
  
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('aether-products');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLogoutAdmin = () => {
    // Navigate to User Storefront
    window.location.href = '/';
  };

  const handleProductsUpdated = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('aether-products', JSON.stringify(updatedProducts));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Banner to easily navigate to User Storefront */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-emerald-400 font-semibold tracking-wide uppercase">Admin Portal [Dedicated Application]</span>
          <span className="text-slate-500 hidden sm:inline">• URL: <code className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">/admin</code></span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow transition-colors"
          >
            <span>🛍️ Go to User Storefront</span>
            <span className="text-indigo-200 text-[10px]">(/)</span>
          </a>
        </div>
      </header>

      <AdminDashboard
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogoutAdmin={handleLogoutAdmin}
        productsRef={products}
        onProductsUpdated={handleProductsUpdated}
      />
    </div>
  );
}
