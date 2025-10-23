<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      配置信息
    </h2>
    <!-- 配置列表 -->
    <div class="space-y-3 text-sm mb-6">
      <div v-if="configs.length === 0" class="text-center py-8 text-gray-500">
        <p>加载配置中...</p>
      </div>
      <div v-for="config in configs" :key="config.key" class="border-b border-gray-100 py-2">
        <div class="flex items-start gap-2 min-w-0">
          <span class="text-gray-600 font-medium flex-shrink-0 pt-1">{{ getConfigLabel(config.key) }}</span>
          <div class="flex-1 min-w-0 flex items-start justify-end gap-2">
            <div v-if="!editingKey || editingKey !== config.key" class="flex items-center gap-2 min-w-0">
              <span class="text-gray-900 font-medium text-right break-all">
                {{ maskSensitiveValue(config.key, config.value) }}
              </span>
              <button
                  @click="startEdit(config.key, config.value)"
                  class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                编辑
              </button>
            </div>
            <div v-else class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <input
                  v-model="editingValue"
                  type="text"
                  class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                  :placeholder="`输入新 ${getConfigLabel(config.key)}`"
                  @keyup.enter="saveConfig(config.key)"
                  @keyup.escape="cancelEdit"
              >
              <div class="flex gap-2 flex-shrink-0">
                <button
                    @click="saveConfig(config.key)"
                    :disabled="loading.config"
                    class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
                <button
                    @click="cancelEdit"
                    :disabled="loading.config"
                    class="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 刷新配置按钮 -->
    <button
        @click="loadConfigs"
        :disabled="loading.refresh"
        class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center text-sm"
    >
      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ loading.refresh ? '加载中...' : '刷新配置' }}
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getConfigs, updateConfig } from '../composables/admin';

const emit = defineEmits(['toast']);

// 只显示白名单的配置项
const displayAllowedKeys = [
  'PORT',
  'MONGODB_URI',
  'ADMIN_PASSWD',
  'JWT_SECRET',
  'SECRET',
  'AI_API_URL',
  'AI_API_KEY',
  'AI_MODEL',
  'AI_MAX_TOKENS',
  'PUBLISH_API_URL',
  'PUBLISH_API_KEY',
  'DEFAULT_TIMEZONE_OFFSET',
  'AI_SUMMARY_ENABLED',
  'WEB_DEVICE_COUNT',
  'WEB_COMMENT'
];

const configLabels = {
  'PORT': '端口号',
  'MONGODB_URI': 'MongoDB 地址',
  'ADMIN_USER': '管理员用户名',
  'ADMIN_PASSWD': '管理员密码',
  'JWT_SECRET': 'JWT 密钥',
  'SECRET': '应用密钥',
  'AI_API_URL': 'AI API 地址',
  'AI_API_KEY': 'AI API 密钥',
  'AI_MODEL': 'AI 模型',
  'AI_MAX_TOKENS': 'AI 最大令牌数',
  'PUBLISH_API_URL': '发布 API 地址',
  'PUBLISH_API_KEY': '发布 API 密钥',
  'DEFAULT_TIMEZONE_OFFSET': '默认时区偏移',
  'AI_SUMMARY_ENABLED': 'AI 摘要启用',
  'WEB_DEVICE_COUNT': '设备数显示',
  'WEB_COMMENT': '评论显示'
};

const configs = ref([]);
const editingKey = ref(null);
const editingValue = ref('');

const loading = reactive({
  config: false,
  refresh: false
});

const getConfigLabel = (key) => {
  return configLabels[key] || key;
};

const maskSensitiveValue = (key, value) => {
  if (!value) return '(未设置)';
  return value;
};

const loadConfigs = async () => {
  loading.refresh = true;
  try {
    const response = await getConfigs();
    let configList = [];

    if (Array.isArray(response)) {
      configList = response;
    } else if (response && typeof response === 'object') {
      const configObj = response.config || response.data || {};
      // 将对象转换为数组格式
      configList = Object.keys(configObj).map(key => ({
        key: key,
        value: configObj[key]
      }));
    }

    if (!Array.isArray(configList)) {
      configList = [];
    }

    configs.value = configList
        .filter(config => config && config.key && displayAllowedKeys.includes(config.key))
        .map(config => ({
          key: config.key,
          value: config.value || ''
        }));
    emit('toast', '配置已加载', 'success');
  } catch (error) {
    console.error('加载配置失败:', error);
    emit('toast', error.response?.data?.message || '加载配置失败', 'error');
  } finally {
    loading.refresh = false;
  }
};

const startEdit = (key, value) => {
  editingKey.value = key;
  editingValue.value = value;
};

const cancelEdit = () => {
  editingKey.value = null;
  editingValue.value = '';
};

const saveConfig = async (key) => {
  if (!editingValue.value.trim()) {
    emit('toast', '配置值不能为空', 'error');
    return;
  }

  loading.config = true;
  try {
    // 发送单个配置项的对象
    await updateConfig({ [key]: editingValue.value });

    const configIndex = configs.value.findIndex(c => c.key === key);
    if (configIndex !== -1) {
      configs.value[configIndex].value = editingValue.value;
    }

    emit('toast', `${getConfigLabel(key)} 已更新`, 'success');
    editingKey.value = null;
    editingValue.value = '';
  } catch (error) {
    console.error('更新配置失败:', error);
    emit('toast', error.response?.data?.message || '更新配置失败', 'error');
  } finally {
    loading.config = false;
  }
};

onMounted(() => {
  loadConfigs();
});
</script>