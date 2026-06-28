import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// ─── TYPES ───
type Page = string;
type PageStatus = 'draft' | 'published';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: PageStatus;
  order: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon?: string;
  order: number;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  slug: string;
  icon?: string;
  order: number;
}

interface AppContextType {
  pages: ContentPage[];
  navigation: NavGroup[];
  settings: any;
  isAdmin: boolean;
  addPage: (page: ContentPage) => void;
  updatePage: (page: ContentPage) => void;
  deletePage: (id: string) => void;
  updateNavigation: (nav: NavGroup[]) => void;
  refreshData: () => void;
}

// ─── ICONS ───
const ICONS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  "chevron-right": "M9 5l7 7-7 7",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 18L18 6M6 6l12 12",
  plus: "M12 4v16m8-8H4",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  save: "M5 13l4 4L19 7",
  "arrow-up": "M5 10l7-7m0 0l7 7m-7-7v18",
  "arrow-down": "M19 14l-7 7m0 0l-7-7m7 7V3",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  folder: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  github: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const path = ICONS[name];
  if (!path) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {name === "github" ? <path d={path} fill="currentColor" stroke="none" /> : <path d={path} />}
    </svg>
  );
}

// ─── LOCAL STORAGE HELPERS ───
function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── DEFAULT DATA ───
const DEFAULT_PAGES: ContentPage[] = [
  { id: 'home', slug: 'home', title: 'Home', description: 'Welcome to documentation', content: '# Welcome\n\nThis is your documentation site.', status: 'published', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const DEFAULT_NAVIGATION: NavGroup[] = [
  { id: 'main', label: 'Main Pages', order: 0, items: [{ id: 'home', label: 'Home', slug: 'home', order: 0 }] },
];

// ─── CONTEXT ───
const AppContext = createContext<AppContextType>({} as AppContextType);
const useApp = () => useContext(AppContext);

// ─── AUTH ───
function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  
  const login = (password: string) => {
    if (password === 'admin123') {
      const t = btoa(`admin:${Date.now()}`);
      localStorage.setItem('auth_token', t);
      setToken(t);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
  };
  
  return { isAuthenticated: !!token, login, logout };
}

// ─── GLASS UI COMPONENTS ───
function Glass({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl ${className}`} {...props}>{children}</div>;
}

function GlassInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none ${className}`} {...props} />;
}

function GlassTextarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none ${className}`} {...props} />;
}

function GlassButton({ className = "", children, variant = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'danger' }) {
  const variants = {
    default: "border-white/10 bg-white/5 hover:bg-white/10 text-white/70",
    primary: "border-white/20 bg-white text-black hover:bg-white/90",
    danger: "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400",
  };
  return <button className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// ─── MARKDOWN RENDERER ───
function renderMarkdown(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-white/70">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="text-white/50 mb-3">')
    .replace(/\n- (.+)/g, '<li class="text-white/50 ml-4">$1</li>');
  
  return `<p class="text-white/50 mb-3">${html}</p>`;
}

// ─── PAGE RENDERER ───
function PageRenderer({ slug }: { slug: string }) {
  const { pages } = useApp();
  const page = pages.find(p => p.slug === slug);
  
  if (!page) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-white/50">The page "{slug}" doesn't exist.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50 backdrop-blur-xl">
          {page.status === 'draft' ? 'Draft' : 'Published'}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-white">{page.title}</h1>
        {page.description && <p className="mt-2 text-white/50">{page.description}</p>}
      </div>
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
      />
    </div>
  );
}

// ─── ADMIN DASHBOARD ───
function AdminDashboard() {
  const { pages, navigation, isAdmin, addPage, updatePage, deletePage, updateNavigation } = useApp();
  const [activeTab, setActiveTab] = useState<'pages' | 'navigation' | 'editor'>('pages');
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [editingNav, setEditingNav] = useState<NavGroup[]>(navigation);
  const [newPage, setNewPage] = useState({ title: '', slug: '', description: '', content: '' });
  const [showNewPage, setShowNewPage] = useState(false);
  
  const handleCreatePage = () => {
    const page: ContentPage = {
      id: Date.now().toString(),
      slug: newPage.slug || newPage.title.toLowerCase().replace(/\s+/g, '-'),
      title: newPage.title,
      description: newPage.description,
      content: newPage.content,
      status: 'draft',
      order: pages.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPage(page);
    setNewPage({ title: '', slug: '', description: '', content: '' });
    setShowNewPage(false);
  };
  
  const handleUpdatePage = (page: ContentPage) => {
    updatePage({ ...page, updatedAt: new Date().toISOString() });
    setEditingPage(null);
  };
  
  const handleDeletePage = (id: string) => {
    if (confirm('Delete this page?')) {
      deletePage(id);
    }
  };
  
  const handleSaveNavigation = () => {
    updateNavigation(editingNav);
  };
  
  const addNavItem = (groupId: string) => {
    setEditingNav(nav => nav.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, { id: Date.now().toString(), label: 'New Item', slug: 'new-item', order: group.items.length }] }
        : group
    ));
  };
  
  const addNavGroup = () => {
    setEditingNav([...editingNav, { id: Date.now().toString(), label: 'New Group', order: editingNav.length, items: [] }]);
  };
  
  if (!isAdmin) return null;
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl min-h-screen p-4">
          <h2 className="text-lg font-bold mb-6 px-2">Admin Panel</h2>
          <nav className="space-y-1">
            {['pages', 'navigation', 'editor'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </aside>
        
        {/* Admin Content */}
        <main className="flex-1 p-8">
          {activeTab === 'pages' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Pages</h2>
                <GlassButton variant="primary" onClick={() => setShowNewPage(true)}>
                  <Icon name="plus" className="h-4 w-4" /> New Page
                </GlassButton>
              </div>
              
              {showNewPage && (
                <Glass className="p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Create New Page</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-1">Title</label>
                      <GlassInput value={newPage.title} onChange={e => setNewPage({ ...newPage, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-1">Slug</label>
                      <GlassInput value={newPage.slug} onChange={e => setNewPage({ ...newPage, slug: e.target.value })} placeholder="my-page-slug" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-1">Description</label>
                      <GlassInput value={newPage.description} onChange={e => setNewPage({ ...newPage, description: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-1">Content (Markdown)</label>
                      <GlassTextarea rows={8} value={newPage.content} onChange={e => setNewPage({ ...newPage, content: e.target.value })} />
                    </div>
                    <div className="flex gap-3">
                      <GlassButton variant="primary" onClick={handleCreatePage}>Create</GlassButton>
                      <GlassButton onClick={() => setShowNewPage(false)}>Cancel</GlassButton>
                    </div>
                  </div>
                </Glass>
              )}
              
              <div className="space-y-3">
                {pages.map(page => (
                  <Glass key={page.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{page.title}</h3>
                      <p className="text-sm text-white/40">/{page.slug} · {page.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton onClick={() => { setEditingPage(page); setActiveTab('editor'); }}>
                        <Icon name="edit" className="h-4 w-4" />
                      </GlassButton>
                      <GlassButton variant="danger" onClick={() => handleDeletePage(page.id)}>
                        <Icon name="trash" className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </Glass>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'navigation' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Navigation</h2>
                <div className="flex gap-3">
                  <GlassButton onClick={addNavGroup}>
                    <Icon name="plus" className="h-4 w-4" /> Add Group
                  </GlassButton>
                  <GlassButton variant="primary" onClick={handleSaveNavigation}>
                    <Icon name="save" className="h-4 w-4" /> Save
                  </GlassButton>
                </div>
              </div>
              
              {editingNav.map((group, gi) => (
                <Glass key={group.id} className="p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <GlassInput 
                      value={group.label} 
                      onChange={e => {
                        const updated = [...editingNav];
                        updated[gi].label = e.target.value;
                        setEditingNav(updated);
                      }}
                      className="flex-1"
                    />
                    <GlassButton variant="danger" onClick={() => setEditingNav(editingNav.filter((_, i) => i !== gi))}>
                      <Icon name="trash" className="h-4 w-4" />
                    </GlassButton>
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {group.items.map((item, ii) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <GlassInput
                          value={item.label}
                          onChange={e => {
                            const updated = [...editingNav];
                            updated[gi].items[ii].label = e.target.value;
                            setEditingNav(updated);
                          }}
                          className="flex-1"
                          placeholder="Label"
                        />
                        <GlassInput
                          value={item.slug}
                          onChange={e => {
                            const updated = [...editingNav];
                            updated[gi].items[ii].slug = e.target.value;
                            setEditingNav(updated);
                          }}
                          className="w-48"
                          placeholder="slug"
                        />
                        <GlassButton variant="danger" onClick={() => {
                          const updated = [...editingNav];
                          updated[gi].items = updated[gi].items.filter((_, i) => i !== ii);
                          setEditingNav(updated);
                        }}>
                          <Icon name="x" className="h-4 w-4" />
                        </GlassButton>
                      </div>
                    ))}
                    <GlassButton onClick={() => addNavItem(group.id)}>
                      <Icon name="plus" className="h-3 w-3" /> Add Item
                    </GlassButton>
                  </div>
                </Glass>
              ))}
            </div>
          )}
          
          {activeTab === 'editor' && editingPage && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit: {editingPage.title}</h2>
                <div className="flex gap-3">
                  <GlassButton onClick={() => setEditingPage(null)}>Cancel</GlassButton>
                  <GlassButton variant="primary" onClick={() => handleUpdatePage(editingPage)}>
                    <Icon name="save" className="h-4 w-4" /> Save
                  </GlassButton>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/50 mb-1">Title</label>
                    <GlassInput 
                      value={editingPage.title} 
                      onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-1">Slug</label>
                    <GlassInput 
                      value={editingPage.slug} 
                      onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-1">Description</label>
                    <GlassInput 
                      value={editingPage.description} 
                      onChange={e => setEditingPage({ ...editingPage, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-1">Status</label>
                    <select 
                      value={editingPage.status}
                      onChange={e => setEditingPage({ ...editingPage, status: e.target.value as PageStatus })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-1">Content (Markdown)</label>
                    <GlassTextarea 
                      rows={20} 
                      value={editingPage.content} 
                      onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-white/50 mb-2">Preview</label>
                  <Glass className="p-6 min-h-[400px]">
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(editingPage.content) }} />
                  </Glass>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
function App() {
  const [pages, setPages] = useState<ContentPage[]>(() => getStoredData('cms_pages', DEFAULT_PAGES));
  const [navigation, setNavigation] = useState<NavGroup[]>(() => getStoredData('cms_navigation', DEFAULT_NAVIGATION));
  const [currentSlug, setCurrentSlug] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const { isAuthenticated, login, logout } = useAuth();
  
  // Persist to localStorage
  useEffect(() => { setStoredData('cms_pages', pages); }, [pages]);
  useEffect(() => { setStoredData('cms_navigation', navigation); }, [navigation]);
  
  // Handle hash navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentSlug(hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  
  const navigate = (slug: string) => {
    window.location.hash = slug;
    setCurrentSlug(slug);
    setSidebarOpen(false);
  };
  
  const addPage = (page: ContentPage) => setPages(prev => [...prev, page]);
  const updatePage = (page: ContentPage) => setPages(prev => prev.map(p => p.id === page.id ? page : p));
  const deletePage = (id: string) => setPages(prev => prev.filter(p => p.id !== id));
  const updateNavigation = (nav: NavGroup[]) => setNavigation(nav);
  
  const allItems = navigation.flatMap(g => g.items);
  const filteredItems = searchQuery ? allItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  
  const contextValue: AppContextType = {
    pages, navigation, settings: {},
    isAdmin: isAuthenticated,
    addPage, updatePage, deletePage, updateNavigation,
    refreshData: () => {},
  };
  
  // Login screen
  if (showAdmin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Glass className="p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <LoginForm onLogin={(pass) => {
            if (login(pass)) {
              setShowAdmin(true);
            } else {
              alert('Invalid password');
            }
          }} onCancel={() => setShowAdmin(false)} />
        </Glass>
      </div>
    );
  }
  
  // Admin dashboard
  if (showAdmin && isAuthenticated) {
    return (
      <AppContext.Provider value={contextValue}>
        <div>
          <div className="bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <h1 className="text-white font-bold">CMS Admin</h1>
            <div className="flex items-center gap-3">
              <GlassButton onClick={() => setShowAdmin(false)}>
                <Icon name="eye" className="h-4 w-4" /> View Site
              </GlassButton>
              <GlassButton onClick={logout} variant="danger">
                <Icon name="logout" className="h-4 w-4" /> Logout
              </GlassButton>
            </div>
          </div>
          <AdminDashboard />
        </div>
      </AppContext.Provider>
    );
  }
  
  // Public site
  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-black text-white">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-black/80 backdrop-blur-2xl transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">D</span>
              <span className="font-semibold text-white">Docs CMS</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-white/50 hover:text-white">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
              {searchQuery && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { navigate(item.slug); setSearchQuery(''); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {navigation.map(group => (
              <div key={group.id} className="mb-2">
                <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/30">{group.label}</h3>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentSlug === item.slug 
                        ? 'bg-white/10 text-white font-medium' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setShowAdmin(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon name="settings" className="h-4 w-4" /> Admin Panel
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <div className="lg:ml-72">
          {/* Top bar */}
          <div className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-2xl px-4 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-white/50 hover:text-white">
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span className="text-white/60">Docs</span>
              <Icon name="chevron-right" className="h-3 w-3" />
              <span className="text-white">{pages.find(p => p.slug === currentSlug)?.title || currentSlug}</span>
            </div>
          </div>
          
          {/* Page content */}
          <main className="max-w-4xl mx-auto px-6 py-10">
            <PageRenderer slug={currentSlug} />
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}

// ─── LOGIN FORM ───
function LoginForm({ onLogin, onCancel }: { onLogin: (pass: string) => void; onCancel: () => void }) {
  const [password, setPassword] = useState('');
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">Password</label>
        <GlassInput 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter admin password"
        />
        <p className="text-xs text-white/30 mt-1">Default: admin123</p>
      </div>
      <div className="flex gap-3">
        <GlassButton variant="primary" onClick={() => onLogin(password)}>Login</GlassButton>
        <GlassButton onClick={onCancel}>Cancel</GlassButton>
      </div>
    </div>
  );
}

export default App;
