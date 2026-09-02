// Live Backend API Service connecting to Render Deployment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://crm-fee1.onrender.com';
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'https://crm-fee1.onrender.com/graphql';
export const WS_URL = import.meta.env.VITE_WS_URL || 'wss://crm-fee1.onrender.com/ws';

/**
 * Check backend health status from Render
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch backend health:', err);
    return { status: 'offline', error: err.message };
  }
}

/**
 * Send Strawberry GraphQL Query to live Render Backend
 */
export async function queryGraphQL(query, variables = {}) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const graphqlQuery = `
      mutation {
        echoMessage(message: "${message.replace(/"/g, '\\"')}")
      }
    `;
    const data = await queryGraphQL(graphqlQuery);
    if (data?.data?.echoMessage) {
      return {
        reply: data.data.echoMessage,
        source: 'render-backend'
      };
    }
  } catch (err) {
    console.warn('Backend chat fallback triggered:', err);
  }
  return null;
}
