<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <svg class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      配置信息
    </h2>

    <!-- 配置列表 -->
    <div class="space-y-4">
      <div v-if="configs.length === 0" class="text-center py-12 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p class="text-sm">加载配置中...</p>
      </div>

      <!-- 按分类显示配置项 - 折叠面板 -->
      <div v-for="category in configCategories" :key="category.name" class="border border-gray-200 rounded-lg overflow-hidden">
        <!-- 折叠面板标题 - 可点击展开/收起 -->
        <button
            @click="toggleCategory(category.name)"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        >
          <div class="flex items-center gap-3">
            <component :is="getCategoryIcon(category.icon)" class="w-5 h-5 flex-shrink-0" :class="category.color" />
            <h3 class="text-sm font-semibold text-gray-700">{{ category.name }}</h3>
            <span class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
              {{ getConfigsByCategory(category.keys).length }} 项
            </span>
          </div>
          <svg
              class="w-5 h-5 text-gray-400 transition-transform duration-200"
              :class="expandedCategories[category.name] ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- 折叠面板内容 - 可展开/收起 -->
        <transition
            name="collapse"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
        >
          <div v-show="expandedCategories[category.name]" class="overflow-hidden">
            <div class="p-4 space-y-2 bg-white">
              <div
                  v-for="config in getConfigsByCategory(category.keys)"
                  :key="config.key"
                  class="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200"
              >
                <div class="space-y-3">
                  <!-- 配置项标签和描述 -->
                  <div>
                    <span class="text-sm font-medium text-gray-700">{{ getConfigLabel(config.key) }}</span>
                    <div v-if="getConfigDescription(config.key)" class="text-xs text-gray-500 mt-0.5">
                      {{ getConfigDescription(config.key) }}
                    </div>
                  </div>

                  <!-- 配置项值和操作 -->
                  <div>
                    <!-- 布尔类型配置项:显示开关 -->
                    <div v-if="isBooleanConfig(config.key)" class="flex items-center justify-between gap-3">
                      <span class="text-sm font-medium" :class="getBooleanValue(config.value) ? 'text-green-600' : 'text-gray-500'">
                        {{ getBooleanValue(config.value) ? '已开启' : '已关闭' }}
                      </span>
                      <button
                          @click="toggleBoolean(config.key, config.value)"
                          :disabled="loading.config"
                          class="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          :class="getBooleanValue(config.value) ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'"
                      >
                        <span
                            class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md"
                            :class="getBooleanValue(config.value) ? 'translate-x-6' : 'translate-x-1'"
                        ></span>
                      </button>
                    </div>

                    <!-- 普通配置项:显示编辑按钮 -->
                    <div v-else>
                      <!-- 显示模式 -->
                      <div v-if="!editingKey || editingKey !== config.key" class="flex items-center gap-2">
                        <div class="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors overflow-x-auto">
                          <span class="text-sm text-gray-900 whitespace-nowrap font-mono" :class="config.value === '*****' ? 'text-gray-400' : ''">
                            {{ maskSensitiveValue(config.key, config.value) }}
                          </span>
                        </div>
                        <button
                            @click="startEdit(config.key, config.value)"
                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow flex items-center justify-center gap-2"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          编辑
                        </button>
                      </div>

                      <!-- 编辑模式 -->
                      <div v-else>
                        <div class="relative mb-2">
                          <textarea
                              v-model="editingValue"
                              rows="3"
                              class="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono resize-y"
                              :placeholder="`输入新的 ${getConfigLabel(config.key)}`"
                              @keydown.enter.ctrl="saveConfig(config.key)"
                              @keydown.enter.meta="saveConfig(config.key)"
                              ref="editInput"
                          ></textarea>
                          <div class="hidden sm:block absolute right-3 bottom-3 text-xs text-gray-400 pointer-events-none">
                            <span>Ctrl+Enter 保存 / Esc 取消</span>
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button
                              @click="saveConfig(config.key)"
                              :disabled="loading.config"
                              class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <svg v-if="!loading.config" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {{ loading.config ? '保存中...' : '保存' }}
                          </button>
                          <button
                              @click="cancelEdit"
                              :disabled="loading.config"
                              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 刷新配置按钮 -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <button
          @click="loadConfigs"
          :disabled="loading.refresh"
          class="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 transition-all duration-200 flex items-center justify-center text-sm shadow-sm hover:shadow"
      >
        <svg
            class="w-5 h-5 mr-2 flex-shrink-0"
            :class="loading.refresh ? 'animate-spin' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading.refresh ? '加载中...' : '刷新配置' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, h } from 'vue';
import { getConfigs, updateConfig } from '../composables/admin';

const emit = defineEmits(['toast']);

// 配置分类
const configCategories = [
  {
    name: '基础设置',
    icon: 'server',
    color: 'text-blue-500',
    keys: ['PORT', 'MONGODB_URI', 'DEFAULT_TIMEZONE_OFFSET', 'SECRET']
  },
  {
    name: 'AI 配置',
    icon: 'brain',
    color: 'text-purple-500',
    keys: [ 'AI_SUMMARY_ENABLED', 'AI_API_URL', 'AI_API_KEY', 'AI_MODEL', 'AI_MAX_TOKENS']
  },
  {
    name: 'AI总结发布配置',
    icon: 'upload',
    color: 'text-green-500',
    keys: ['PUBLISH_ENABLED', 'PUBLISH_API_URL', 'PUBLISH_API_KEY']
  },
  {
    name: '网站功能',
    icon: 'toggle',
    color: 'text-orange-500',
    keys: ['WEB_DEVICE_COUNT', 'WEB_COMMENT']
  }
];

// 折叠状态管理 - 默认全部收起
const expandedCategories = reactive({
  '基础设置': false,
  'AI 配置': false,
  'AI总结发布配置': false,
  '网站功能': false
});

// 切换分类展开/收起
const toggleCategory = (categoryName) => {
  expandedCategories[categoryName] = !expandedCategories[categoryName];
};

// 折叠动画钩子
const onEnter = (el) => {
  el.style.height = '0';
  el.style.overflow = 'hidden';
};

const onAfterEnter = (el) => {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
};

const onLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';
  // 强制重绘
  el.offsetHeight;
  el.style.height = '0';
};

// 所有配置项的键(按分类顺序)
const displayAllowedKeys = [
  'PORT', 'MONGODB_URI', 'DEFAULT_TIMEZONE_OFFSET', 'SECRET',
  'AI_API_URL', 'AI_API_KEY', 'AI_MODEL', 'AI_MAX_TOKENS', 'AI_SUMMARY_ENABLED',
  'PUBLISH_ENABLED', 'PUBLISH_API_URL', 'PUBLISH_API_KEY',
  'WEB_DEVICE_COUNT', 'WEB_COMMENT'
];

// 布尔类型的配置键
const booleanConfigKeys = ['AI_SUMMARY_ENABLED', 'WEB_DEVICE_COUNT', 'WEB_COMMENT', 'PUBLISH_ENABLED'];

// 配置项标签
const configLabels = {
  PORT: '端口',
  MONGODB_URI: 'MongoDB 连接地址',
  DEFAULT_TIMEZONE_OFFSET: '默认时区偏移',
  SECRET: '密钥',
  AI_API_URL: 'AI API 地址',
  AI_API_KEY: 'AI API 密钥',
  AI_MODEL: 'AI 模型',
  AI_MAX_TOKENS: 'AI 最大 Token 数',
  AI_SUMMARY_ENABLED: 'AI 总结总开关',
  PUBLISH_ENABLED: '发布开关',
  PUBLISH_API_URL: '发布 API 地址',
  PUBLISH_API_KEY: '发布 API 密钥',
  WEB_DEVICE_COUNT: '显示设备数量',
  WEB_COMMENT: '启用评论功能'
};

// 配置项描述
const configDescriptions = {
  PORT: '服务运行的端口号',
  MONGODB_URI: 'MongoDB 数据库连接字符串',
  DEFAULT_TIMEZONE_OFFSET: '默认时区偏移量(小时)',
  SECRET: '用于加密的密钥',
  AI_API_URL: 'AI 服务的 API 地址',
  AI_API_KEY: 'AI 服务的认证密钥',
  AI_MODEL: '使用的 AI 模型名称',
  AI_MAX_TOKENS: 'AI 生成内容的最大 Token 数量',
  AI_SUMMARY_ENABLED: '是否启用 AI 自动总结功能',
  PUBLISH_ENABLED: '发布总结',
  PUBLISH_API_URL: '内容发布的 API 地址',
  PUBLISH_API_KEY: '内容发布的认证密钥',
  WEB_DEVICE_COUNT: '是否在网站显示设备数量统计',
  WEB_COMMENT: '是否启用网站评论功能'
};

const configs = ref([]);
const editingKey = ref(null);
const editingValue = ref('');
const editInput = ref(null);
const loading = reactive({
  refresh: false,
  config: false
});

const getCategoryIcon = (iconName) => {
  const icons = {
    server: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
      })
    ]),
    brain: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
      })
    ]),
    upload: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
      })
    ]),
    toggle: () => h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
      })
    ])
  };
  return icons[iconName] || icons.server;
};

const getConfigLabel = (key) => {
  return configLabels[key] || key;
};

const getConfigDescription = (key) => {
  return configDescriptions[key] || '';
};

const getConfigsByCategory = (keys) => {
  return configs.value.filter(config => keys.includes(config.key));
};

const maskSensitiveValue = (key, value) => {
  if (!value || value === '') return '(未设置)';
  if (value === '*****') return '*****';
  return value;
};

const isBooleanConfig = (key) => {
  return booleanConfigKeys.includes(key);
};

const getBooleanValue = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'on';
  }
  return !!value;
};

const toggleBoolean = async (key, currentValue) => {
  const currentBoolean = getBooleanValue(currentValue);
  const newValue = !currentBoolean;

  loading.config = true;
  try {
    await updateConfig({ [key]: String(newValue) });

    const configIndex = configs.value.findIndex(c => c.key === key);
    if (configIndex !== -1) {
      configs.value[configIndex].value = String(newValue);
    }

    emit('toast', `${getConfigLabel(key)} 已${newValue ? '开启' : '关闭'}`, 'success');
  } catch (error) {
    console.error('更新配置失败:', error);
    emit('toast', error.response?.data?.message || '更新配置失败', 'error');
  } finally {
    loading.config = false;
  }
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
      configList = Object.keys(configObj).map(key => ({
        key: key,
        value: configObj[key]
      }));
    }

    if (!Array.isArray(configList)) {
      configList = [];
    }

    const configMap = new Map();
    configList.forEach(config => {
      if (config && config.key) {
        configMap.set(config.key, config.value);
      }
    });

    configs.value = displayAllowedKeys.map(key => ({
      key: key,
      value: configMap.has(key) ? (configMap.get(key) || '') : '*****'
    }));

    emit('toast', '配置已加载', 'success');
  } catch (error) {
    console.error('加载配置失败:', error);
    emit('toast', error.response?.data?.message || '加载配置失败', 'error');
  } finally {
    loading.refresh = false;
  }
};

const startEdit = async (key, value) => {
  editingKey.value = key;
  editingValue.value = value === '*****' ? '' : value;
  await nextTick();
  if (editInput.value) {
    editInput.value.focus();
  }
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

<style scoped>
/* 折叠动画 */
.collapse-leave-active {
  transition: height 0.3s ease-in-out;
}

</style>