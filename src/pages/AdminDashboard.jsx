import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPotholes, setSelectedPotholes] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    const payload = JSON.parse(atob(token.split('.')[1]));
    setCurrentUser(payload.user);
    if (payload.user.role !== 'admin') { navigate("/map"); return; }
    fetchDashboardData();
  }, [navigate, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, usersRes, potholesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/potholes")
      ]);
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPotholes(Array.isArray(potholesRes.data.potholes) ? potholesRes.data.potholes : []);
      setSelectedPotholes(new Set());
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handlePromote = async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/promote`, {});
      alert(`✅ ${response.data.message}`);
      fetchUsers();
    } catch (err) {
      console.error('Error promoting user:', err);
      alert('❌ Failed to promote user');
    }
  };

  const handleDemote = async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/demote`, {});
      alert(`✅ ${response.data.message}`);
      fetchUsers();
    } catch (err) {
      console.error('Error demoting user:', err);
      alert('❌ Failed to demote user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account!');
      return;
    }
    if (!window.confirm(`🚨 PERMANENT DELETE\n\nAre you sure you want to delete user "${username}"?\n\nThis will:\n• Permanently delete the user account\n• Delete all their pothole reports\n• This action cannot be undone!`)) return;
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      alert(`✅ ${response.data.message}\nDeleted ${response.data.deletedPotholesCount} pothole reports.`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const deletePothole = async (potholeId) => {
    if (!window.confirm("Are you sure you want to delete this pothole report?")) return;
    try {
      await api.delete(`/admin/potholes/${potholeId}`);
      alert("✅ Pothole deleted successfully");
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting pothole:', err);
      alert('❌ Failed to delete pothole');
    }
  };

  const updatePotholeStatus = async (potholeId, status, notes = "") => {
    try {
      const response = await api.patch(`/admin/potholes/${potholeId}/status`, {
        status,
        resolutionNotes: notes
      });
      alert(`✅ Status updated to: ${status}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('❌ Failed to update status');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedPotholes.size === 0) {
      alert("Please select potholes and choose a status");
      return;
    }
    if (!window.confirm(`Update ${selectedPotholes.size} potholes to "${bulkStatus}"?`)) return;
    try {
      const response = await api.patch("/admin/potholes/bulk-status", {
        potholeIds: Array.from(selectedPotholes),
        status: bulkStatus,
        resolutionNotes
      });
      alert(`✅ ${response.data.message}`);
      setBulkStatus("");
      setResolutionNotes("");
      setSelectedPotholes(new Set());
      fetchDashboardData();
    } catch (err) {
      console.error('Error bulk updating:', err);
      alert('❌ Failed to update potholes');
    }
  };

  const togglePotholeSelection = (potholeId) => {
    const newSelection = new Set(selectedPotholes);
    if (newSelection.has(potholeId)) { newSelection.delete(potholeId); }
    else { newSelection.add(potholeId); }
    setSelectedPotholes(newSelection);
  };

  const selectAllPotholes = () => {
    if (selectedPotholes.size === potholes.length) { setSelectedPotholes(new Set()); }
    else { setSelectedPotholes(new Set(potholes.map(p => p._id))); }
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-blue-100 text-blue-800 border-blue-200",
      under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-orange-100 text-orange-800 border-orange-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      reported: "Reported", under_review: "Under Review",
      in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected"
    };
    return texts[status] || status;
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, potholes, and system statistics</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            <p className="text-sm text-blue-700">Total Users</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</p>
            <p className="text-sm text-purple-700">Admins</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalPotholes}</p>
            <p className="text-sm text-green-700">Total Potholes</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.verificationRate}%</p>
            <p className="text-sm text-orange-700">AI Verified</p>
          </div>
        </div>
      )}

      {selectedPotholes.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3">
            Bulk Actions ({selectedPotholes.size} potholes selected)
          </h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="border rounded px-3 py-2">
                <option value="">Select Status</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes (Optional)</label>
              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes for resolution..."
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <button onClick={handleBulkStatusUpdate} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Apply to Selected
            </button>
            <button onClick={() => setSelectedPotholes(new Set())} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Pothole Management</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{potholes.length} potholes</span>
            <button onClick={selectAllPotholes} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
              {selectedPotholes.size === potholes.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2 md:hidden">← Scroll to see more</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-8">
                  <input type="checkbox" checked={selectedPotholes.size === potholes.length && potholes.length > 0} onChange={selectAllPotholes} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reported By</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">AI Confidence</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {potholes.map((pothole) => (
                <tr key={pothole._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedPotholes.has(pothole._id)} onChange={() => togglePotholeSelection(pothole._id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div>Lat: {pothole.latitude?.toFixed(6)}</div>
                      <div>Lng: {pothole.longitude?.toFixed(6)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{pothole.reportedBy?.username || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    {pothole.ai_confidence ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pothole.ai_confidence > 0.8 ? 'bg-green-100 text-green-800 border border-green-200'
                        : pothole.ai_confidence > 0.6 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {(pothole.ai_confidence * 100).toFixed(1)}%
                      </span>
                    ) : <span className="text-gray-400 text-xs">N/A</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(pothole.status)}`}>
                      {getStatusText(pothole.status)}
                    </span>
                    {pothole.resolvedAt && (
                      <div className="text-xs text-gray-500 mt-1">{new Date(pothole.resolvedAt).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(pothole.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => updatePotholeStatus(pothole._id, 'under_review')} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600">Review</button>
                      <button onClick={() => updatePotholeStatus(pothole._id, 'in_progress')} className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600">In Progress</button>
                      <button onClick={() => updatePotholeStatus(pothole._id, 'resolved', 'Fixed by maintenance team.')} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Resolve</button>
                      <button onClick={() => updatePotholeStatus(pothole._id, 'rejected', 'False positive')} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Reject</button>
                      <button onClick={() => deletePothole(pothole._id)} className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Users Management</h2>
        <p className="text-xs text-gray-400 mb-2 md:hidden">← Scroll to see more</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {user.role === 'user' ? (
                      <button onClick={() => handlePromote(user._id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Promote</button>
                    ) : (
                      <button onClick={() => handleDemote(user._id)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Demote</button>
                    )}
                    <button onClick={() => handleDeleteUser(user._id, user.username)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" disabled={user._id === currentUser?.id}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}