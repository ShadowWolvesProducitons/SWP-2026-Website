import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, X, Upload, Image, Eye, EyeOff, 
         Bold, Italic, Underline, List, ListOrdered, Quote, Code, Link as LinkIcon, 
         AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Highlighter } from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';

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

// Tiptap Menu Bar Component
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const btnClass = (isActive) => `p-2 rounded transition-colors ${
    isActive ? 'bg-electric-blue/30 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/10'
  }`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700 bg-gray-900/50">
      {/* Headings */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        <Heading3 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Text Formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
        <Bold size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
        <Italic size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
        <Underline size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight">
        <Highlighter size={18} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Lists */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Alignment */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <AlignLeft size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <AlignCenter size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <AlignRight size={18} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Block Elements */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Quote">
        <Quote size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code Block">
        <Code size={18} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      {/* Link & Image */}
      <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))} title="Add Link">
        <LinkIcon size={18} />
      </button>
      <button type="button" onClick={addImage} className={btnClass(false)} title="Add Image">
        <Image size={18} />
      </button>
    </div>
  );
};

// Blog Post Modal Component
const BlogPostModal = ({ isOpen, onClose, onSave, post }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image_url: '',
    content: '',
    tags: [],
    status: 'Draft'
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-electric-blue underline' }
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg' }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        HTMLAttributes: { class: 'bg-yellow-500/30 px-1 rounded' }
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none'
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
        status: post.status || 'Draft'
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
        status: 'Draft'
      });
      if (editor) {
        editor.commands.setContent('');
      }
    }
    setTagInput('');
  }, [post, isOpen, editor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title' && !post) {
      const slug = value.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, cover_image_url: data.url }));
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
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {post ? 'Edit Post' : 'New Post'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
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

          {/* Slug */}
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

          {/* Status */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Status</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                formData.status === 'Draft' ? 'bg-black border-electric-blue text-white' : 'bg-black border-gray-700 text-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Draft"
                  checked={formData.status === 'Draft'}
                  onChange={handleChange}
                  className="hidden"
                />
                <EyeOff size={16} />
                Draft
              </label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                formData.status === 'Published' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black border-gray-700 text-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Published"
                  checked={formData.status === 'Published'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Eye size={16} />
                Published
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Cover Image</label>
            <div className="flex gap-4 items-start">
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                {formData.cover_image_url ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.cover_image_url}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Image size={24} className="text-gray-600" />
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                <Upload size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
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
              placeholder="Short summary for previews and SEO (optional)"
            />
          </div>

          {/* Content - Tiptap Rich Text Editor */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Content</label>
            <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
              <MenuBar editor={editor} />
              <div className="tiptap-editor-container">
                <EditorContent editor={editor} className="min-h-[300px]" />
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">Use the toolbar above to format your content with headings, lists, images, and more.</p>
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

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest" data-testid="save-post-btn">
              {saving ? 'Saving...' : (formData.status === 'Published' ? 'Publish' : 'Save Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogTab;
