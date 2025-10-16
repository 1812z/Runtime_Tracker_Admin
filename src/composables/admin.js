import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        const baseURL = localStorage.getItem('api_base_url');
        if (baseURL) {
            config.baseURL = baseURL;
        }

        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = (credentials) => {
    return apiClient.post('/admin/login', credentials);
};

export const getAIStatus = () => {
    return apiClient.get('/api/ai/status');
};

export const startAI = () => {
    return apiClient.post('/admin/ai/start');
};

export const stopAI = () => {
    return apiClient.post('/admin/ai/stop');
};

export const getAllSummaries = () => {
    return apiClient.get('/api/ai/summaries');
};

export const getSummary = (deviceId) => {
    return apiClient.get(`/api/ai/summary/${deviceId}`);
};

export const triggerSummary = (deviceId, data = {}) => {
    return apiClient.post(`/admin/ai/trigger/${deviceId}`, data);
};

export const getDevicesList = () => {
    return apiClient.get(`/api/devices`);
};

export const restart = () => {
    return apiClient.post('/admin/restart');
};

export const getConfigs = () => {
    return apiClient.get('/admin/config');
};

export const updateConfig = (configData) => {
    return apiClient.post('/admin/config', configData);
};

export const updateAccount = (data) => {
    return apiClient.post('/admin/account/update', data);
};

export default apiClient;