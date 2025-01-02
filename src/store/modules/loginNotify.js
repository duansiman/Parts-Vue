import { defineStore } from 'pinia';

const loginNotifyStore = defineStore(
  'loginNotify',
  {
    state: () => ({
      flag: false
    }),
	persist: true,
    actions: {
      // 登录
      show() {
        this.flag = true;
      },
      // 获取用户信息
      close() {
        this.flag = false;
      }
    }
  })

export default loginNotifyStore
