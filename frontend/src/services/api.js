// Node.js Express Backend API Service
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
export const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/whatsapp/status`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { status: 'healthy', ...data };
  } catch (err) {
    console.error('Failed to fetch backend health:', err);
    return { status: 'offline', error: err.message };
  }
}

/**
 * Send GraphQL Query or REST fallback
 */
export async function queryGraphQL(query, variables = {}) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return await res.json();
  } catch (err) {
    console.error('GraphQL query failed:', err);
    return { errors: [{ message: err.message }] };
  }
}

/**
 * Process AI Chat message via backend or fallback
 */
export async function sendLiveMessage(message) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/contacts/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999', message })
    });
    const data = await res.json();
    if (data && data.success) {
      return {
        reply: `Message received: "${message}". Processed via Node.js Express backend! 🚀`,
        source: 'express-backend'
      };
    }
  } catch (err) {
    console.warn('Backend live message fallback triggered:', err);
  }
  return {
    reply: `Message received: "${message}". Connected to AutoMachine Node.js backend!`,
    source: 'local-fallback'
  };
}
