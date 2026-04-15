import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Building, Save, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const StudioAccount = () => {
  const { user, checkAuth } = useOutletContext();
  
  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      investor: 'Investor',
      sales_agent: 'Sales Agent',
      director: 'Director',
      producer: 'Producer',
      executive_producer: 'Executive Producer',
      cast: 'Cast',
      crew: 'Crew',
      talent_manager: 'Talent Manager',
      other: 'Other'
    };
    return labels[role] || role;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('studio_token');
    setSavingProfile(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/me?full_name=${encodeURIComponent(fullName)}&company=${encodeURIComponent(company)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        toast.success('Profile updated successfully');
        checkAuth(); // Refresh user data
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const token = localStorage.getItem('studio_token');
    setSavingPassword(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/change-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
          })
        }
      );
      
      if (response.ok) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to change password');
      }
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl" data-testid="studio-account">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white font-display mb-2">Account Settings</h1>
        <p className="text-swp-white-ghost">Manage your profile and security settings</p>
      </motion.div>

      {/* Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-swp-surface border border-swp-border rounded-swp p-6 mb-6"
      >
        <h2 className="text-xs font-mono uppercase tracking-widest text-swp-ice mb-4 flex items-center gap-2">
          <User size={16} />
          Profile Information
        </h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-900 border border-swp-border rounded-swp pl-11 pr-4 py-3 text-swp-white-ghost/70 cursor-not-allowed"
              />
            </div>
            <p className="text-swp-white-ghost/50 text-xs mt-1">Email cannot be changed</p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Role
            </label>
            <div className="px-4 py-3 bg-gray-900 border border-swp-border rounded-swp">
              <span className="text-white">{getRoleLabel(user?.role)}</span>
            </div>
            <p className="text-swp-white-ghost/50 text-xs mt-1">Contact admin to change your role</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-swp-black border border-swp-border rounded-swp pl-11 pr-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-swp-black border border-swp-border rounded-swp pl-11 pr-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder="Your company (optional)"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 bg-swp-ice hover:bg-swp-ice disabled:bg-swp-muted 
                       text-white px-6 py-3 rounded-sm font-mono text-sm uppercase tracking-widest transition-all"
          >
            {savingProfile ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Profile
              </>
            )}
          </button>
        </form>
      </motion.section>

      {/* Password Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-swp-surface border border-swp-border rounded-swp p-6"
      >
        <h2 className="text-xs font-mono uppercase tracking-widest text-swp-ice mb-4 flex items-center gap-2">
          <Lock size={16} />
          Change Password
        </h2>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-swp-black border border-swp-border rounded-swp pl-11 pr-11 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70 hover:text-swp-white"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-swp-black border border-swp-border rounded-swp pl-11 pr-11 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70 hover:text-swp-white"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-swp-white-ghost/50 text-xs mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-swp-white-ghost/70" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-swp-black border border-swp-border rounded-swp pl-11 pr-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {/* Change Password Button */}
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 bg-swp-ice hover:bg-swp-ice disabled:bg-swp-muted 
                       text-white px-6 py-3 rounded-sm font-mono text-sm uppercase tracking-widest transition-all"
          >
            {savingPassword ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Lock size={16} />
                Change Password
              </>
            )}
          </button>
        </form>
      </motion.section>
    </div>
  );
};

export default StudioAccount;
