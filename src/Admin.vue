<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <TopNavBar @toast="showToast" />

    <!-- 主内容区 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 统计卡片 -->
      <StatisticsCards :aiStatus="aiStatus" :deviceCount="deviceCount" />

      <!-- 功能区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：AI 控制面板 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- AI 任务控制模块 -->
          <AIControlPanel
              :aiStatus="aiStatus"
              @toast="showToast"
              @refresh-status="loadStatus"
              @start-ai="loadStatus"
              @stop-ai="loadStatus"
          />

          <!-- 配置管理模块 -->
          <ConfigPanel
              @toast="showToast"
          />
        </div>

        <!-- 右侧：设备列表 -->
        <div class="lg:col-span-2">
          <DeviceList
              ref="deviceListRef"
              @toast="showToast"
              @device-count-updated="updateDeviceCount"
          />
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <Toast :toast="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getAIStatus } from './composables/admin';
import TopNavBar from './components/TopNavBar.vue';
import StatisticsCards from './components/StatisticsCards.vue';
import AIControlPanel from './components/AIControlPanel.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import Toast from './components/Toast.vue';
import DeviceList from './components/DeviceList.vue';

const router = useRouter();
const deviceListRef = ref(null);

const aiStatus = ref({
  enabled: false,
  aiConfigured: false,
  publishConfigured: false,
  cronJobsCount: 0,
  schedules: [],
  model: '',
  defaultTimezone: ''
});

const deviceCount = ref(0);

const toast = reactive({
  show: false,
  message: '',
  details: '',
  type: 'success'
});

const showToast = (message, type = 'success', details = '') => {
  toast.message = message;
  toast.details = details;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const updateDeviceCount = (count) => {
  deviceCount.value = count;
};

const loadStatus = async () => {
  try {
    const response = await getAIStatus();
    aiStatus.value = response;
  } catch (error) {
    console.error('加载状态失败:', error);
  }
};

onMounted(async () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.push('/login');
    return;
  }

  await loadStatus();
});
</script>

<style scoped>
</style>