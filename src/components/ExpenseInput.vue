<template>
  <div class="expense-input card">
    <div class="card-body">
      <!-- Empty State -->
      <div v-if="store.users.length === 0" class="empty-state">
        <div class="empty-icon">💰</div>
        <h3>No expenses yet</h3>
        <p>Add users and their expenses to get started!</p>
      </div>

      <!-- User List -->
      <div v-else class="user-list mb-4">
        <TransitionGroup name="list">
          <div v-for="user in store.users" :key="user.id" class="user-row">
            <button class="delete-btn" @click="store.removeUser(user.id)" title="Delete user">×</button>
            <span class="user-name">{{ user.name }}</span>
            <div class="expense-controls">
              <input
                type="number"
                v-model="expenseInputs[user.id]"
                placeholder="Amount"
                min="0"
                step="0.01"
                :disabled="loading[user.id]"
                class="form-control"
                @keyup.enter="addExpense(user.id)"
              >
              <button 
                @click="addExpense(user.id)"
                :disabled="loading[user.id] || !expenseInputs[user.id]"
                class="btn btn-primary"
              >
                {{ loading[user.id] ? 'Adding...' : 'Add expense' }}
              </button>
            </div>
            <div class="user-total-section">
              <div class="user-total">
                Total: <span class="total-amount">{{ formatCurrency(user.total) }}</span>
              </div>
              <!-- Progress Indicator -->
              <div class="progress-container" v-if="store.expensePerUser > 0">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: getProgressPercent(user) + '%' }"
                    :class="getProgressClass(user)"
                  ></div>
                </div>
                <span class="progress-text" :class="getProgressTextClass(user)">
                  {{ getProgressText(user) }}
                </span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
      
      <!-- Add New User -->
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
        <button @click="addUser" class="btn btn-primary">Add</button>
      </div>
      
      <!-- Total Section -->
      <div class="total-section mb-4">
        <div class="total-amount-large">Total Expenses: {{ formatCurrency(store.totalExpenses) }}</div>
        <div v-if="store.users.length > 0" class="per-user-info">
          Fair share per person: <strong>{{ formatCurrency(store.expensePerUser) }}</strong>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="button-group">
        <button 
          class="summary-btn btn btn-primary" 
          @click="$router.push('/summary')"
          :disabled="store.users.length === 0"
        >
          View Summary
        </button>
        <button 
          class="reset-btn btn btn-danger" 
          @click="showResetModal = true"
          :disabled="store.users.length === 0"
        >
          Reset All
        </button>
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
let expenseInputs = reactive({})
const nameError = ref('')
const loading = reactive({})
const showResetModal = ref(false)

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function getProgressPercent(user) {
  if (store.expensePerUser === 0) return 0
  const percent = (user.total / store.expensePerUser) * 100
  return Math.min(percent, 100)
}

function getProgressClass(user) {
  const diff = user.total - store.expensePerUser
  if (diff > 0) return 'overpaid'
  if (diff < 0) return 'underpaid'
  return 'balanced'
}

function getProgressText(user) {
  const diff = user.total - store.expensePerUser
  if (Math.abs(diff) < 0.01) return 'Balanced ✓'
  if (diff > 0) return `Overpaid by ${formatCurrency(diff)}`
  return `Owes ${formatCurrency(Math.abs(diff))}`
}

function getProgressTextClass(user) {
  const diff = user.total - store.expensePerUser
  if (diff > 0) return 'text-positive'
  if (diff < 0) return 'text-negative'
  return 'text-neutral'
}

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

function confirmReset() {
  store.resetAll()
  expenseInputs = reactive({})
  showResetModal.value = false
}
</script>

<style scoped>
.expense-input {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  font-size: 1rem;
  color: #9ca3af;
}

.user-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}

.delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.user-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1f2937;
  align-self: center;
}

.expense-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-total-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  grid-column: 1 / -1;
}

.user-total {
  font-size: 1rem;
  color: #6b7280;
  text-align: right;
}

.total-amount {
  font-weight: 700;
  font-size: 1.2rem;
  color: #1f2937;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-fill.overpaid {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.underpaid {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.balanced {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.progress-text {
  font-size: 0.875rem;
  text-align: right;
  font-weight: 500;
}

.text-positive {
  color: #059669;
}

.text-negative {
  color: #d97706;
}

.text-neutral {
  color: #3b82f6;
}

.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.form-control {
  padding: 10px 14px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  flex: 1;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control.error {
  border-color: #ef4444;
}

.new-user {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.total-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 10px;
  margin: 2rem 0;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.total-amount-large {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.per-user-info {
  font-size: 1.1rem;
  opacity: 0.95;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  margin-top: 2rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
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

@media (max-width: 600px) {
  .user-row {
    grid-template-columns: auto 1fr;
    gap: 15px;
  }
  
  .expense-controls {
    grid-column: 1 / -1;
    flex-direction: column;
  }
  
  .user-total-section {
    grid-column: 1 / -1;
  }

  .card-body {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
