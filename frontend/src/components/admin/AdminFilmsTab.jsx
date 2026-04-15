import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, StarOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilmModal from '../AdminFilmModal';

const AdminFilmsTab = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);

  const fetchFilms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (response.ok) {
        const data = await response.json();
        setFilms(data);
      }
    } catch (err) {
      toast.error('Failed to load films');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleAddFilm = () => {
    setEditingFilm(null);
    setIsModalOpen(true);
  };

  const handleEditFilm = (film) => {
    setEditingFilm(film);
    setIsModalOpen(true);
  };

  const handleDeleteFilm = async (film) => {
    if (!window.confirm(`Are you sure you want to delete "${film.title}"?`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films/${film.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Film deleted successfully');
        fetchFilms();
      } else {
        toast.error('Failed to delete film');
      }
    } catch (err) {
      toast.error('Error deleting film');
    }
  };

  const handleToggleFeatured = async (film) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films/${film.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !film.featured })
      });
      if (response.ok) {
        toast.success(film.featured ? 'Removed from featured' : 'Added to featured');
        fetchFilms();
      }
    } catch (err) {
      toast.error('Error updating film');
    }
  };

  const handleSaveFilm = async (filmData) => {
    try {
      const url = editingFilm
        ? `${process.env.REACT_APP_BACKEND_URL}/api/films/${editingFilm.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/films`;
      
      const response = await fetch(url, {
        method: editingFilm ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filmData)
      });

      if (response.ok) {
        toast.success(editingFilm ? 'Film updated successfully' : 'Film created successfully');
        setIsModalOpen(false);
        fetchFilms();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save film');
      }
    } catch (err) {
      toast.error('Error saving film');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Released': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'Marketing':
      case 'Post-Production':
      case 'Filming': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Films</h2>
          <p className="text-swp-white-ghost/70 text-sm mt-1">{films.length} total films</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchFilms}
            className="p-2 text-swp-white-ghost hover:text-swp-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleAddFilm}
            className="flex items-center gap-2 bg-swp-ice hover:bg-swp-ice text-white px-6 py-3 rounded-sm font-mono text-sm uppercase tracking-widest transition-all"
          >
            <Plus size={18} />
            Add Film
          </button>
        </div>
      </div>

      {/* Films Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-swp-ice animate-spin mx-auto mb-4" />
          <p className="text-swp-white-ghost/70">Loading films...</p>
        </div>
      ) : films.length === 0 ? (
        <div className="text-center py-12 bg-swp-surface border border-swp-border rounded-swp">
          <p className="text-swp-white-ghost mb-4">No films yet</p>
          <button onClick={handleAddFilm} className="text-swp-ice hover:underline">
            Add your first film
          </button>
        </div>
      ) : (
        <div className="bg-swp-surface border border-swp-border rounded-swp overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-swp-border">
                <th className="text-left px-6 py-4 text-swp-white-ghost font-mono text-xs uppercase tracking-widest">Film</th>
                <th className="text-left px-6 py-4 text-swp-white-ghost font-mono text-xs uppercase tracking-widest">Status</th>
                <th className="text-center px-6 py-4 text-swp-white-ghost font-mono text-xs uppercase tracking-widest">Featured</th>
                <th className="text-right px-6 py-4 text-swp-white-ghost font-mono text-xs uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {films.map((film) => (
                <tr key={film.id} className="border-b border-swp-border/50 hover:bg-swp-deep/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800"
                        style={{ backgroundColor: film.poster_color || '#1a1a2e' }}
                      >
                        {film.poster_url && (
                          <img src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`} alt={film.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{film.title}</h3>
                        <p className="text-swp-white-ghost/70 text-sm line-clamp-1">{film.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-sm text-xs font-mono uppercase border ${getStatusColor(film.status)}`}>
                      {film.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(film)}
                      className={`p-2 rounded-sm transition-colors ${film.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-swp-white-ghost/50 hover:text-swp-white-ghost'}`}
                      title={film.featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {film.featured ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditFilm(film)}
                        className="p-2 text-swp-white-ghost hover:text-swp-ice transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteFilm(film)}
                        className="p-2 text-swp-white-ghost hover:text-red-400 transition-colors"
                        title="Delete"
                      >
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

      {/* Film Modal */}
      <AdminFilmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFilm}
        film={editingFilm}
      />
    </div>
  );
};

export default AdminFilmsTab;
