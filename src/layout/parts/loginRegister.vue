<template>
	<div style="display: flex; center: space-between; align-items: center;">
		<el-text v-if="isLogin" size="large" style="margin-left: 10px;">
			<el-icon><Avatar /></el-icon>
			{{loginName}}
		</el-text>
		<el-link v-if="isLogin" type="danger" style="margin-left: 10px;" @click="logout">退出</el-link>
		<!-- <el-button v-if="isLogin">退出</el-button> -->
		
		
		<el-button type="info" @click="showLogin" style="height: 30px; width: 80px;" v-if="!isLogin">登录</el-button>
		<el-button type="primary" @click="showRegister" style="height: 30px; width: 80px;" v-if="!isLogin">注册</el-button>
		
		
		<el-dialog v-model="showLoginOpen" width="440px" append-to-body>
			<el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
				<el-form-item prop="username">
					<el-input
					  v-model="loginForm.username"
					  type="text"
					  size="large"
					  auto-complete="off"
					  placeholder="邮箱"
					>
						<template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input
					  v-model="loginForm.password"
					  type="password"
					  size="large"
					  auto-complete="off"
					  placeholder="密码"
					  @keyup.enter="handleLogin"
					>
						<template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
					</el-input>
				</el-form-item>
				<el-form-item prop="code" v-if="captchaEnabled">
					<el-input
					  v-model="loginForm.code"
					  size="large"
					  auto-complete="off"
					  placeholder="验证码"
					  style="width: 63%"
					  @keyup.enter="handleLogin"
					>
						<template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
					</el-input>
					<div class="login-code">
					  <img :src="codeUrl" @click="getCode" class="login-code-img"/>
					</div>
				</el-form-item>
				<el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
				<el-form-item style="width:100%;">
					<el-button
					  :loading="loading"
					  size="large"
					  type="primary"
					  style="width:100%;"
					  @click.prevent="handleLogin"
					>
						<span v-if="!loading">登 录</span>
						<span v-else>登 录 中...</span>
					</el-button>
					<div style="float: right;">
					  <el-link type="primary" @click="clickRegister">立即注册</el-link>
					</div>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<el-dialog v-model="showRegisterOpen" width="440px" append-to-body>
			<el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
			  <el-form-item prop="username">
			    <el-input 
			      v-model="registerForm.username" 
			      type="text" 
			      size="large" 
			      auto-complete="off" 
			      placeholder="邮箱"
			    >
			      <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
			    </el-input>
			  </el-form-item>
			  <el-form-item prop="password">
			    <el-input
			      v-model="registerForm.password"
			      type="password"
			      size="large" 
			      auto-complete="off"
			      placeholder="密码"
			      @keyup.enter="handleRegister"
			    >
			      <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
			    </el-input>
			  </el-form-item>
			  <el-form-item prop="confirmPassword">
			    <el-input
			      v-model="registerForm.confirmPassword"
			      type="password"
			      size="large" 
			      auto-complete="off"
			      placeholder="确认密码"
			      @keyup.enter="handleRegister"
			    >
			      <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
			    </el-input>
			  </el-form-item>
			  <el-form-item prop="code" v-if="captchaEnabled">
			    <el-input
			      size="large" 
			      v-model="registerForm.code"
			      auto-complete="off"
			      placeholder="邮箱验证码"
			      style="width: 63%"
			      @keyup.enter="handleRegister"
			    >
			      <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
			    </el-input>
			    <div class="register-code">
				  <el-button type="primary" class="register-code-img" :disabled="isCountingDown" @click="sendEmailCaptcha">{{ countdownText }}</el-button>
			      <!-- <img :src="codeUrl" @click="getCode" class="register-code-img"/> -->
			    </div>
			  </el-form-item>
			  <el-form-item style="width:100%;">
			    <el-button
			      :loading="loading"
			      size="large" 
			      type="primary"
			      style="width:100%;"
			      @click.prevent="handleRegister"
			    >
			      <span v-if="!loading">注 册</span>
			      <span v-else>注 册 中...</span>
			    </el-button>
			    <div style="float: right;">
				  <el-link type="primary" @click="clickLogin">使用已有账户登录</el-link>
			    </div>
			  </el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script setup>
	import { getCodeImg, register, getEmailCaptcha } from "@/api/login";
	import Cookies from "js-cookie";
	import { encrypt, decrypt } from "@/utils/jsencrypt";
	import { computed } from 'vue';
	import loginNotifyStore from '@/store/modules/loginNotify'
	import { ElMessage } from 'element-plus'
	
	const { proxy } = getCurrentInstance();
	const { loginName, isLogin, logout, login, getInfo } = proxy.loginService();
	
	const loginNotify = loginNotifyStore();
	console.log("loginNotify", loginNotify.flag);
	watch(() => loginNotify.flag, (newValue) => {
	    console.log('loginNotify.flag:', newValue);
	    if (newValue) {
	      // 逻辑：当 flag 变为 true
	      showLoginOpen.value = true;
		  loginNotify.close();
	    }
	  }
	);
	
	const codeUrl = ref("");
	const loading = ref(false);
	
	// 验证码开关
	const captchaEnabled = ref(true);
	
	function getCode() {
	  getCodeImg().then(res => {
	    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
	    if (captchaEnabled.value) {
	      codeUrl.value = "data:image/gif;base64," + res.img;
	      loginForm.value.uuid = res.uuid;
	    }
	  });
	}
	getCode();
	
	function clickLogin() {
		showRegisterOpen.value = false;
		showLoginOpen.value = true;
	}
	
	function clickRegister() {
		showLoginOpen.value = false;
		showRegisterOpen.value = true;
	}
	
	// 登录相关
	const showLoginOpen = ref(false);
	function showLogin() {
		showLoginOpen.value = true;
	}

	const redirect = ref(undefined);
	
	const loginForm = ref({
	  username: "admin",
	  password: "admin123",
	  rememberMe: false,
	  code: "",
	  uuid: ""
	});
	
	const loginRules = {
	  username: [{ required: true, trigger: "blur", message: "请输入您的邮箱" }],
	  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
	  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
	};
	
	function handleLogin() {
	  proxy.$refs.loginRef.validate(valid => {
	    if (valid) {
	      loading.value = true;
	      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
	      if (loginForm.value.rememberMe) {
	        Cookies.set("username", loginForm.value.username, { expires: 30 });
	        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
	        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
	      } else {
	        // 否则移除
	        Cookies.remove("username");
	        Cookies.remove("password");
	        Cookies.remove("rememberMe");
	      }
	      // 调用action的登录方法
	      login(loginForm.value).then(() => {
			  getInfo().then(() => {
				showLoginOpen.value = false;
				loading.value = false;
			  });
	      }).catch(() => {
	        loading.value = false;
	        // 重新获取验证码
	        if (captchaEnabled.value) {
	          getCode();
	        }
	      });
	    }
	  });
	}
	
	function getCookie() {
	  const username = Cookies.get("username");
	  const password = Cookies.get("password");
	  const rememberMe = Cookies.get("rememberMe");
	  loginForm.value = {
	    username: username === undefined ? loginForm.value.username : username,
	    password: password === undefined ? loginForm.value.password : decrypt(password),
	    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
	  };
	}
	getCookie();
	
	// 注册相关
	const showRegisterOpen = ref(false);
	
	const registerForm = ref({
	  username: "",
	  password: "",
	  confirmPassword: "",
	  code: "",
	  uuid: ""
	});
	
	const isCountingDown = ref(false); // 按钮是否禁用
	const countdownTime = ref(60); // 倒计时的总时间
	const countdownText = ref("发送"); // 按钮显示的文本
	let timer = null; // 定时器句柄
	
	const equalToPassword = (rule, value, callback) => {
	  if (registerForm.value.password !== value) {
	    callback(new Error("两次输入的密码不一致"));
	  } else {
	    callback();
	  }
	};
	
	const registerRules = {
	  username: [
	    { required: true, trigger: "blur", message: "请输入您的账号" },
	    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
	  ],
	  password: [
	    { required: true, trigger: "blur", message: "请输入您的密码" },
	    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
	    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
	  ],
	  confirmPassword: [
	    { required: true, trigger: "blur", message: "请再次输入您的密码" },
	    { required: true, validator: equalToPassword, trigger: "blur" }
	  ],
	  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
	};
	
	function showRegister() {
		showRegisterOpen.value = true;
	}
	
	function sendEmailCaptcha() {
		  if (isCountingDown.value) return;
		
		  isCountingDown.value = true; // 禁用按钮
		  countdownText.value = `${countdownTime.value}秒后重试`; // 更新按钮文本

		  // 每秒更新倒计时
		  timer = setInterval(() => {
			countdownTime.value -= 1;
			countdownText.value = `${countdownTime.value}秒后重试`;

			// 倒计时结束
			if (countdownTime.value <= 0) {
			  clearInterval(timer); // 清除定时器
			  timer = null;
			  isCountingDown.value = false; // 解除禁用
			  countdownTime.value = 60; // 重置倒计时时间
			  countdownText.value = "发送"; // 恢复按钮文本
			}
		  }, 1000);
		
		const query = {
			email: registerForm.value.username
		}
		getEmailCaptcha(query).then(res => {
			registerForm.value.uuid = res.uuid;
			ElMessage('验证码发送成功，请查看邮箱')
		})
	}
	
	function handleRegister() {
	  proxy.$refs.registerRef.validate(valid => {
	    if (valid) {
	      loading.value = true;
	      register(registerForm.value).then(res => {
			  ElMessage('恭喜你，注册成功，请登录！')
			  loading.value = false;
			  clickLogin()
	      }).catch(() => {
	        loading.value = false;
	      });
	    }
	  });
	}
</script>

<style>
	
	.login-form {
	  border-radius: 6px;
	  background: #ffffff;
	  width: 400px;
	  padding: 25px 25px 5px 25px;
	  .el-input {
	    height: 40px;
	    input {
	      height: 40px;
	    }
	  }
	  .input-icon {
	    height: 39px;
	    width: 14px;
	    margin-left: 0px;
	  }
	}
	.login-tip {
	  font-size: 13px;
	  text-align: center;
	  color: #bfbfbf;
	}
	.login-code {
	  width: 33%;
	  height: 40px;
	  float: right;
	  img {
	    cursor: pointer;
	    vertical-align: middle;
	  }
	}
	.el-login-footer {
	  height: 40px;
	  line-height: 40px;
	  position: fixed;
	  bottom: 0;
	  width: 100%;
	  text-align: center;
	  color: #fff;
	  font-family: Arial;
	  font-size: 12px;
	  letter-spacing: 1px;
	}
	.login-code-img {
	  height: 40px;
	  padding-left: 12px;
	}
	
	/* 注册 */
	.register {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  height: 100%;
	  background-image: url("../assets/images/login-background.jpg");
	  background-size: cover;
	}
	.title {
	  margin: 0px auto 30px auto;
	  text-align: center;
	  color: #707070;
	}
	
	.register-form {
	  border-radius: 6px;
	  background: #ffffff;
	  width: 400px;
	  padding: 25px 25px 5px 25px;
	  .el-input {
	    height: 40px;
	    input {
	      height: 40px;
	    }
	  }
	  .input-icon {
	    height: 39px;
	    width: 14px;
	    margin-left: 0px;
	  }
	}
	.register-tip {
	  font-size: 13px;
	  text-align: center;
	  color: #bfbfbf;
	}
	.register-code {
	  width: 33%;
	  height: 40px;
	  float: right;
	  img {
	    cursor: pointer;
	    vertical-align: middle;
	  }
	}
	.el-register-footer {
	  height: 40px;
	  line-height: 40px;
	  position: fixed;
	  bottom: 0;
	  width: 100%;
	  text-align: center;
	  color: #fff;
	  font-family: Arial;
	  font-size: 12px;
	  letter-spacing: 1px;
	}
	.register-code-img {
	  height: 40px;
	  width: 100%;
	  padding-left: 12px;
	  margin-left: 6px;
	}
</style>