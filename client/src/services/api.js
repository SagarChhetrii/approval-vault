const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function headers() {
  const t = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function req(method, path, body) {
  const opts = { method, headers: headers() };
  if (body instanceof FormData) {
    const t = localStorage.getItem("token");
    opts.headers = t ? { Authorization: `Bearer ${t}` } : {};
    opts.body = body;
  } else if (body) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

export const login          = (email, password)    => req("POST", "/auth/login",  { email, password });
export const register       = (name, email, password, role) => req("POST", "/auth/register", { name, email, password, role });
export const getUsers       = ()                   => req("GET",  "/auth/users");
export const getProjects    = ()                   => req("GET",  "/projects");
export const getProject     = (id)                 => req("GET",  `/projects/${id}`);
export const createProject  = (title, clientId)   => req("POST", "/projects", { title, clientId });
export const getVersions    = (id)                 => req("GET",  `/projects/${id}/versions`);
export const uploadFile     = (id, fd)             => req("POST", `/projects/${id}/upload`, fd);
export const addComment     = (vid, text)          => req("POST", `/versions/${vid}/comment`, { text });
export const getComments    = (vid)                => req("GET",  `/versions/${vid}/comments`);
export const approveVersion = (vid)                => req("POST", `/versions/${vid}/approve`);
export const requestChanges = (id)                 => req("POST", `/projects/${id}/request-changes`);
export const getAuditLog    = (id)                 => req("GET",  `/projects/${id}/audit`);
export const getApproval    = (vid)                => req("GET",  `/versions/${vid}/approval`);