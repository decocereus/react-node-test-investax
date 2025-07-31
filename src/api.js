// const API_URL = "https://zidio-task-management-backend.onrender.com/api";
const API_URL = "http://localhost:5001/api";

export const fetchTasks = async () => {
  const response = await fetch(API_URL);
  return await response.json();
};

export const createTask = async (task) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return await response.json();
};

export const deleteTask = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return await response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return await response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await response.json();
};

export const logout = async (token) => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return await response.json();
};

export const fetchUserLogs = async (token) => {
  const response = await fetch(`${API_URL}/logs`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return await response.json();
};

export const deleteUserLog = async (logId, token) => {
  const response = await fetch(`${API_URL}/logs/${logId}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return await response.json();
};