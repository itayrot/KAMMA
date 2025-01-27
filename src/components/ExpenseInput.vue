<template>
  <div class="expense-input card">
    <div class="card-body">
      <div class="user-list mb-4">
        <TransitionGroup name="list">
          <div v-for="user in store.users" :key="user.id" class="user-row">
            <button class="delete-btn" @click="store.removeUser(user.id)">×</button>
            <span class="user-name">{{ user.name }}</span>
            <div class="expense-controls">
              <input
                type="number"
                v-model="expenseInputs[user.id]"
                placeholder="Amount"
                min="0"
                :disabled="loading[user.id]"
                class="form-control"
              >
              <button 
                @click="addExpense(user.id)"
                :disabled="loading[user.id]"
                class="btn"
              >
                {{ loading[user.id] ? 'Adding...' : 'Add expense' }}
              </button>
            </div>
            <div class="user-total">
              Total: {{ user.total }}
            </div>
          </div>
        </TransitionGroup>
      </div>
      
      <div class="new-user mb-4">
        <input
          type="text"
          v-model="newUserName"
          placeholder="Insert new name"
          @keyup.enter="addUser"
          :class="{ 'error': nameError }"
          class="form-control"
        >
        <span v-if="nameError" class="error-message">{{ nameError }}</span>
        <button @click="addUser" class="btn">Add</button>
      </div>
      
      <div class="total-section mb-4">
        <div class="total-amount">Total Expenses: {{ store.totalExpenses }}</div>
      </div>
      
      <div class="button-group">
        <button class="summary-btn btn" @click="$router.push('/summary')">Summary</button>
        <button class="reset-btn btn btn-danger" @click="showResetModal = true">Reset All</button>
      </div>
    </div>
    
    <ConfirmModal
      :show="showResetModal"
      title="Confirm Reset"
      message="Are you sure you want to reset? This will remove all users and expenses."
      @close="showResetModal = false"
      @confirm="confirmReset"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useExpenseStore } from '../stores/expenses'
import ConfirmModal from './ConfirmModal.vue'

const store = useExpenseStore()
const newUserName = ref('')
const expenseInputs = reactive({})
const nameError = ref('')
const loading = reactive({})
const showResetModal = ref(false)

function addUser() {
  nameError.value = ''
  const trimmedName = newUserName.value.trim()
  
  if (!trimmedName) {
    nameError.value = 'Name cannot be empty'
    return
  }
  
  if (store.users.some(user => user.name.toLowerCase() === trimmedName.toLowerCase())) {
    nameError.value = 'User already exists'
    return
  }
  
  store.addUser(trimmedName)
  newUserName.value = ''
}

async function addExpense(userId) {
  if (expenseInputs[userId] && !loading[userId]) {
    loading[userId] = true
    try {
      await store.addExpense(userId, expenseInputs[userId])
      expenseInputs[userId] = ''
    } finally {
      loading[userId] = false
    }
  }
}

function handleReset() {
  showResetModal.value = true
}

function confirmReset() {
  store.resetAll()
  expenseInputs = reactive({})
  showResetModal.value = false
}
</script>

<style scoped>
.expense-input {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.card-body {
  padding: 2rem;
}

.user-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 6px;
}

.delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expense-controls {
  display: flex;
  gap: 15px;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #0056b3;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.new-user {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 2rem;
}

.total-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  margin: 2rem 0;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 600px) {
  .user-row {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 15px;
  }
  
  .expense-controls {
    grid-column: 1 / -1;
  }
  
  .user-total {
    grid-column: 1 / -1;
  }

  .card-body {
    padding: 1rem;
  }
}

.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.8em;
  margin-left: 10px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}
</style> 