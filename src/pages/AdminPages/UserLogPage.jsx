/**
 * UserLogPage Component
 * 
 * An administrative component that displays user activity logs with comprehensive
 * information and management capabilities. Implements localStorage-based log storage
 * and retrieval with delete functionality for administrators.
 * 
 * Features:
 * - Displays user logs with login time, logout time, JWT token, username, role, IP address
 * - Provides delete functionality for individual log entries
 * - Implements sorting and filtering capabilities
 * - Includes responsive design for all screen sizes
 * - Supports accessibility with proper ARIA attributes
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FaTrash, FaSpinner, FaExclamationTriangle, FaUserShield, FaSort, FaFilter } from 'react-icons/fa';
import { fetchUserLogs, deleteUserLog } from '../../api';

const UserLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'loginTime',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    role: 'all',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetchUserLogs(token);
        
        if (response.error) {
          setError(response.error);
        } else {
          setLogs(response);
          setFilteredLogs(response);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading user logs:', err);
        setError('Failed to load user logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredLogs(sortedLogs);
  };

  const applyFilters = (newFilters) => {
    let result = [...logs];
    
    if (newFilters.role !== 'all') {
      result = result.filter(log => log.role === newFilters.role);
    }
    
    if (newFilters.search.trim()) {
      const searchTerm = newFilters.search.toLowerCase().trim();
      result = result.filter(log => 
        log.username.toLowerCase().includes(searchTerm) || 
        log.userId.toLowerCase().includes(searchTerm) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm))
      );
    }
    
    result.sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredLogs(result);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  const handleDelete = async (logId) => {
    if (deleteConfirm !== logId) {
      setDeleteConfirm(logId);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await deleteUserLog(logId, token);
      
      if (response.error) {
        setError(response.error);
      } else {
        const updatedLogs = logs.filter(log => log._id !== logId);
        setLogs(updatedLogs);
        setFilteredLogs(filteredLogs.filter(log => log._id !== logId));
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      setError('Failed to delete log. Please try again.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" aria-live="polite" role="status">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" aria-hidden="true" />
        <span className="ml-2">Loading user logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center" aria-live="assertive" role="alert">
        <FaExclamationTriangle className="mr-2" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <FaUserShield className="mr-2" aria-hidden="true" />
        User Activity Logs
      </h2>
      
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
        <div className="md:flex-1">
          <label htmlFor="log-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Logs
          </label>
          <input
            id="log-search"
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search by username, user ID, or IP"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            aria-label="Search logs"
          />
        </div>
        
        <div className="md:w-48">
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Role
          </label>
          <select
            id="role-filter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            aria-label="Filter logs by role"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center">
                  Username
                  <FaSort className="ml-1" aria-hidden="true" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  Role
                  <FaSort className="ml-1" aria-hidden="true" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('loginTime')}
              >
                <div className="flex items-center">
                  Login Time
                  <FaSort className="ml-1" aria-hidden="true" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('logoutTime')}
              >
                <div className="flex items-center">
                  Logout Time
                  <FaSort className="ml-1" aria-hidden="true" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Token
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                IP Address
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No logs match your filters
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.username}</div>
                    <div className="text-xs text-gray-500">{log.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.loginTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.logoutTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono">{log.tokenName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {deleteConfirm === log._id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Confirm delete log for ${log.username}`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="Cancel delete"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete log for ${log.username}`}
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserLogPage;