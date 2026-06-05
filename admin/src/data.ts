import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    title: 'Aether Dashboard Template (React & Tailwind)',
    shortDescription: 'Minimalist admin dashboard UI template with light/dark layouts, nested routing, and 45+ functional dashboard metrics widgets.',
    description: 'Aether is a professional-grade dark and light mode dashboard dashboard template built exclusively for React 19 and Tailwind CSS v4. Ideal for developers, founders, and SaaS builders who want a clean, responsive analytics cockpit ready to receive real live APIs.\n\nEvery panel is completely modularized with responsive flex-grid wrappers, custom-styled recharts elements, and interactive sidebar controls. No clutter, just beautifully handcoded TypeScript files following maximum component discipline.',
    category: 'Web Templates',
    price: 49,
    rating: 4.9,
    reviewsCount: 24,
    tags: ['React', 'Tailwind CSS', 'Admin Dashboard', 'TypeScript', 'SaaS Theme'],
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://drive.google.com/drive/folders/1aether_dashboard_react_tw4_prod_download',
    provider: 'Google Drive',
    dateCreated: '2026-04-12',
    features: [
      'Built with React 19 + TypeScript + Vite',
      'Stunning customizable Recharts visualizations',
      'Advanced theme context supporting Light/Dark modes',
      '45+ reusable interface blocks & compound cards',
      'Strict clean code design focusing on negative space'
    ],
    fileSize: '12.8 MB',
    fileFormat: 'ZIP (Vite Project)',
    version: '1.2.0',
    reviews: [
      {
        id: 'rev-101',
        username: 'Sarah Jenkins',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
        rating: 5,
        text: 'The absolute cleanest React code I have ever purchased. The dark mode is extremely eye-friendly and there is literally no bloat. Saved me weeks of setup time on my new SaaS analytics page.',
        date: '2026-05-15'
      },
      {
        id: 'rev-102',
        username: 'Marc de Vries',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
        rating: 5,
        text: 'Highly modern layout! Looks incredibly premium out of the box. Tailwind v4 styling makes layout tweaking so fun.',
        date: '2026-05-20'
      },
      {
        id: 'rev-103',
        username: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        rating: 4,
        text: 'Excellent structure, well organized. A small bug in the notifications drawer was easily fixed by their support. Highly recommended templates!',
        date: '2026-05-28'
      }
    ]
  },
  {
    id: 'prod-02',
    title: 'VividUI - Premium Design System & Figma UI Kit',
    shortDescription: 'Comprehensive, hyper-customizable Figma UI kit with 2,400+ nested auto-layout variants, interactive prototypes, and global color styles.',
    description: 'VividUI is the ultimate design framework constructed to elevate production speed by 300%. Leverage an ultra-consistent grid system, pre-made responsive website mockups, and thousands of highly detailed dark/light component variables (inputs, tables, modals, cards, sliders, and navigation headers).\n\nBuilt following the latest Figma Auto Layout constraints and Component Properties conventions, ensuring perfect scaling without broken vectors or uneven gaps.',
    category: 'UI Kits',
    price: 35,
    rating: 4.8,
    reviewsCount: 18,
    tags: ['Figma', 'UI Kit', 'Design System', 'SaaS UI', 'UX Design', 'Auto Layout'],
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://www.dropbox.com/sh/vividui_figma_system_prod_v2x_shared?dl=1',
    provider: 'Dropbox',
    dateCreated: '2026-05-01',
    features: [
      '2,400+ Auto-Layout component variants',
      'Sleek modern bento-grid templates included',
      'Advanced token values for colors & spacing variables',
      'Interactive nested button states and smart dropdowns',
      'Comprehensive customer support & future file updates'
    ],
    fileSize: '41.2 MB',
    fileFormat: '.FIG file',
    version: '2.1.0',
    reviews: [
      {
        id: 'rev-201',
        username: 'Derrick Powell',
        rating: 5,
        text: 'This UI kit is ridiculously organized. The variants are set up perfectly. Hand-offs to my developers have never been easier.',
        date: '2026-05-18'
      },
      {
        id: 'rev-202',
        username: 'Yuki Sato',
        rating: 4,
        text: 'Amazing visual aesthetic. The bento grid structures are very modern. Only downside is learning the nested structure, but it makes complete sense after 30 minutes!',
        date: '2026-05-25'
      }
    ]
  },
  {
    id: 'prod-03',
    title: 'Stripe Payment Gateway Core Python Script',
    shortDescription: 'Production-ready server-side script integrating Stripe multi-tier subscriptions, secure customer portal redirect, and automated webhooks processing.',
    description: 'Stop spending days building billing engines from scratch. This production-ready Python Fast-API backend template integrates Stripe fully, dealing securely with multi-tier usage pricing, trial logic, receipt emails, automated renewals, and secure checkout portals.\n\nComes equipped with detailed verification logs, database connection presets, and pre-configured Docker environments for seamless, secure deployments.',
    category: 'Scripts',
    price: 19,
    rating: 4.7,
    reviewsCount: 12,
    tags: ['Python', 'Stripe API', 'SaaS Billing', 'FastAPI', 'Docker', 'Backend'],
    previewImage: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://github.com/gateways-core/stripe-billing-fastapi-sandbox/archive/refs/tags/v1.0.4.zip',
    provider: 'GitHub',
    dateCreated: '2026-03-20',
    features: [
      'FastAPI production-ready microservice',
      'Secure Stripe Webhook verification and signature matching',
      'Multi-tier SaaS billing, localized currencies, and tax hooks',
      'Docker Compose setup with PostgreSQL storage setup',
      'Comprehensive error handling for client banking declines'
    ],
    fileSize: '1.4 MB',
    fileFormat: 'ZIP (Python Source Code)',
    version: '1.0.4',
    reviews: [
      {
        id: 'rev-301',
        username: 'Alexander Vance',
        rating: 5,
        text: 'Absolutely secure. Webhooks handle failures instantly. The documentation on variables set my mind at ease.',
        date: '2026-04-10'
      }
    ]
  },
  {
    id: 'prod-04',
    title: 'Chroma Editor - NeoVim Performance Plugin',
    shortDescription: 'LUA plugin designed to speed up source files load-times and boost auto-completions, syntax highlights, and folder index scopes.',
    description: 'Chroma Editor is an ultra-fast Lua plugin crafted specifically to modernize your Neovim workspace. Optimize memory overhead, index files recursively safely under 10ms, and customize gorgeous sidebar themes that mirror premium high-end visual editors.\n\nNo bulky JavaScript processes running under the hood. Pure high-performance Lua code built for advanced engineers.',
    category: 'Plugins',
    price: 15,
    rating: 4.9,
    reviewsCount: 37,
    tags: ['NeoVim', 'LUA Plugin', 'Developer Utility', 'Dev Environment', 'Syntax Code'],
    previewImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://cdn.marketplace-assets.net/plugins/chroma_editor_neovim_lua_v0.9.8_archive.zip',
    provider: 'CDN',
    dateCreated: '2026-05-10',
    features: [
      'Zero-latency syntax rendering for 20+ coding languages',
      'Under 10ms workspace recursive index searches',
      'Sleek modern minimal sidebar trees with customized glyphs',
      'Automated diagnostic warnings inside command status line',
      'Fully asynchronous operations to match highest keystroke Speeds'
    ],
    fileSize: '850 KB',
    fileFormat: 'ZIP Archive',
    version: '0.9.8',
    reviews: [
      {
        id: 'rev-401',
        username: 'Linus W.',
        rating: 5,
        text: 'Mind-blowingly fast. Makes Neovim feel even lighter while giving IDE-level diagnostic hints.',
        date: '2026-05-22'
      }
    ]
  },
  {
    id: 'prod-05',
    title: 'PixelArt Abstract Creator - 3D Assets Pack',
    shortDescription: '80+ premium, ultra-high resolution (4K) 3D shapes, sleek metallic icons, and customizable organic textures for modern web headers.',
    description: 'Inject depth and energy into your creative layouts with this premium 3D assets collection. Perfect for hero banners, landing page dividers, and editorial presentation graphics. Features sleek iridescent or metallic surfaces, complex grid wireframes, and gorgeous organic clay spheres.\n\nIncludes fully-mapped Blender source files (.blend) alongside pre-rendered high-contrast PNG layers with transparent backgrounds for immediate drag-and-drop actions.',
    category: 'Graphics',
    price: 29,
    rating: 4.6,
    reviewsCount: 30,
    tags: ['3D Shapes', 'Blender', 'SaaS Graphics', 'Hero Illustrations', 'Metallic Style', 'Organic Gradients'],
    previewImage: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://drive.google.com/drive/folders/1PixelArt_Abstract_3D_Premium_Graphics_Pack',
    provider: 'Google Drive',
    dateCreated: '2026-02-14',
    features: [
      '80+ completely distinct 3D objects & wireframes',
      'Ultra high-resolution transparent PNG exports (3840 x 2160 px)',
      'Blender (.blend) files with configured scene environments, metallic shaders',
      'Bonus: 12 pre-arranged atmospheric background wallpapers',
      'Free lifetime asset additions and texture upgrades'
    ],
    fileSize: '345 MB',
    fileFormat: 'PNG + Blender Sources (Zip)',
    version: '3.0.0',
    reviews: [
      {
        id: 'rev-501',
        username: 'Jessica Chen',
        rating: 5,
        text: 'The translucent shaders are magnificent! Our landing page conversion instantly jumped by 15% after placing these in our hero banner.',
        date: '2026-04-12'
      },
      {
        id: 'rev-502',
        username: 'Kevin Thomas',
        rating: 4,
        text: 'Extremely good assets. The blender files are organized very well with light scopes and material variables preset.',
        date: '2026-05-02'
      }
    ]
  },
  {
    id: 'prod-06',
    title: 'LocalSync - Secure JSON Database CLI Tool',
    shortDescription: 'Lightweight, ultra-fast local JSON storage and CLI syncing script designed to securely database lightweight project profiles locally.',
    description: 'LocalSync provides an incredibly robust, zero-configuration local flat JSON file storage tool equipped with synchronous locks, instant backup scripts, and terminal search menus. Ideal for developers working on micro-agents, rapid scrapers, or private local setups where setting up heavy databases is unnecessary overhead.\n\nWritten in optimized Rust, compilation results are native executables tailored for Mac, Windows, and Linux shells.',
    category: 'SaaS Tools',
    price: 24,
    rating: 4.5,
    reviewsCount: 9,
    tags: ['Rust CLI', 'JSON DB', 'Developer Utility', 'Local Storage', 'Sync Script'],
    previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://github.com/localsync-cli/engine/releases/download/v1.12.0/localsync-v1.12.0-binary.zip',
    provider: 'GitHub',
    dateCreated: '2026-01-29',
    features: [
      'Zero external daemon setup - instant Rust flat database logic',
      'Atomic writes safeguarding indices from race conditions',
      'Command terminal with advanced query filters & backup utilities',
      'Precompiled high-performance binaries for macOS, Linux, and Windows shells',
      'Fully sandboxed data, zero data transmitted over internet lines'
    ],
    fileSize: '4.2 MB',
    fileFormat: 'Precompiled EXE / ZIP Binary',
    version: '1.12.0',
    reviews: [
      {
        id: 'rev-601',
        username: 'Gilles Bertrand',
        rating: 5,
        text: 'Exactly what I needed for my shell bots. Safe, fast, simple. Does not crash or leak data when multiple async scripts write concurrently.',
        date: '2026-03-12'
      }
    ]
  },
  {
    id: 'prod-07',
    title: 'CognitiveMaster - Advanced Gemini Prompts Bundle',
    shortDescription: '150+ highly engineered system prompts designed to trigger deep-reasoning, custom layout design, and full-stack coding outputs.',
    description: 'Unlock the true capacity of generative AI with CognitiveMaster. This bundle contains highly engineered, few-shot structural system prompts crafted specifically to elicit high-quality code, multi-agent orchestrations, structural JSON formats, and editorial copy without robotic boilerplate sentences.\n\nOptimized for Gemini, Claude, and GPT models, and comes with a beautiful search helper file (HTML UI) to easily copy/paste matching prompt contexts.',
    category: 'AI Prompts',
    price: 9,
    rating: 4.9,
    reviewsCount: 52,
    tags: ['Gemini', 'Prompt Engineering', 'AI Coding', 'SaaS Prompts', 'Markdown Docs'],
    previewImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://drive.google.com/drive/folders/1cognitivemaster_prompts_bundle_unlocked_99x',
    provider: 'Google Drive',
    dateCreated: '2026-05-14',
    features: [
      '150+ modular, few-shot prompts grouped by dev, marketing, & analytics goals',
      'Structural parameters for XML, JSON, and complex TS layouts',
      'Beautiful self-standing offline prompt browser web page built-in',
      'Tutorial PDF guide covering temperature adjustments and context window tricks',
      'Free updates whenever new AI model revisions are deployed'
    ],
    fileSize: '3.1 MB',
    fileFormat: 'Markdown Documents + Offline UI',
    version: '2.5.0',
    reviews: [
      {
        id: 'rev-701',
        username: 'Mubarak Al-Farsi',
        rating: 5,
        text: 'The "Structured Code Generator" instruction is absolute gold. The model output is so much tidier and does not stop mid-sentence anymore! Worth ten times the cost.',
        date: '2026-05-24'
      },
      {
        id: 'rev-702',
        username: 'Anna Kowalsky',
        rating: 5,
        text: 'Unbelievably precise. Saves hours of framing questions to get correct system instructions.',
        date: '2026-05-29'
      }
    ]
  },
  {
    id: 'prod-08',
    title: 'Nova SaaS Landing Page Framework',
    shortDescription: 'Extremely responsive React SaaS landing template with high-performance animations, pricing cards, and waitlist integration models.',
    description: 'Nova is a modern web framework customized for founders looking to build waitlists, capture emails, and display core product advantages. Packed with features including sticky custom headers, a modular pricing grid with yearly/monthly discounts, sliding testimonial boards, and animated FAQs.',
    category: 'Web Templates',
    price: 39,
    rating: 4.7,
    reviewsCount: 16,
    tags: ['React', 'Landing Page', 'SaaS', 'Tailwind CSS', 'Vite Starter'],
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://www.dropbox.com/sh/nova_landing_saas_framework_shared_folder?dl=1',
    provider: 'Dropbox',
    dateCreated: '2026-04-22',
    features: [
      'Highly responsive UI constructed with Tailwind CSS v4',
      'Frictionless custom email waitlist form setup',
      'Elegant animated layout elements via Motion',
      'SEO optimized meta tags & web crawler configurations preconfigured',
      'Flexible layouts for tech, agencies, or solo-builder tools'
    ],
    fileSize: '9.4 MB',
    fileFormat: 'React 19 Vite Template (.zip)',
    version: '1.0.1',
    reviews: [
      {
        id: 'rev-801',
        username: 'Ethan Hunt',
        rating: 5,
        text: 'Deployed to Vercel in 2 minutes flat! The custom waitlist validation hook is seamless and feels incredibly premium.',
        date: '2026-05-10'
      }
    ]
  },
  {
    id: 'prod-09',
    title: 'Iconic3D - Neon Icon Set (SVG & GLTF)',
    shortDescription: '120+ glowing glowing vectors and GLTF models for technology brands, cryptocurrency panels, and future cyber dashboards.',
    description: 'Give your interface a striking, glowing aesthetic with the Iconic3D asset kit. Packed with beautifully detailed SVG source vectors for standard light weights, alongside stunning pre-baked GLTF models that showcase gorgeous iridescent lights and shiny chrome shaders.',
    category: 'Graphics',
    price: 18,
    rating: 4.4,
    reviewsCount: 15,
    tags: ['Icons', '3D vectors', 'GLTF Models', 'SVG Icons', 'Sci-Fi Visuals'],
    previewImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://cdn.marketplace-assets.net/graphics/iconic3d_neon_assets_v1.5_full.zip',
    provider: 'CDN',
    dateCreated: '2026-03-15',
    features: [
      '120+ unique cybertech & analytics conceptual icons',
      'Format formats: SVGs (source vectors) + OBJ/GLTF files',
      'Pre-baked glowing emissive maps for real web performance',
      'Flexible license matching personal & heavy commercial apps',
      'Optimized lightweight models for instant browser loading times'
    ],
    fileSize: '58.4 MB',
    fileFormat: 'ZIP (SVG + GLTF)',
    version: '1.5.0',
    reviews: [
      {
        id: 'rev-901',
        username: 'Tyler Durden',
        rating: 4,
        text: 'Extremely clean vectors and GLTF imports load instantly in Three.js! A stellar addition to any tech page.',
        date: '2026-04-02'
      }
    ]
  },
  {
    id: 'prod-10',
    title: 'Express JWT Authorization & Role Middleware',
    shortDescription: 'Highly secure, production-ready Express Node middleware processing JSON Web Tokens (JWT), refresh cycles, and user roles.',
    description: 'Secure your Node API endpoints with this production-ready JWT Auth middleware library. Includes advanced cryptography, automated token refresh mechanics, user roles authorization filters, and Redis blacklist storage connection configurations.\n\nTested to defend against signature forging, database-timing attacks, and token-reuse exploits.',
    category: 'Scripts',
    price: 25,
    rating: 4.8,
    reviewsCount: 11,
    tags: ['Node.js', 'Express', 'JWT', 'Security Middleware', 'SaaS Auth', 'Backend'],
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    downloadUrl: 'https://github.com/gateways-core/express-jwt-roles-auth-handler/archive/refs/tags/v2.1.2.zip',
    provider: 'GitHub',
    dateCreated: '2026-05-18',
    features: [
      'Comprehensive JWT auth architecture including Refresh tokens',
      'Role-based Access Control (RBAC) middleware for multi-tiered memberships',
      'Robust cookie validation and Authorization Header fallbacks',
      'Automatic IP rating constraints safeguarding routes from DDoS spamming',
      'Exemplary sandbox configuration showing user registers, logins, and private scopes'
    ],
    fileSize: '1.9 MB',
    fileFormat: 'ZIP (.TS Files)',
    version: '2.1.2',
    reviews: [
      {
        id: 'rev-1001',
        username: 'Arnaud Dubois',
        rating: 5,
        text: 'Bypassed authentication worries on my team completely. Securely written, easy to import, and perfect for role boundaries.',
        date: '2026-05-25'
      }
    ]
  }
];
