import { computed } from 'vue';
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'

import useUserStore from '@/store/modules/user';
import loginNotifyStore from '@/store/modules/loginNotify'

// 导出计算属性和方法
export const loginService = () => {
	
	const userStore = useUserStore();
	
    const loginName = computed(() => userStore.name);
	
    const isLogin = computed(() => userStore.token!= "");
	
    const logout = () => userStore.logOut();

	const login = (userInfo) => userStore.login(userInfo);
	
	const getInfo = () => userStore.getInfo();
	
	const checkLogin = () => {
		if(!isLogin.value) {
			ElMessageBox
				.confirm('请先登录账户', '系统提示', { confirmButtonText: '登录', cancelButtonText: '取消', type: 'warning' })
				.then(() => {
					// loginNotifyStore().show()
					const loginNotify = loginNotifyStore();
					loginNotify.show();
					console.log("loginNotifyStore", loginNotify.flag)
				});
			return false;
		}
		return true;
	};
	
    return {
        loginName,
        isLogin,
        logout,
		login,
		getInfo,
		checkLogin
    };
};