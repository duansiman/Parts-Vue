// const store = createPinia()

// export default store

import { createPinia } from 'pinia';
import piniaPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(piniaPersistedstate); // 注册持久化插件

export default store;
