import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
import { defineStore } from 'pinia';
import usePermissionStore from '@/store/modules/permission'
import { isHttp } from '@/utils/validate'
import router from '@/router'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
	persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          key: 'user'
        }
      ]
    },
    actions: {
		isLogin() {
			return userStore.token != "";
		},
		// 登录
	  login(userInfo) {
		const username = userInfo.username.trim()
		const password = userInfo.password
		const code = userInfo.code
		const uuid = userInfo.uuid
		return new Promise((resolve, reject) => {
		  login(username, password, code, uuid).then(res => {
			setToken(res.token)
			this.token = res.token
			resolve()
		  }).catch(error => {
			reject(error)
		  })
		})
	  },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar
			
			// usePermissionStore().generateRoutes().then(accessRoutes => {
			//   console.log("accessRoutes", accessRoutes)
			//   // 根据roles权限生成可访问的路由表
			//   accessRoutes.forEach(route => {
			//     if (!isHttp(route.path)) {
			//       router.addRoute(route) // 动态添加可访问路由表
			//     }
			//   })
			//   router.push({ ...router.currentRoute.value, replace: true }); // 重新导航
			//   console.log('Router options:', router.getRoutes()); // 检查当前所有已注册的路由
			// })
			
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
			this.clearPersistedData();
			usePermissionStore().load = false;
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
	  clearPersistedData() {
		  const storeId = this.$id;
		  console.log("storeId=", storeId);
		  localStorage.removeItem('user');
	  }
    }
  })

export default useUserStore
