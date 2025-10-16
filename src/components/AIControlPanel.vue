<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      AI 任务控制
    </h2>

    <div class="space-y-3">
      <button
          @click="startAI_Task"
          :disabled="!aiStatus.enabled || loading.start || aiStatus.cronJobsCount"
          class="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ loading.start ? '启动中...' : '启动 AI 定时任务' }}
      </button>

      <button
          @click="stopAI_Task"
          :disabled="!aiStatus.enabled || loading.stop || !aiStatus.cronJobsCount"
          class="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        {{ loading.stop ? '停止中...' : '停止 AI 定时任务' }}
      </button>

      <button
          @click="refreshStatus"
          :disabled="loading.refresh"
          class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading.refresh ? '刷新中...' : '刷新状态' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { startAI, stopAI } from '../composables/admin';

const props = defineProps({
  aiStatus: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toast', 'refresh-status', 'start-ai', 'stop-ai']);

const loading = reactive({
  start: false,
  stop: false,
  refresh: false
});

const startAI_Task = async () => {
  loading.start = true;
  try {
    await startAI();
    emit('toast', 'AI 定时任务已启动', 'success');
    emit('start-ai');
  } catch (error) {
    console.error('启动失败:', error);
    emit('toast', error.response?.data?.message || '启动失败', 'error');
  } finally {
    loading.start = false;
  }
};

const stopAI_Task = async () => {
  loading.stop = true;
  try {
    await stopAI();
    emit('toast', 'AI 定时任务已停止', 'success');
    emit('stop-ai');
  } catch (error) {
    console.error('停止失败:', error);
    emit('toast', error.response?.data?.message || '停止失败', 'error');
  } finally {
    loading.stop = false;
  }
};

const refreshStatus = async () => {
  loading.refresh = true;
  try {
    emit('refresh-status');
    emit('toast', '刷新成功', 'success');
  } catch (error) {
    emit('toast', '刷新失败', 'error');
  } finally {
    loading.refresh = false;
  }
};
</script>

<style scoped>
</style>