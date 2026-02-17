import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Upload, Image, Eye, EyeOff,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Heading4, Highlighter,
  Minus, Undo, Redo, Search, Youtube, Sparkles, FolderOpen, Loader2, Check, Star, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TiptapYoutube from '@tiptap/extension-youtube';
import AssetPicker from './AssetPicker';

const API = process.env.REACT_APP_BACKEND_URL;

/* ═══════════════════════════════════════════════════════════════
   ADMIN BLOG TAB — List View
   ═══════════════════════════════════════════════════════════════ */

const AdminBlogTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newsletterPost, setNewsletterPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/blog`);
      if (response.ok) setPosts(await response.json());
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Archive "${post.title}"?`)) return;
    try {
      await fetch(`${API}/api/blog/${post.id}`, { method: 'DELETE' });
      toast.success('Post archived');
      fetchPosts();
    } catch { toast.error('Error archiving post'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">The Den (Blog)</h2>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchPosts} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg text-sm"
            data-testid="new-post-btn"
          >
            <Plus size={18} /> New Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">No posts yet</p>
          <button onClick={() => { setEditingPost(null); setIsModalOpen(true); }} className="text-electric-blue hover:underline">Create your first post</button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className={`bg-smoke-gray border rounded-lg p-4 flex items-center gap-4 ${post.is_archived ? 'border-red-900/50 opacity-60' : 'border-gray-800'}`}>
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                {post.cover_image_url ? <img src={`${API}${post.cover_image_url}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><Image size={24} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.featured && <Star size={14} className="text-electric-blue" fill="currentColor" />}
                  <h4 className="text-white font-medium truncate">{post.title}</h4>
                  {post.is_archived && <span className="text-red-400 text-xs">(Archived)</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`inline-flex items-center gap-1 ${post.status === 'Published' ? 'text-green-400' : 'text-gray-500'}`}>
                    {post.status === 'Published' ? <Eye size={12} /> : <EyeOff size={12} />} {post.status}
                  </span>
                  <span className="text-gray-500">{formatDate(post.published_at)}</span>
                  {post.slug && <span className="text-electric-blue text-xs font-mono">/blog/{post.slug}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.status === 'Published' && (
                  <button onClick={() => setNewsletterPost(post)} className="p-2 text-gray-400 hover:text-green-400" title="Send as Newsletter" data-testid={`newsletter-btn-${post.id}`}><Send size={18} /></button>
                )}
                <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-electric-blue" title="Edit" data-testid={`edit-btn-${post.id}`}><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(post)} className="p-2 text-gray-400 hover:text-red-400" title="Archive" data-testid={`delete-btn-${post.id}`}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <BlogPostModal
          post={editingPost}
          onClose={() => setIsModalOpen(false)}
          onSave={() => { setIsModalOpen(false); fetchPosts(); }}
        />
      )}

      {newsletterPost && (
        <BlogNewsletterModal
          post={newsletterPost}
          onClose={() => setNewsletterPost(null)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TIPTAP MENU BAR
   ═══════════════════════════════════════════════════════════════ */

const MenuBar = ({ editor, onImageInsert }) => {
  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (onImageInsert) {
      onImageInsert();
    } else {
      const url = window.prompt('Enter image URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, onImageInsert]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube video URL:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  const btn = (active) => `p-1.5 rounded transition-colors ${active ? 'bg-electric-blue/30 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/10'}`;
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-700 bg-gray-900 sticky top-0 z-20">
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btn(false)} disabled:opacity-30`} title="Undo"><Undo size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btn(false)} disabled:opacity-30`} title="Redo"><Redo size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive('heading', { level: 1 }))} title="H1"><Heading1 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="H2"><Heading2 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="H3"><Heading3 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={btn(editor.isActive('heading', { level: 4 }))} title="H4"><Heading4 size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline"><Underline size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strike"><Strikethrough size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive('highlight'))} title="Highlight"><Highlighter size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullets"><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered"><ListOrdered size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title="Left"><AlignLeft size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title="Center"><AlignCenter size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title="Right"><AlignRight size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btn(editor.isActive({ textAlign: 'justify' }))} title="Justify"><AlignJustify size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Quote"><Quote size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive('codeBlock'))} title="Code"><Code size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="HR"><Minus size={16} /></button>
      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
      <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Link"><LinkIcon size={16} /></button>
      <button type="button" onClick={addImage} className={btn(false)} title="Image"><Image size={16} /></button>
      <button type="button" onClick={addYoutube} className={btn(editor.isActive('youtube'))} title="YouTube"><Youtube size={16} /></button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BLOG POST MODAL — Blog Post Builder
   Tabs: Basics | Content | Media | SEO
   ═══════════════════════════════════════════════════════════════ */

const MODAL_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
];

const BlogPostModal = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    status: post?.status || 'Draft',
    featured: post?.featured || false,
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    cta_text: post?.cta_text || '',
    cta_microcopy: post?.cta_microcopy || '',
    tags: post?.tags || [],
    cover_image_url: post?.cover_image_url || '',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
    seo_keywords: post?.seo_keywords || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post?.slug);
  const [generatingCover, setGeneratingCover] = useState(false);

  // AI state
  const [aiOverlayOpen, setAiOverlayOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoResult, setSeoResult] = useState(null);
  const [imageInsertOpen, setImageInsertOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (key, val) => setFormData(s => ({ ...s, [key]: val }));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      TiptapUnderline,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: 'text-electric-blue underline' } }),
      TiptapImage.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-500/30 px-1 rounded' } }),
      TiptapYoutube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'my-4 rounded-lg overflow-hidden' } }),
    ],
    content: '',
    editorProps: { attributes: { class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none' } },
  });

  // Set editor content when post is loaded or editor is ready
  useEffect(() => {
    if (editor && post?.content) {
      editor.commands.setContent(post.content);
    }
  }, [editor, post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
      setFormData(s => ({ ...s, slug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const [assetPickerFor, setAssetPickerFor] = useState('cover'); // 'cover' or 'inline'
  
  const openAssetPicker = () => { setAssetPickerFor('cover'); setAssetPickerOpen(true); };
  const handleAssetSelect = (url) => {
    if (assetPickerFor === 'inline') {
      // Insert into editor
      editor?.chain().focus().setImage({ src: url.startsWith('http') ? url : `${API}${url}` }).run();
      toast.success('Image inserted');
    } else {
      // Cover image
      set('cover_image_url', url);
      toast.success('Cover image selected');
    }
  };

  const uploadFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    fd.append('source', 'blog'); fd.append('tags', `blog,cover,${formData.title?.slice(0, 20) || 'post'}`);
    setUploading(true);
    fetch(`${API}/api/upload/image`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { set('cover_image_url', d.url); toast.success('Uploaded'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };

  const generateCoverImage = async () => {
    if (!formData.title.trim()) { toast.error('Add a title first'); return; }
    setGeneratingCover(true);
    toast.info('Generating cover image...');
    try {
      const content = editor ? editor.getHTML() : formData.content;
      const r = await fetch(`${API}/api/ai/generate-cover-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, content, tags: formData.tags, excerpt: formData.excerpt })
      });
      if (r.ok) { const d = await r.json(); set('cover_image_url', d.image_url); toast.success('Cover image generated!'); }
      else { const err = await r.json(); toast.error(err.detail || 'Failed'); }
    } catch { toast.error('Error generating image'); }
    finally { setGeneratingCover(false); }
  };

  // ── AI Generate All (Content tab) ──
  const generateAll = async () => {
    const content = editor ? editor.getHTML() : formData.content;
    if (!formData.title.trim() && !content.trim()) { toast.error('Add a title or content first'); return; }
    setAiGenerating(true);
    try {
      const r = await fetch(`${API}/api/ai/generate-blog-seo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, content, tags: formData.tags, excerpt: formData.excerpt })
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.detail || 'Generation failed'); }
      const data = await r.json();
      setAiResult(data);
      setAiOverlayOpen(true);
    } catch (err) { toast.error(err.message || 'AI generation failed'); }
    finally { setAiGenerating(false); }
  };

  // ── SEO Generate (SEO tab) ──
  const generateSeo = async () => {
    const content = editor ? editor.getHTML() : formData.content;
    if (!formData.title.trim()) { toast.error('Add a title first'); return; }
    setSeoGenerating(true);
    setSeoResult(null);
    try {
      const r = await fetch(`${API}/api/ai/generate-blog-seo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, content, tags: formData.tags, excerpt: formData.excerpt })
      });
      if (r.ok) { setSeoResult(await r.json()); toast.success('SEO generated! Review below.'); }
      else { const err = await r.json(); toast.error(err.detail || 'Failed'); }
    } catch { toast.error('Error generating SEO'); }
    finally { setSeoGenerating(false); }
  };

  const applySeoField = (field) => {
    if (!seoResult) return;
    if (field === 'all') {
      const u = {};
      if (seoResult.seo_title) u.seo_title = seoResult.seo_title;
      if (seoResult.seo_description) u.seo_description = seoResult.seo_description;
      if (seoResult.excerpt) u.excerpt = seoResult.excerpt;
      if (seoResult.tags) u.tags = seoResult.tags;
      if (seoResult.seo_keywords) u.seo_keywords = seoResult.seo_keywords;
      setFormData(s => ({ ...s, ...u }));
      setSeoResult(null);
      toast.success('All SEO fields applied');
    } else {
      setFormData(s => ({ ...s, [field]: seoResult[field] }));
      toast.success(`${field} applied`);
    }
  };

  const save = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const content = editor ? editor.getHTML() : formData.content;
    const payload = { ...formData, content };
    try {
      const url = post ? `${API}/api/blog/${post.id}` : `${API}/api/blog`;
      const r = await fetch(url, { method: post ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) { toast.success(post ? 'Post updated' : 'Post created'); onSave(); }
      else { const err = await r.json(); toast.error(err.detail || 'Failed to save'); }
    } catch { toast.error('Error saving post'); }
    finally { setSaving(false); }
  };

  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${API}${u}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col" data-testid="blog-post-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">{post ? 'Edit' : 'New'} Post</h3>
            <p className="text-gray-600 text-xs">Blog Post Builder</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-4 overflow-x-auto flex-shrink-0">
          {MODAL_TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition-colors ${activeTab === tab.id ? 'bg-electric-blue text-white' : 'bg-smoke-gray text-gray-400 hover:text-white'}`}
              data-testid={`tab-${tab.id}`}>{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ─── BASICS ─── */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <Fl label="Post Title *" helper="Main title displayed on the blog page">
                <TI value={formData.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Behind the Scenes: Horror Lighting" data-testid="input-title" />
              </Fl>
              <Fl label="URL Slug" helper="Auto-generated from title. Edit to customize.">
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1">
                    <span className="text-gray-500 bg-black px-3 py-2 border border-r-0 border-gray-700 rounded-l-lg text-xs font-mono">/blog/</span>
                    <input type="text" value={formData.slug} onChange={e => { setSlugManuallyEdited(true); set('slug', e.target.value); }}
                      className="flex-1 bg-black border border-gray-700 rounded-r-lg px-3 py-2 text-white font-mono text-sm focus:border-electric-blue focus:outline-none" placeholder="post-slug" data-testid="input-slug" />
                  </div>
                  <button type="button" onClick={() => {
                    if (formData.title) {
                      const slug = formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
                      set('slug', slug); setSlugManuallyEdited(false); toast.success('Slug regenerated');
                    }
                  }} className="p-2 text-gray-400 hover:text-electric-blue border border-gray-700 rounded-lg bg-black" title="Regenerate from title" data-testid="regenerate-slug-btn">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </Fl>
              <Fl label="Status" helper="Draft posts are not visible to the public">
                <div className="flex gap-3">
                  {[
                    { val: 'Draft', icon: EyeOff, style: 'border-gray-700 text-gray-400', active: 'bg-black border-electric-blue text-white' },
                    { val: 'Published', icon: Eye, style: 'border-gray-700 text-gray-400', active: 'bg-green-500/20 border-green-500 text-green-400' },
                  ].map(({ val, icon: Icon, style, active }) => (
                    <label key={val} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${formData.status === val ? active : `bg-black ${style}`}`}>
                      <input type="radio" value={val} checked={formData.status === val} onChange={() => set('status', val)} className="hidden" />
                      <Icon size={16} /> {val}
                    </label>
                  ))}
                </div>
              </Fl>
              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={e => set('featured', e.target.checked)} className="rounded" /> Featured / Pinned
                </label>
              </div>
            </div>
          )}

          {/* ─── CONTENT ─── */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* AI Generate All Button */}
              <button type="button" onClick={generateAll} disabled={aiGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:from-electric-blue/20 hover:to-purple-500/20 transition-all disabled:opacity-50"
                data-testid="ai-generate-all-btn">
                {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiGenerating ? 'Generating...' : 'Generate Blog Post Metadata'}
              </button>

              {/* Rich Text Editor with Sticky Toolbar */}
              <Fl label="Content" helper="The main body of your blog post">
                <div className="bg-black border border-gray-700 rounded-lg overflow-hidden relative">
                  {/* Sticky MenuBar */}
                  <div className="sticky top-0 z-20">
                    <MenuBar editor={editor} onImageInsert={() => setImageInsertOpen(true)} />
                  </div>
                  {/* Editor Content - Scrollable */}
                  <div className="tiptap-editor-container max-h-[500px] overflow-y-auto">
                    <EditorContent editor={editor} className="min-h-[400px]" />
                  </div>
                </div>
              </Fl>

              {/* Final CTA */}
              <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-gray-800/50">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Final CTA</p>
                <Fl label="CTA Text" helper="Call-to-action at the end of the blog post">
                  <TI value={formData.cta_text} onChange={e => set('cta_text', e.target.value)} placeholder="Ready to start your next project?" data-testid="input-cta-text" />
                </Fl>
                <Fl label="CTA Microcopy" helper="One line of reassurance below the CTA">
                  <TI value={formData.cta_microcopy} onChange={e => set('cta_microcopy', e.target.value)} placeholder="No sign-up required. Start creating today." data-testid="input-cta-microcopy" />
                </Fl>
              </div>

              {/* Tags */}
              <TagEditor label="Tags" helper="Keywords for categorization and SEO" tags={formData.tags} onChange={v => set('tags', v)} />
            </div>
          )}

          {/* ─── MEDIA ─── */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <Fl label="Cover Image" helper="Appears in blog listings and as the post header. Ideal: 1200 x 630px (16:9 landscape)">
                <div className="flex items-start gap-4 flex-wrap">
                  {formData.cover_image_url && (
                    <div className="relative">
                      <img src={imgUrl(formData.cover_image_url)} alt="" className="w-48 h-28 object-cover rounded-lg" />
                      <button type="button" onClick={() => set('cover_image_url', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900 text-sm">
                      <Upload size={16} className="text-gray-400" /><span className="text-gray-400">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={uploadFile} className="hidden" disabled={uploading} />
                    </label>
                    <button type="button" onClick={openAssetPicker} className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20">
                      <FolderOpen size={16} /> Browse Library
                    </button>
                    <button type="button" onClick={generateCoverImage} disabled={generatingCover || !formData.title.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-electric-blue rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                      data-testid="ai-cover-btn">
                      {generatingCover ? <Loader2 size={16} className="text-white animate-spin" /> : <Sparkles size={16} className="text-white" />}
                      <span className="text-white">{generatingCover ? 'Generating...' : 'AI Generate'}</span>
                    </button>
                  </div>
                </div>
              </Fl>
            </div>
          )}

          {/* ─── SEO ─── */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              {/* AI SEO Generate */}
              <button type="button" onClick={generateSeo} disabled={seoGenerating || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:from-electric-blue/20 hover:to-purple-500/20 transition-all disabled:opacity-50"
                data-testid="ai-generate-seo-btn">
                {seoGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {seoGenerating ? 'Generating...' : 'Generate SEO from Content'}
              </button>

              {/* SEO AI Result Preview */}
              {seoResult && (
                <div className="bg-electric-blue/5 border border-electric-blue/20 rounded-lg p-4 space-y-3" data-testid="seo-result-preview">
                  <p className="text-white text-sm font-medium flex items-center gap-2"><Sparkles size={14} className="text-electric-blue" /> AI-Generated SEO</p>
                  {seoResult.seo_title && <SeoPreviewItem label="SEO Title" value={seoResult.seo_title} onApply={() => applySeoField('seo_title')} />}
                  {seoResult.seo_description && <SeoPreviewItem label="Meta Description" value={seoResult.seo_description} onApply={() => applySeoField('seo_description')} />}
                  {seoResult.excerpt && <SeoPreviewItem label="Excerpt" value={seoResult.excerpt} onApply={() => applySeoField('excerpt')} />}
                  {seoResult.tags?.length > 0 && (
                    <div className="flex items-center gap-2" data-testid="seo-result-tags">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">{seoResult.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-white/5 border border-gray-700 rounded-full text-gray-300 text-xs">{t}</span>)}</div>
                      </div>
                      <button type="button" onClick={() => applySeoField('tags')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
                    </div>
                  )}
                  {seoResult.seo_keywords && <SeoPreviewItem label="Meta Keywords" value={seoResult.seo_keywords} onApply={() => applySeoField('seo_keywords')} />}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => applySeoField('all')} className="flex-1 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm hover:bg-electric-blue/90" data-testid="seo-apply-all-btn">Apply All</button>
                    <button type="button" onClick={() => setSeoResult(null)} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white">Dismiss</button>
                  </div>
                </div>
              )}

              {/* Google Preview */}
              <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-3">Google Preview</p>
                <p className="text-[#8ab4f8] text-base font-medium truncate">{formData.seo_title || formData.title || 'Post Title'} | Shadow Wolves</p>
                <p className="text-[#bdc1c6] text-xs truncate">shadowwolvesproductions.com.au /blog/{formData.slug || 'post-slug'}</p>
                <p className="text-[#969ba1] text-sm line-clamp-2 mt-0.5">{formData.seo_description || formData.excerpt || 'Description...'}</p>
              </div>

              {/* SEO Title */}
              <Fl label="SEO Title" helper={`${(formData.seo_title || '').length}/60 chars`}>
                <TI value={formData.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Override page title for search engines..." data-testid="input-seo-title" />
                <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                  <div className={`h-1 rounded-full ${(formData.seo_title||'').length>60?'bg-red-500':(formData.seo_title||'').length>=30?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_title||'').length/60)*100,100)}%`}} />
                </div>
              </Fl>

              {/* Meta Description */}
              <Fl label="Meta Description" helper={`${(formData.seo_description || '').length}/160 chars`}>
                <TexA value={formData.seo_description} onChange={e => set('seo_description', e.target.value)} placeholder="Meta description for search engines..." rows={3} />
                <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                  <div className={`h-1 rounded-full ${(formData.seo_description||'').length>160?'bg-red-500':(formData.seo_description||'').length>=100?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_description||'').length/160)*100,100)}%`}} />
                </div>
              </Fl>

              {/* Excerpt */}
              <Fl label="Excerpt" helper="Short summary shown in blog card previews">
                <TexA value={formData.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="1-2 sentence engaging summary..." rows={2} />
              </Fl>

              {/* Meta Keywords */}
              <Fl label="Meta Keywords" helper="Comma-separated (optional)">
                <TI value={formData.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} placeholder="horror, film, production" data-testid="input-seo-keywords" />
              </Fl>

              {/* SEO Checklist */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-800/50 space-y-2">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-2">SEO Checklist</p>
                <SeoCheck ok={(formData.seo_title||'').length>=30&&(formData.seo_title||'').length<=60} label="Title length optimal (30-60)" />
                <SeoCheck ok={(formData.seo_description||'').length>=100&&(formData.seo_description||'').length<=160} label="Description length optimal (100-160)" />
                <SeoCheck ok={!!formData.slug} label="Slug set" />
                <SeoCheck ok={formData.tags?.length>0} label="Tags added" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-800 bg-black/30 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg text-sm" data-testid="save-post-btn">
            {saving ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </div>

      {/* Asset Picker */}
      <AssetPicker isOpen={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} onSelect={handleAssetSelect} assetType="image" title="Select Cover Image" />

      {/* Image Insert Modal */}
      {imageInsertOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setImageInsertOpen(false)}>
          <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()} data-testid="image-insert-modal">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Image size={18} className="text-electric-blue" />
                Insert Image
              </h3>
              <button onClick={() => setImageInsertOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Upload Option */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Upload from device</p>
                <label className="flex items-center justify-center gap-2 px-4 py-6 bg-black border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-electric-blue/50 transition-colors">
                  <Upload size={20} className="text-gray-500" />
                  <span className="text-gray-400">{uploadingImage ? 'Uploading...' : 'Click to upload'}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('source', 'blog');
                    try {
                      const r = await fetch(`${API}/api/upload/image`, { method: 'POST', body: fd });
                      if (r.ok) {
                        const data = await r.json();
                        editor?.chain().focus().setImage({ src: data.url }).run();
                        setImageInsertOpen(false);
                        toast.success('Image inserted');
                      } else {
                        toast.error('Upload failed');
                      }
                    } catch { toast.error('Upload error'); }
                    finally { setUploadingImage(false); }
                  }} />
                </label>
              </div>

              {/* Asset Library */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Or browse from Asset Library</p>
                <button
                  type="button"
                  onClick={() => {
                    setImageInsertOpen(false);
                    setAssetPickerOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue hover:bg-electric-blue/20 transition-all"
                >
                  <FolderOpen size={16} />
                  Browse Asset Library
                </button>
              </div>

              {/* URL Input */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Or enter image URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrl.trim()) {
                        editor?.chain().focus().setImage({ src: imageUrl }).run();
                        setImageUrl('');
                        setImageInsertOpen(false);
                        toast.success('Image inserted');
                      }
                    }}
                    className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate All Overlay */}
      {aiOverlayOpen && aiResult && (
        <AIResultOverlay
          result={aiResult}
          onClose={() => { setAiOverlayOpen(false); setAiResult(null); }}
          onApply={(result, selected) => {
            const updates = {};
            for (const key of selected) {
              if (result[key] !== undefined) updates[key] = result[key];
            }
            setFormData(s => ({ ...s, ...updates }));
            setAiOverlayOpen(false);
            setAiResult(null);
            toast.success('AI content applied');
          }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI RESULT OVERLAY — Generate All preview
   ═══════════════════════════════════════════════════════════════ */

const SECTION_LABELS = {
  title: 'Post Title',
  seo_title: 'SEO Title',
  seo_description: 'Meta Description',
  excerpt: 'Excerpt',
  tags: 'Tags',
  seo_keywords: 'Meta Keywords',
  cta_text: 'CTA Text',
  cta_microcopy: 'CTA Microcopy',
};

const AIResultOverlay = ({ result, onClose, onApply }) => {
  const [selected, setSelected] = useState(() => {
    const s = {};
    Object.keys(result).forEach(k => { if (SECTION_LABELS[k]) s[k] = true; });
    return s;
  });

  const toggle = (key) => setSelected(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" data-testid="ai-overlay">
      <div className="bg-[#111] border border-gray-700 rounded-xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-bold flex items-center gap-2"><Sparkles size={18} className="text-electric-blue" /> Generated Blog Metadata</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-gray-500 text-xs mb-3">Review generated content. Toggle sections to include/exclude, then apply.</p>
          {Object.entries(result).map(([key, value]) => {
            if (!SECTION_LABELS[key]) return null;
            const checked = selected[key] ?? true;
            return (
              <div key={key} className={`rounded-lg border p-3 transition-colors cursor-pointer ${checked ? 'border-electric-blue/40 bg-electric-blue/5' : 'border-gray-800 bg-black/30 opacity-60'}`}
                onClick={() => toggle(key)} data-testid={`ai-section-${key}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-electric-blue border-electric-blue' : 'border-gray-600'}`}>
                    {checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-gray-300 text-xs font-mono uppercase tracking-wider">{SECTION_LABELS[key]}</span>
                </div>
                <p className="text-white text-sm ml-6 line-clamp-2">{Array.isArray(value) ? value.join(' / ') : String(value)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-gray-800">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white">Cancel</button>
          <button type="button" onClick={() => onApply(result, Object.keys(selected).filter(k => selected[k]))}
            className="flex-1 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm hover:bg-electric-blue/90" data-testid="ai-apply-btn">
            Apply Selected ({Object.values(selected).filter(Boolean).length})
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BLOG NEWSLETTER MODAL — Send blog post as newsletter
   ═══════════════════════════════════════════════════════════════ */

const BlogNewsletterModal = ({ post, onClose }) => {
  const [sending, setSending] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [result, setResult] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/newsletter?active_only=true`)
      .then(r => r.ok ? r.json() : []).then(d => setSubscriberCount(d.length)).catch(() => {});
  }, []);

  const siteUrl = window.location.origin;
  const blogUrl = `${siteUrl}/blog/${post.slug}`;
  const coverUrl = post.cover_image_url ? (post.cover_image_url.startsWith('http') ? post.cover_image_url : `${API}${post.cover_image_url}`) : '';
  const excerpt = post.excerpt || post.seo_description || 'Check out our latest blog post.';
  const ctaText = post.cta_text || 'Read Full Story';

  const subject = `New from The Den: ${post.title}`;

  const htmlContent = `
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="color: #233dff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">The Den — New Post</p>
      <h1 style="color: #ffffff; font-size: 28px; line-height: 1.3; margin: 0;">${post.title}</h1>
    </div>
    ${coverUrl ? `<div style="margin: 24px 0;"><img src="${coverUrl}" alt="${post.title}" style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; display: block; margin: 0 auto;" /></div>` : ''}
    <p style="color: #d1d5db; line-height: 1.8; font-size: 16px; margin: 24px 0;">${excerpt}</p>
    ${post.tags?.length ? `<div style="margin: 16px 0;">${post.tags.slice(0, 5).map(t => `<span style="display: inline-block; background: #1a1a2e; color: #9ca3af; padding: 4px 12px; border-radius: 50px; font-size: 12px; margin: 2px 4px;">${t}</span>`).join('')}</div>` : ''}
    <div style="text-align: center; margin: 32px 0;">
      <a href="${blogUrl}" style="display: inline-block; background: #233dff; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${ctaText}</a>
      ${post.cta_microcopy ? `<p style="color: #6b7280; font-size: 12px; margin-top: 12px;">${post.cta_microcopy}</p>` : ''}
    </div>
  `;

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/newsletter/send-bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html_content: htmlContent, test_mode: testMode })
      });
      const data = await r.json();
      if (r.ok) {
        setResult(data);
        if (data.sent > 0) toast.success(`Newsletter sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}`);
        if (data.failed > 0) toast.error(`Failed: ${data.failed}`);
      } else { toast.error(data.detail || 'Failed to send'); }
    } catch { toast.error('Error sending newsletter'); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col" data-testid="newsletter-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Send size={18} className="text-electric-blue" /> Send as Newsletter</h3>
            <p className="text-gray-600 text-xs">{subscriberCount} active subscriber{subscriberCount !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Fl label="Subject" helper="Email subject line">
            <div className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">{subject}</div>
          </Fl>

          {/* Email Preview */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email Preview</label>
            <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-6 max-h-80 overflow-y-auto">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ color: '#233dff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>The Den — New Post</p>
                <h2 style={{ color: '#fff', fontSize: 22, margin: 0 }}>{post.title}</h2>
              </div>
              {coverUrl && <img src={coverUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
              <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: 14 }}>{excerpt}</p>
              {post.tags?.length > 0 && (
                <div style={{ margin: '12px 0' }}>
                  {post.tags.slice(0, 5).map((t, i) => (
                    <span key={i} style={{ display: 'inline-block', background: '#1a1a2e', color: '#9ca3af', padding: '3px 10px', borderRadius: 50, fontSize: 11, margin: '2px 3px' }}>{t}</span>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <span style={{ display: 'inline-block', background: '#233dff', color: '#fff', padding: '12px 32px', borderRadius: 8, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{ctaText}</span>
                {post.cta_microcopy && <p style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>{post.cta_microcopy}</p>}
              </div>
            </div>
          </div>

          {/* Test Mode */}
          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)} className="rounded" />
            <span><span className="text-white">Test Mode</span> — Send to one subscriber first</span>
          </label>

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 border ${result.failed === 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Total: {result.total}</span>
                <span className="text-green-400">Sent: {result.sent}</span>
                {result.failed > 0 && <span className="text-red-400">Failed: {result.failed}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-800 bg-black/30 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
          <button onClick={handleSend} disabled={sending || subscriberCount === 0}
            className="flex items-center gap-2 px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg text-sm" data-testid="send-newsletter-btn">
            {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> {testMode ? 'Send Test' : 'Send Newsletter'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ Shared UI Components ═══ */

const Fl = ({ label, helper, children }) => (
  <div><label className="block text-gray-400 text-sm mb-1">{label}</label>{children}{helper && <p className="text-gray-600 text-xs mt-1">{helper}</p>}</div>
);

const TI = ({ value, onChange, placeholder, ...p }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none" {...p} />
);

const TexA = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm resize-none focus:border-electric-blue focus:outline-none" />
);

const SeoCheck = ({ ok, label }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${ok ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>{ok ? '\u2713' : '\u2013'}</span>
    <span className={ok ? 'text-gray-300' : 'text-gray-500'}>{label}</span>
  </div>
);

const SeoPreviewItem = ({ label, value, onApply }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 min-w-0">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white text-sm truncate">{value}</p>
    </div>
    <button type="button" onClick={onApply} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
  </div>
);

const TagEditor = ({ label, helper, tags, onChange }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim() && !tags.includes(val.trim())) { onChange([...tags, val.trim()]); setVal(''); } };
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {helper && <p className="text-gray-600 text-xs mb-2">{helper}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-white/5 border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
            {tag}<button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder="Add a tag..." />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm">Add</button>
      </div>
    </div>
  );
};

export default AdminBlogTab;
