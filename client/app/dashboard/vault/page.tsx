"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Globe,
  AlertCircle,
  Star,
  Tag,
  Loader2,
} from "lucide-react";
import apiClient from "@/lib/api";

// Aligned with your Mongoose Model
interface PasswordEntry {
  _id: string;
  website: string;
  username: string;
  category: "social" | "work" | "finance" | "shopping" | "other";
  notes?: string;
  url?: string;
  tags: string[];
  isFavorite: boolean;
  lastModified: string;
}

export default function PasswordsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string>("all");
  const [favoriteFilter, setFavoriteFilter] = useState<string>("all");
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Decrypted values state (local only, never stored)
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  // Custom modal state
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [decryptingId, setDecryptingId] = useState<string>("");
  const [masterPasswordInput, setMasterPasswordInput] = useState("");

  const [formData, setFormData] = useState({
    website: "",
    username: "",
    password: "",
    masterPassword: "",
    category: "other",
    url: "",
    notes: "",
    tags: "", // Handled as string then split to array
  });

  useEffect(() => {
    // Check for token before fetching passwords
    const token = apiClient.getToken();
    if (token) {
      fetchPasswords();
    } else {
      console.error("No token found, cannot fetch passwords");
      setError("Authentication required. Please login again.");
      setLoading(false);
    }
  }, []);

  // Debounced Search
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      const timer = setTimeout(() => fetchPasswords(), 400);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Get unique URLs for filter dropdown
  const getUniqueUrls = () => {
    const urls = passwords
      .map((p) => p.url)
      .filter((url) => url && url.trim() !== "")
      .map((url) => {
        // Extract domain from URL
        try {
          const domain = new URL(url!).hostname;
          return domain.replace("www.", "");
        } catch {
          return url;
        }
      });

    return [...new Set(urls)].sort();
  };

  // Filter passwords based on search, URL filter, and favorite filter
  const filteredPasswords = passwords.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrl =
      selectedUrl === "all" ||
      (p.url &&
        (p.url.includes(selectedUrl) ||
          p.url.includes(`www.${selectedUrl}`) ||
          p.url.includes(`https://${selectedUrl}`) ||
          p.url.includes(`http://${selectedUrl}`)));

    const matchesFavorite =
      favoriteFilter === "all" ||
      (favoriteFilter === "favorites" && p.isFavorite) ||
      (favoriteFilter === "non-favorites" && !p.isFavorite);

    return matchesSearch && matchesUrl && matchesFavorite;
  });

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPasswords({ search: searchTerm });
      if (response.success) {
        setPasswords(
          response.data?.passwords || (response as any).passwords || [],
        );
      } else {
        setPasswords([]);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Vault connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
      };

      const response = await apiClient.createPassword(payload);
      if (response.success) {
        setShowAddForm(false);
        setFormData({
          website: "",
          username: "",
          password: "",
          masterPassword: "",
          category: "other",
          url: "",
          notes: "",
          tags: "",
        });
        fetchPasswords();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await apiClient.updatePassword(id, { isFavorite: !current });
      setPasswords((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFavorite: !current } : p)),
      );
    } catch (err) {
      setError("Failed to update favorite status");
    }
  };

  const handleReveal = async (id: string) => {
    if (visibleIds[id]) {
      setVisibleIds((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // Show custom modal instead of browser prompt
    setDecryptingId(id);
    setShowDecryptModal(true);
    setMasterPasswordInput("");
  };

  const handleDecryptSubmit = async () => {
    if (!masterPasswordInput.trim()) {
      setError("Master password is required");
      return;
    }

    try {
      const response = await apiClient.decryptPassword(
        decryptingId,
        masterPasswordInput,
      );
      if (response.success) {
        setDecryptedMap((prev) => ({
          ...prev,
          [decryptingId]:
            response.data?.password || (response as any).password || "",
        }));
        setVisibleIds((prev) => ({ ...prev, [decryptingId]: true }));
        setShowDecryptModal(false);
        setMasterPasswordInput("");
        setDecryptingId("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to decrypt password");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this password?")) return;

    try {
      await apiClient.deletePassword(id);
      setPasswords((prev) => prev.filter((p) => p._id !== id));
      // Clean up decrypted and visible state for this ID
      setDecryptedMap((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setVisibleIds((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete password");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have one
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Vault
          </h1>
          <p className="text-slate-500 text-sm">Your encrypted credentials</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search website, username, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium text-slate-700"
            >
              <option value="all">All URLs</option>
              {getUniqueUrls().map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </select>
            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={favoriteFilter}
              onChange={(e) => setFavoriteFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium text-slate-700"
            >
              <option value="all">All Items</option>
              <option value="favorites">Favorites</option>
              <option value="non-favorites">Non-Favorites</option>
            </select>
            <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Modern Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-[2rem] border border-blue-100 shadow-2xl shadow-blue-900/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Secure New Entry</h2>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black uppercase">
              AES-256 Enabled
            </span>
          </div>
          <form
            onSubmit={handleCreate}
            className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Website/App Name *
              </label>
              <input
                required
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                placeholder="e.g. Amazon"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                URL
              </label>
              <input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none"
              >
                <option value="social">Social</option>
                <option value="work">Work</option>
                <option value="finance">Finance</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Username/Email *
              </label>
              <input
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password *
              </label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider text-blue-600">
                Master Password *
              </label>
              <input
                required
                type="password"
                value={formData.masterPassword}
                onChange={(e) =>
                  setFormData({ ...formData, masterPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50/30 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="lg:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Additional notes or security questions..."
              />
            </div>
            <div className="lg:col-span-3 flex justify-end gap-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 font-bold text-sm"
              >
                Discard
              </button>
              <button
                disabled={submitting}
                type="submit"
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Encrypt & Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Vault Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-slate-400 text-sm font-medium">
              Unlocking your vault...
            </p>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Your vault is empty
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
              Start securing your digital life by adding your first password.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="pl-8 pr-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    Service
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    Account
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    Category
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    Password
                  </th>
                  <th className="pl-4 pr-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPasswords.map((p) => (
                  <tr
                    key={p._id}
                    className="group hover:bg-slate-50/80 transition-all duration-200"
                  >
                    {/* Service Column */}
                    <td className="pl-8 pr-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden bg-slate-50">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${p.url || p.website}&sz=64`}
                            alt={`${p.website} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "none";
                            }}
                          />
                          <div
                            className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-black shrink-0
                              ${
                                p.category === "finance"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : p.category === "work"
                                    ? "bg-purple-50 text-purple-600"
                                    : p.category === "social"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-slate-100 text-slate-600"
                              }
                            `}
                          >
                            {p.website[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {p.website}
                            </span>
                            {p.isFavorite && (
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          {p.url && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {p.url.replace("https://", "")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Account Column */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {p.username}
                      </span>
                    </td>

                    {/* Category Column */}
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border
                  ${
                    p.category === "finance"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : p.category === "work"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : p.category === "social"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                  }
                `}
                      >
                        {p.category}
                      </span>
                    </td>

                    {/* Password Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm tracking-tighter">
                          {visibleIds[p._id] ? (
                            <span className="text-blue-600 font-bold animate-in fade-in slide-in-from-left-2">
                              {decryptedMap[p._id]}
                            </span>
                          ) : (
                            <span className="text-slate-300">••••••••••••</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="pl-4 pr-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFavorite(p._id, p.isFavorite)}
                          className={`p-2 rounded-lg transition-colors ${p.isFavorite ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:bg-slate-100"}`}
                        >
                          <Star
                            className={`w-4 h-4 ${p.isFavorite ? "fill-current" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => handleReveal(p._id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {visibleIds[p._id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(p.username)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Decrypt Modal */}
      {showDecryptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Enter Master Password
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your master password is required to decrypt this password
              securely.
            </p>
            <input
              type="password"
              value={masterPasswordInput}
              onChange={(e) => setMasterPasswordInput(e.target.value)}
              placeholder="Enter your master password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleDecryptSubmit();
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDecryptModal(false);
                  setMasterPasswordInput("");
                  setDecryptingId("");
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDecryptSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
