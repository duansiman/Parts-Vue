import { usePermissionStore } from '@/stores/permission';

window.addEventListener('load', () => {
  const permissionStore = usePermissionStore();
  permissionStore.load = false; // 页面加载完成，设置 load 状态
});
