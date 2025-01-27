import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import ExpenseInput from './components/ExpenseInput.vue'
import ExpenseSummary from './components/ExpenseSummary.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ExpenseInput },
    { path: '/summary', component: ExpenseSummary }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app') 