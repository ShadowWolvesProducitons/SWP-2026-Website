import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, RefreshCw, X, Upload, Image, Eye, EyeOff, 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, 
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Heading4, Highlighter, Subscript, Superscript,
  Minus, Undo, Redo, Search, Youtube, Sparkles, FolderOpen, Loader2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';
import AssetPicker from './AssetPicker';
import Highlight from '@tiptap/extension-highlight';
import TiptapYoutube from '@tiptap/extension-youtube';

const AdminBlogTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Are you sure you want to archive "${post.title}"?`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${post.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Post archived');
        fetchPosts();
      }
    } catch (err) {
      toast.error('Error archiving post');
    }
  };

  const handleSavePost = async (postData) => {
    try {
      const url = editingPost
        ? `${process.env.REACT_APP_BACKEND_URL}/api/blog/${editingPost.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/blog`;
      
      const response = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        toast.success(editingPost ? 'Post updated' : 'Post created');
        setIsModalOpen(false);
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save');
      }
    } catch (err) {
      toast.error('Error saving post');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">The Den (Blog)</h2>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchPosts} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleAddPost}
            className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
            data-testid="new-post-btn"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">No posts yet</p>
          <button onClick={handleAddPost} className="text-electric-blue hover:underline">
            Create your first post
          </button>
        </div>
      ) : (
        <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Title</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Published</th>
                <th className="text-right px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-800/50 hover:bg-black/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <h3 className="text-white font-semibold">{post.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-1">{post.excerpt || post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase border ${
                      post.status === 'Published'
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                    }`}>
                      {post.status === 'Published' ? <Eye size={12} /> : <EyeOff size={12} />}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(post.published_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditPost(post)} className="p-2 text-gray-400 hover:text-electric-blue transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeletePost(post)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Archive">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Post Modal */}
      <BlogPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        post={editingPost}
      />
    </div>
  );
};

// Enhanced Tiptap Menu Bar Component
const MenuBar = ({ editor }) => {
  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube video URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const btnClass = (isActive) => `p-1.5 rounded transition-colors ${
    isActive ? 'bg-electric-blue/30 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/10'
  }`;

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-700 bg-gray-900/50">
      {/* Undo/Redo */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="Undo">
        <Undo size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="Redo">
        <Redo size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Headings */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        <Heading3 size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={btnClass(editor.isActive('heading', { level: 4 }))} title="Heading 4">
        <Heading4 size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Text Formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
        <Bold size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
        <Italic size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
        <Underline size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Strikethrough">
        <Strikethrough size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight">
        <Highlighter size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Lists */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Alignment */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <AlignLeft size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <AlignCenter size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <AlignRight size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btnClass(editor.isActive({ textAlign: 'justify' }))} title="Justify">
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Block Elements */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Quote">
        <Quote size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code Block">
        <Code size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule">
        <Minus size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Media & Links */}
      <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))} title="Add/Edit Link">
        <LinkIcon size={16} />
      </button>
      <button type="button" onClick={addImage} className={btnClass(false)} title="Add Image">
        <Image size={16} />
      </button>
      <button type="button" onClick={addYoutubeVideo} className={btnClass(editor.isActive('youtube'))} title="Add YouTube Video">
        <Youtube size={16} />
      </button>
    </div>
  );
};

// Blog Post Modal Component
const BlogPostModal = ({ isOpen, onClose, onSave, post }) => {
  const [activeTab, setActiveTab] = useState('content'); // content, seo
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image_url: '',
    content: '',
    tags: [],
    status: 'Draft',
    // SEO fields
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    og_image_url: '',
    no_index: false
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerField, setAssetPickerField] = useState(null);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoResult, setSeoResult] = useState(null);

  const openAssetPicker = (field) => {
    setAssetPickerField(field);
    setAssetPickerOpen(true);
  };

  const handleAssetSelect = (url) => {
    if (assetPickerField) {
      setFormData(prev => ({ ...prev, [assetPickerField]: url }));
      toast.success('Image selected');
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-electric-blue underline' }
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        HTMLAttributes: { class: 'bg-yellow-500/30 px-1 rounded' }
      }),
      TiptapYoutube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: 'my-4 rounded-lg overflow-hidden' }
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none'
      }
    }
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        cover_image_url: post.cover_image_url || '',
        content: post.content || '',
        tags: post.tags || [],
        status: post.status || 'Draft',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        seo_keywords: post.seo_keywords || '',
        canonical_url: post.canonical_url || '',
        og_image_url: post.og_image_url || '',
        no_index: post.no_index || false
      });
      if (editor) {
        editor.commands.setContent(post.content || '');
      }
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        cover_image_url: '',
        content: '',
        tags: [],
        status: 'Draft',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        canonical_url: '',
        og_image_url: '',
        no_index: false
      });
      if (editor) {
        editor.commands.setContent('');
      }
    }
    setTagInput('');
    setActiveTab('content');
  }, [post, isOpen, editor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Auto-generate slug from title
    if (name === 'title' && !post) {
      const slug = value.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e, field = 'cover_image_url') => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('source', 'blog');
    formDataUpload.append('tags', `blog,${field},${formData.title ? formData.title.slice(0, 20) : 'post'}`);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, [field]: data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      toast.error('Error uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAICover = async () => {
    if (!formData.title.trim()) {
      toast.error('Please add a title first');
      return;
    }

    setGeneratingAI(true);
    toast.info('Generating cover image... This may take up to a minute.');

    try {
      const content = editor ? editor.getHTML() : formData.content;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generate-cover-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: content,
          tags: formData.tags,
          excerpt: formData.excerpt
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, cover_image_url: data.image_url }));
        toast.success('AI cover image generated!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to generate image');
      }
    } catch (err) {
      toast.error('Error generating AI image');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateSEO = async () => {
    const content = editor ? editor.getHTML() : formData.content;
    if (!formData.title.trim() && !content.trim()) {
      toast.error('Please add a title or content first');
      return;
    }
    setSeoGenerating(true);
    setSeoResult(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generate-blog-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: content,
          tags: formData.tags,
          excerpt: formData.excerpt
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSeoResult(data);
        toast.success('SEO content generated! Review and apply below.');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to generate SEO');
      }
    } catch (err) {
      toast.error('Error generating SEO content');
    } finally {
      setSeoGenerating(false);
    }
  };

  const applySeoField = (field) => {
    if (!seoResult) return;
    const updates = {};
    if (field === 'all') {
      if (seoResult.seo_title) updates.seo_title = seoResult.seo_title;
      if (seoResult.seo_description) updates.seo_description = seoResult.seo_description;
      if (seoResult.excerpt) updates.excerpt = seoResult.excerpt;
      if (seoResult.tags) updates.tags = seoResult.tags;
      if (seoResult.seo_keywords) updates.seo_keywords = seoResult.seo_keywords;
      setSeoResult(null);
    } else {
      updates[field] = seoResult[field];
    }
    setFormData(prev => ({ ...prev, ...updates }));
    toast.success(field === 'all' ? 'All SEO fields applied' : `${field} applied`);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    const content = editor ? editor.getHTML() : formData.content;
    
    setSaving(true);
    await onSave({ ...formData, content });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">
              {post ? 'Edit Post' : 'New Post'}
            </h2>
            {/* Tab Switcher */}
            <div className="flex bg-black rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  activeTab === 'content' ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${
                  activeTab === 'seo' ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Search size={14} />
                SEO
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="p-6 space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    placeholder="Post title"
                    data-testid="post-title-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Slug</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/blog/</span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                      placeholder="post-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Status</label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.status === 'Draft' ? 'bg-black border-electric-blue text-white' : 'bg-black border-gray-700 text-gray-400'
                    }`}>
                      <input type="radio" name="status" value="Draft" checked={formData.status === 'Draft'} onChange={handleChange} className="hidden" />
                      <EyeOff size={16} /> Draft
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.status === 'Published' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black border-gray-700 text-gray-400'
                    }`}>
                      <input type="radio" name="status" value="Published" checked={formData.status === 'Published'} onChange={handleChange} className="hidden" />
                      <Eye size={16} /> Published
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Cover Image</label>
                  <div className="flex gap-3 items-start flex-wrap">
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                      {formData.cover_image_url ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.cover_image_url}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Image size={20} className="text-gray-600" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                      <Upload size={16} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} className="hidden" disabled={uploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => openAssetPicker('cover_image_url')}
                      className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20"
                    >
                      <FolderOpen size={16} /> Browse
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAICover}
                      disabled={generatingAI || !formData.title.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-electric-blue rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Generate cover image with AI"
                      data-testid="ai-cover-btn"
                    >
                      {generatingAI ? (
                        <RefreshCw size={16} className="text-white animate-spin" />
                      ) : (
                        <Sparkles size={16} className="text-white" />
                      )}
                      <span className="text-white text-sm font-medium">{generatingAI ? 'Generating...' : 'AI'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
                  placeholder="Short summary for previews (optional)"
                />
              </div>

              {/* Content - Tiptap Rich Text Editor */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Content</label>
                <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
                  <MenuBar editor={editor} />
                  <div className="tiptap-editor-container">
                    <EditorContent editor={editor} className="min-h-[400px]" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none text-sm"
                    placeholder="Add a tag"
                  />
                  <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg">
                    <Plus size={18} />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-black border border-gray-700 rounded-full text-gray-300 text-sm">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="p-6 space-y-6">
              {/* AI Generate SEO Button */}
              <button
                type="button"
                onClick={handleGenerateSEO}
                disabled={seoGenerating || (!formData.title.trim())}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:from-electric-blue/20 hover:to-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="ai-generate-seo-btn"
              >
                {seoGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {seoGenerating ? 'Generating SEO...' : 'Generate SEO from Content'}
              </button>

              {/* AI Result Preview */}
              {seoResult && (
                <div className="bg-electric-blue/5 border border-electric-blue/20 rounded-lg p-4 space-y-3" data-testid="blog-seo-result-preview">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <Sparkles size={14} className="text-electric-blue" /> AI-Generated SEO
                  </p>
                  {seoResult.seo_title && (
                    <div className="flex items-center gap-2" data-testid="seo-result-title">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">SEO Title</p>
                        <p className="text-white text-sm truncate">{seoResult.seo_title}</p>
                      </div>
                      <button type="button" onClick={() => applySeoField('seo_title')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10">Apply</button>
                    </div>
                  )}
                  {seoResult.seo_description && (
                    <div className="flex items-center gap-2" data-testid="seo-result-description">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Meta Description</p>
                        <p className="text-white text-sm line-clamp-2">{seoResult.seo_description}</p>
                      </div>
                      <button type="button" onClick={() => applySeoField('seo_description')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
                    </div>
                  )}
                  {seoResult.excerpt && (
                    <div className="flex items-center gap-2" data-testid="seo-result-excerpt">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Excerpt</p>
                        <p className="text-white text-sm line-clamp-2">{seoResult.excerpt}</p>
                      </div>
                      <button type="button" onClick={() => applySeoField('excerpt')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
                    </div>
                  )}
                  {seoResult.tags && seoResult.tags.length > 0 && (
                    <div className="flex items-center gap-2" data-testid="seo-result-tags">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {seoResult.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/5 border border-gray-700 rounded-full text-gray-300 text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={() => applySeoField('tags')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
                    </div>
                  )}
                  {seoResult.seo_keywords && (
                    <div className="flex items-center gap-2" data-testid="seo-result-keywords">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs">Meta Keywords</p>
                        <p className="text-white text-sm truncate">{seoResult.seo_keywords}</p>
                      </div>
                      <button type="button" onClick={() => applySeoField('seo_keywords')} className="px-3 py-1 text-electric-blue text-xs border border-electric-blue/30 rounded hover:bg-electric-blue/10 flex-shrink-0">Apply</button>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => applySeoField('all')} className="flex-1 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm hover:bg-electric-blue/90" data-testid="seo-apply-all-btn">
                      Apply All
                    </button>
                    <button type="button" onClick={() => setSeoResult(null)} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* SEO Preview */}
              <div className="bg-black/50 border border-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Search size={16} className="text-electric-blue" />
                  Google Preview
                </h3>
                <div className="space-y-1">
                  <p className="text-[#8ab4f8] text-lg truncate">
                    {formData.seo_title || formData.title || 'Page Title'}
                  </p>
                  <p className="text-[#bdc1c6] text-sm truncate">
                    shadowwolvesproductions.com.au/blog/{formData.slug || 'post-slug'}
                  </p>
                  <p className="text-[#969ba1] text-sm line-clamp-2">
                    {formData.seo_description || formData.excerpt || 'Add a meta description to improve search visibility...'}
                  </p>
                </div>
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  SEO Title <span className="text-gray-600">(max 60 chars recommended)</span>
                </label>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  placeholder={formData.title || 'Custom SEO title (optional)'}
                />
                <p className="text-gray-600 text-xs mt-1">{(formData.seo_title || formData.title || '').length}/60 characters</p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Meta Description <span className="text-gray-600">(max 160 chars recommended)</span>
                </label>
                <textarea
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
                  placeholder={formData.excerpt || 'Description for search engines (optional)'}
                />
                <p className="text-gray-600 text-xs mt-1">{(formData.seo_description || formData.excerpt || '').length}/160 characters</p>
              </div>

              {/* Meta Keywords */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Meta Keywords <span className="text-gray-600">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  placeholder="horror, film, production, shadow wolves"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Canonical URL <span className="text-gray-600">(if content exists elsewhere)</span>
                </label>
                <input
                  type="url"
                  name="canonical_url"
                  value={formData.canonical_url}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Social Share Image <span className="text-gray-600">(Open Graph)</span>
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                    {(formData.og_image_url || formData.cover_image_url) ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${formData.og_image_url || formData.cover_image_url}`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Image size={24} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                      <Upload size={16} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">Upload Custom</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'og_image_url')} className="hidden" />
                    </label>
                    <p className="text-gray-600 text-xs mt-2">Defaults to cover image if not set</p>
                  </div>
                </div>
              </div>

              {/* No Index */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="no_index"
                  checked={formData.no_index}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
                />
                <div>
                  <label className="text-white">Prevent search engine indexing</label>
                  <p className="text-gray-600 text-xs">Add noindex meta tag to this post</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="sticky bottom-0 bg-smoke-gray border-t border-gray-800 px-6 py-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest" data-testid="save-post-btn">
              {saving ? 'Saving...' : (formData.status === 'Published' ? 'Publish' : 'Save Draft')}
            </button>
          </div>
        </form>
      </div>

      {/* Asset Picker for Cover Image */}
      <AssetPicker 
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={handleAssetSelect}
        assetType="image"
        title="Select Cover Image"
      />
    </div>
  );
};

export default AdminBlogTab;
