<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          设备列表
        </h2>
        <button
            @click="loadDevices"
            :disabled="loading"
            class="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div class="p-6">
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 mt-3">加载中...</p>
      </div>

      <div v-else-if="!devices || devices.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500">暂无设备数据</p>
      </div>

      <div v-else class="space-y-4">
        <div
            v-for="device in devices"
            :key="device.device"
            class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
        >


          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                device.running ? 'bg-green-100' : 'bg-gray-100'
              ]">
                <svg class="w-5 h-5" :class="device.running ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="flex flex-row items-center gap-3.5">
                  <h3 class="font-semibold text-gray-900">{{ device.device }}</h3>
                  <div v-if="device.batteryLevel > 0" class="flex items-center">
                    <div class="relative">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4.5 w-7"
                          viewBox="0 0 24 12"
                          fill="none"
                      >
                        <!-- 电池外壳 -->
                        <rect
                            x="0.5"
                            y="0.5"
                            width="18"
                            height="11"
                            rx="3"
                            :stroke="getBatteryColor(device.batteryLevel, device.isCharging)"
                            stroke-width="1"
                            fill="white"
                            class="dark:fill-[#181a1b]"
                        />
                        <!-- 电池电量填充 (动态宽度) -->
                        <rect
                            x="2"
                            y="2"
                            :width="(device.batteryLevel / 100) * 14"
                            height="8"
                            rx="2"
                            :fill="getBatteryColor(device.batteryLevel, device.isCharging)"
                            :class="{'battery-charging': device.isCharging}"
                        />
                        <!-- 电池正极 -->
                        <rect
                            x="19"
                            y="3.5"
                            width="2"
                            height="5"
                            rx="1"
                            :fill="getBatteryColor(device.batteryLevel, device.isCharging)"
                        />
                      </svg>
                      <!-- 充电图标叠加 -->
                      <svg
                          v-if="device.isCharging"
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3 absolute top-1/2 left-2/5 transform -translate-x-1/2 -translate-y-1/2"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="black"
                          stroke-width="0.5"
                      >
                        <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"/>
                      </svg>
                    </div>
                    <span
                        class="text-xs ml-2 font-medium"
                        :class="getBatteryTextClass(device.batteryLevel, device.isCharging)"
                    >
        {{ device.batteryLevel }}%
        <span v-if="device.isCharging">⚡</span>
    </span>
                  </div>
                </div>

                <div class="flex items-center space-x-2 mt-1">
                  <span :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    device.running ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    <span :class="[
                      'w-1.5 h-1.5 rounded-full mr-1.5',
                      device.running ? 'bg-green-600' : 'bg-gray-400'
                    ]"></span>
                    {{ device.running ? '运行中' : '已停止' }}
                  </span>
                </div>
              </div>
            </div>
            <button
                @click="triggerDeviceSummary(device.device)"
                :disabled="triggerLoading[device.device]"
                class="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 disabled:opacity-50 transition-colors"
            >
              {{ triggerLoading[device.device] ? '生成中...' : '重新生成' }}
            </button>
          </div>

          <div class="bg-gray-50 rounded-lg p-3 space-y-2 mb-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">当前应用</span>
              <span class="text-gray-900 font-medium">{{ device.currentApp || 'N/A' }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">运行时间</span>
              <span class="text-gray-900 font-medium">{{ formatDate(device.runningSince) }}</span>
            </div>
          </div>

          <!-- AI 总结部分 -->
          <div v-if="summaries.summaries && summaries.summaries[device.device]" class="mt-3">
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-900 flex items-center">
                  <svg class="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI 总结
                </h4>
                <span v-if="summaries.summaries[device.device].published" class="text-xs text-green-600 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  已发布
                </span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ summaries.summaries[device.device].summary || '暂无总结内容' }}
              </p>
              <div class="mt-2 text-xs text-gray-500">
                生成时间: {{ formatDate(summaries.summaries[device.device].date) }}
              </div>
            </div>
          </div>
          <div v-else class="mt-3">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <p class="text-sm text-gray-500">暂无 AI 总结，点击上方按钮生成</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getDevicesList, triggerSummary, getAllSummaries } from '../composables/admin.js';

const devices = ref([]);
const summaries = ref({
  count: 0,
  summaries: {}
});
const loading = ref(false);
const loadingSummaries = ref(false);
const triggerLoading = reactive({});

const emit = defineEmits(['toast', 'device-count-updated']);

// 获取电池颜色
const getBatteryColor = (level, isCharging) => {
  if (isCharging) {
    return '#22c55e'; // 充电时显示绿色
  }
  if (level <= 20) {
    return '#ef4444'; // 低于20%显示红色
  }
  return '#6b7280'; // 正常状态显示灰色
};

// 获取电池文字样式类
const getBatteryTextClass = (level, isCharging) => {
  if (isCharging) {
    return 'text-green-600 dark:text-green-400';
  }
  if (level <= 20) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-600 dark:text-gray-400';
};

const loadDevices = async () => {
  loading.value = true;
  try {
    const response = await getDevicesList();
    devices.value = response;
    // 发送设备数量给父组件
    emit('device-count-updated', devices.value.length);
  } catch (error) {
    console.error('加载设备列表失败:', error);
    emit('toast', '加载设备列表失败', 'error');
  } finally {
    loading.value = false;
  }
};

const loadSummaries = async () => {
  loadingSummaries.value = true;
  try {
    const response = await getAllSummaries();
    summaries.value = response;
  } catch (error) {
    console.error('加载总结失败:', error);
    emit('toast', '加载总结失败', 'error');
  } finally {
    loadingSummaries.value = false;
  }
};

const triggerDeviceSummary = async (deviceId) => {
  triggerLoading[deviceId] = true;
  try {
    await triggerSummary(deviceId);
    emit('toast', `设备 ${deviceId} 的 AI 总结生成请求已提交`);
    setTimeout(() => {
      loadDevices();
      loadSummaries();
    }, 2000);
  } catch (error) {
    console.error('触发总结失败:', error);
    emit('toast', error.response?.data?.message || '生成失败', 'error');
  } finally {
    triggerLoading[deviceId] = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadDevices();
  loadSummaries();
});

defineExpose({
  loadDevices,
  loadSummaries
});
</script>