const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const getMetaConfig = () => {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const wabaId = process.env.META_WA_BUSINESS_ACCOUNT_ID;
  const version = process.env.META_GRAPH_VERSION || 'v19.0';
  
  if (!token || !wabaId) {
    throw new Error('Missing Meta WABA ID or Access Token in .env');
  }
  
  return {
    url: `https://graph.facebook.com/${version}/${wabaId}/message_templates`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const createTemplateOnMeta = async (name, language, category, components) => {
  const config = getMetaConfig();
  
  // Ensure all components (BODY & HEADER) have proper example data required by Meta
  const processedComponents = await Promise.all((components || []).map(async (c) => {
    if (c.type === 'BODY' && c.text) {
      const varMatches = c.text.match(/\{\{(\d+)\}\}/g);
      if (varMatches && varMatches.length > 0 && (!c.example || !c.example.body_text)) {
        return {
          ...c,
          example: {
            body_text: [varMatches.map((_, idx) => `Customer ${idx + 1}`)]
          }
        };
      }
    }

    if (c.type === 'HEADER') {
      if (c.format === 'TEXT' && c.text) {
        const varMatches = c.text.match(/\{\{(\d+)\}\}/g);
        if (varMatches && varMatches.length > 0 && (!c.example || !c.example.header_text)) {
          return {
            ...c,
            example: {
              header_text: varMatches.map((_, idx) => `Header ${idx + 1}`)
            }
          };
        }
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
        const hasHandle = c.example && Array.isArray(c.example.header_handle) && c.example.header_handle.length > 0 && c.example.header_handle[0];
        if (!hasHandle) {
          try {
            // Generate a real Meta upload handle using a sample PNG buffer
            const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
            const tempPath = path.join(__dirname, `../uploads/sample_header_${Date.now()}.png`);
            fs.writeFileSync(tempPath, dummyPng);
            const autoHandle = await uploadMediaToMeta(tempPath, 'image/png', dummyPng.length);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            return {
              ...c,
              example: {
                header_handle: [autoHandle]
              }
            };
          } catch (handleErr) {
            console.error('❌ Failed to generate auto header_handle:', handleErr.message);
          }
        }
      }
    }
    return c;
  }));

  const payload = {
    name,
    language,
    category,
    components: processedComponents
  };

  try {
    const response = await axios.post(config.url, payload, { headers: config.headers });
    return response.data; 
  } catch (error) {
    const errData = error.response?.data?.error;
    console.error('❌ [WA] Meta Template Creation Error:', JSON.stringify(errData || error.message, null, 2));
    throw error;
  }
};

const fetchAllTemplatesFromMeta = async () => {
  const config = getMetaConfig();
  try {
    const response = await axios.get(config.url, {
      headers: config.headers,
      params: { limit: 100 }
    });
    return response.data?.data || [];
  } catch (error) {
    const errData = error.response?.data?.error;
    console.error('❌ [WA] Meta Fetch All Templates Error:', JSON.stringify(errData || error.message, null, 2));
    throw error;
  }
};

const getTemplateStatusFromMeta = async (templateId) => {
    const config = getMetaConfig();
    const version = process.env.META_GRAPH_VERSION || 'v19.0';
    try {
        const response = await axios.get(`https://graph.facebook.com/${version}/${templateId}`, { headers: config.headers });
        return response.data;
    } catch (error) {
        console.error('❌ [WA] Meta Template Status Error:', error.response?.data || error.message);
        throw error;
    }
}

const uploadMediaToMeta = async (filePath, mimeType, size) => {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_VERSION || 'v19.0';
  
  if (!token) throw new Error('Missing Meta Access Token in .env');

  try {
    // 1. Create upload session
    const sessionRes = await axios.post(`https://graph.facebook.com/${version}/app/uploads`, null, {
      params: { file_length: size, file_type: mimeType },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sessionId = sessionRes.data.id;
    if (!sessionId) throw new Error('Failed to create upload session');

    // 2. Upload file
    const fileStream = fs.createReadStream(filePath);
    const uploadRes = await axios.post(`https://graph.facebook.com/${version}/${sessionId}`, fileStream, {
      headers: {
        Authorization: `OAuth ${token}`,
        file_offset: 0
      }
    });

    return uploadRes.data.h; // The handle
  } catch (error) {
    console.error('❌ [WA] Meta Resumable Upload Error:', error.response?.data || error.message);
    throw error;
  }
};

const uploadMediaForSending = async (filePath, mimeType) => {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const phoneId = process.env.META_WA_PHONE_NUMBER_ID;
  const version = process.env.META_GRAPH_VERSION || 'v19.0';
  
  if (!token || !phoneId) throw new Error('Missing Meta Access Token or Phone ID in .env');

  try {
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', fs.createReadStream(filePath), { contentType: mimeType });

    const url = `https://graph.facebook.com/${version}/${phoneId}/media`;
    
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.id;
  } catch (error) {
    console.error('❌ [WA] Meta Media Upload Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a template on Meta WhatsApp Cloud API by name or hsm_id
 */
const deleteTemplateFromMeta = async (name, metaTemplateId) => {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const wabaId = process.env.META_WA_BUSINESS_ACCOUNT_ID;
  const version = process.env.META_GRAPH_VERSION || 'v19.0';

  if (!token || !wabaId) throw new Error('Missing Meta Access Token or WABA ID');

  try {
    const url = `https://graph.facebook.com/${version}/${wabaId}/message_templates`;
    const params = { name };
    if (metaTemplateId && !metaTemplateId.startsWith('local_')) {
      params.hsm_id = metaTemplateId;
    }
    const response = await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  } catch (error) {
    console.error('❌ [WA] Delete Meta Template Error:', error.response?.data || error.message);
    if (metaTemplateId && !metaTemplateId.startsWith('local_')) {
      try {
        const response2 = await axios.delete(`https://graph.facebook.com/${version}/${metaTemplateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response2.data;
      } catch (err2) {
        console.error('❌ [WA] Delete Meta Template by ID Error:', err2.response?.data || err2.message);
        throw error;
      }
    }
    throw error;
  }
};

/**
 * Edit / Update an existing template on Meta WhatsApp Cloud API
 */
const updateTemplateOnMeta = async (metaTemplateId, name, category, components) => {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_VERSION || 'v19.0';

  if (!token) throw new Error('Missing Meta Access Token');

  const processedComponents = await Promise.all((components || []).map(async (c) => {
    if (c.type === 'BODY' && c.text) {
      const varMatches = c.text.match(/\{\{(\d+)\}\}/g);
      if (varMatches && varMatches.length > 0 && (!c.example || !c.example.body_text)) {
        return {
          ...c,
          example: {
            body_text: [varMatches.map((_, idx) => `Customer ${idx + 1}`)]
          }
        };
      }
    }
    if (c.type === 'HEADER') {
      if (c.format === 'TEXT' && c.text) {
        const varMatches = c.text.match(/\{\{(\d+)\}\}/g);
        if (varMatches && varMatches.length > 0 && (!c.example || !c.example.header_text)) {
          return {
            ...c,
            example: {
              header_text: varMatches.map((_, idx) => `Header ${idx + 1}`)
            }
          };
        }
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
        const hasHandle = c.example && Array.isArray(c.example.header_handle) && c.example.header_handle.length > 0 && c.example.header_handle[0];
        if (!hasHandle) {
          try {
            const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
            const tempPath = path.join(__dirname, `../uploads/sample_header_${Date.now()}.png`);
            fs.writeFileSync(tempPath, dummyPng);
            const autoHandle = await uploadMediaToMeta(tempPath, 'image/png', dummyPng.length);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            return {
              ...c,
              example: {
                header_handle: [autoHandle]
              }
            };
          } catch (handleErr) {
            console.error('❌ Failed to generate auto header_handle:', handleErr.message);
          }
        }
      }
    }
    return c;
  }));

  const payload = {
    components: processedComponents
  };
  if (category) payload.category = category;

  try {
    if (metaTemplateId && !metaTemplateId.startsWith('local_')) {
      const response = await axios.post(`https://graph.facebook.com/${version}/${metaTemplateId}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } else {
      return await createTemplateOnMeta(name, 'en_US', category || 'MARKETING', processedComponents);
    }
  } catch (error) {
    console.error('❌ [WA] Update Meta Template Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  createTemplateOnMeta,
  getTemplateStatusFromMeta,
  uploadMediaToMeta,
  uploadMediaForSending,
  fetchAllTemplatesFromMeta,
  deleteTemplateFromMeta,
  updateTemplateOnMeta
};
