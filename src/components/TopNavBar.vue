<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">管理后台</h1>
            <p class="text-xs text-gray-500">AI Summary Management</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
              @click="showPasswordModal = true"
              class="bg-blue-50 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            修改密码
          </button>
          <button
              @click="handleLogout"
              class="bg-red-50 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            退出登录
          </button>
          <button
              @click="handleRestart"
              :disabled="loading"
              class="bg-yellow-50 px-4 py-2 text-sm font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ loading ? '重启中...' : '重启' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->

    <div v-if="showPasswordModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-200 opacity-50"></div>
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative z-10">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">修改账户密码</h3>


          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">账户名</label>
              <input
                  v-model="currentUsername"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                  v-model="newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <input
                  v-model="confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
                @click="closePasswordModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
                @click="handleUpdatePassword"
                :disabled="updating"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ updating ? '更新中...' : '确认修改' }}
            </button>
          </div>
        </div>
    </div>

  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { restart, updateAccount } from '../composables/admin';

const router = useRouter();
const loading = ref(false);
const updating = ref(false);
const showPasswordModal = ref(false);
const currentUsername = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const emit = defineEmits(['toast']);

onMounted(() => {
  // 从 localStorage 获取当前用户名 (登录时应该保存)
  currentUsername.value = localStorage.getItem('admin_username') || 'admin';
});

const closePasswordModal = () => {
  showPasswordModal.value = false;
  newPassword.value = '';
  confirmPassword.value = '';
};

const handleUpdatePassword = async () => {
  if (!newPassword.value) {
    emit('toast', '请输入新密码', 'error');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    emit('toast', '两次密码输入不一致', 'error');
    return;
  }

  updating.value = true;
  try {
    const response = await updateAccount({ password: newPassword.value });

    emit('toast', response.message || '密码修改成功，即将重新登录', 'success');

    setTimeout(() => {
      localStorage.removeItem('admin_token');
      router.push('/login');
    }, 1500);
  } catch (error) {
    console.error('修改密码失败:', error);
    emit('toast', error.response?.data?.message || '修改密码失败', 'error');
  } finally {
    updating.value = false;
    closePasswordModal();
  }
};

const handleRestart = async () => {
  loading.value = true;
  try {
    await restart();
    emit('toast', '服务器重启中...5秒后刷新页面', 'success');
    setTimeout(() => {
      location.reload();
    }, 5000);
  } catch (error) {
    console.error('重启失败:', error);
    emit('toast', error.response?.data?.message || '重启失败', 'error');
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('admin_token');
  router.push('/login');
};
</script>