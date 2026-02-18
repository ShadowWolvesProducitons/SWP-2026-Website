import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Edit2, RotateCcw, Mail, Eye, X, Save, Plus,
  Bold, Italic, Underline, List, ListOrdered, Quote, 
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Undo, Redo, Code
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminEmailTemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/email-templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template) => {
    setEditingTemplate(template);
  };

  const handleReset = async (templateName) => {
    if (!window.confirm('Reset this template to default? Your customizations will be lost.')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/email-templates/reset/${templateName}`, {
        method: 'POST'
      });
      if (response.ok) {
        toast.success('Template reset to default');
        fetchTemplates();
      }
    } catch (err) {
      toast.error('Failed to reset template');
    }
  };

  const handlePreview = (template) => {
    // Wrap in email base template
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
        ${template.html_content}
      </div>
    `;
    setPreviewHtml(fullHtml);
  };

  const handleSave = async (templateId, subject, htmlContent) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/email-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html_content: htmlContent })
      });
      
      if (response.ok) {
        toast.success('Template saved');
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error('Failed to save template');
      }
    } catch (err) {
      toast.error('Error saving template');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="text-electric-blue" />
            Email Templates
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize email notifications sent by the system
          </p>
        </div>
        <button 
          onClick={fetchTemplates} 
          className="p-2 text-gray-400 hover:text-white transition-colors" 
          title="Refresh"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="bg-smoke-gray border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{template.display_name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{template.description}</p>
                  <p className="text-gray-600 text-xs mt-2 font-mono">
                    Subject: <span className="text-gray-400">{template.subject}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                    title="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleReset(template.name)}
                    className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                    title="Reset to Default"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSave}
        />
      )}

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-100 px-4 py-3 flex items-center justify-between border-b">
              <h3 className="font-semibold text-gray-800">Email Preview</h3>
              <button onClick={() => setPreviewHtml(null)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div 
              className="p-0"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};


// Template Editor Modal with Tiptap
const TemplateEditorModal = ({ template, onClose, onSave }) => {
  const [subject, setSubject] = useState(template.subject);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { style: 'color: #233dff;' }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: template.html_content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
        style: 'font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff;'
      }
    }
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    await onSave(template.id, subject, editor.getHTML());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit: {template.display_name}</h2>
            <p className="text-gray-500 text-sm mt-1">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Variables Help */}
          <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Available Variables:</strong> Use {'{{variable_name}}'} syntax. 
              Variables are replaced with actual values when the email is sent.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
            />
          </div>

          {/* HTML Content Editor */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Email Content (HTML)
            </label>
            <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
              <EmailEditorMenuBar editor={editor} />
              <div className="email-editor-container" style={{ background: '#0a0a0a' }}>
                <EditorContent editor={editor} />
              </div>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Content is wrapped in a styled email container. Use inline styles for best email client compatibility.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-smoke-gray border-t border-gray-800 px-6 py-4 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};


// Email Editor Menu Bar
const EmailEditorMenuBar = ({ editor }) => {
  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = (isActive) => `p-1.5 rounded transition-colors ${
    isActive ? 'bg-electric-blue/30 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/10'
  }`;

  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-700 bg-gray-900/50">
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="Undo">
        <Undo size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="Redo">
        <Redo size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        <Heading3 size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
        <Bold size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
        <Italic size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <AlignLeft size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <AlignCenter size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <AlignRight size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Quote">
        <Quote size={16} />
      </button>
      <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))} title="Add Link">
        <LinkIcon size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code">
        <Code size={16} />
      </button>
    </div>
  );
};

export default AdminEmailTemplatesTab;
