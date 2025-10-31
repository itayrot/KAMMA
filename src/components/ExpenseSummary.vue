<template>
  <div class="summary">
    <!-- Summary Cards -->
    <div class="totals">
      <div class="total-box total-expenses">
        <h3>Total Expenses</h3>
        <div class="amount">{{ formatCurrency(store.totalExpenses) }}</div>
      </div>
      <div class="total-box per-user">
        <h3>Fair Share per Person</h3>
        <div class="amount">{{ formatCurrency(store.expensePerUser) }}</div>
      </div>
    </div>
    
    <!-- Net Balance for Everyone -->
    <div class="balance-summary">
      <h2 class="section-title">Net Balance</h2>
      <p class="section-subtitle">How much each person is over or under their fair share</p>
      <div class="balance-grid">
        <div v-for="user in store.users" :key="user.id" class="balance-item">
          <div class="person-name">{{ user.name }}</div>
          <div :class="getBalanceClass(user)">
            {{ formatBalance(user.total - store.expensePerUser) }}
          </div>
          <div class="balance-detail">
            Paid: {{ formatCurrency(user.total) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Settlement Details -->
    <div class="settlements" v-if="store.debts.length > 0">
      <h2 class="section-title">Settlement Details</h2>
      <p class="section-subtitle">These payments will balance everyone's expenses</p>
      <div class="debt-list">
        <div v-for="(debt, index) in store.debts" :key="index" class="debt-item">
          <div class="debt-content">
            <div class="debt-arrow">
              <span class="debt-from">{{ debt.from }}</span>
              <span class="arrow">→</span>
              <span class="debt-to">{{ debt.to }}</span>
            </div>
            <div class="debt-amount">{{ formatCurrency(debt.amount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Debts by Person -->
    <div class="debt-summary" v-if="Object.keys(debtTotals).length > 0">
      <h2 class="section-title">Total Amount Owed</h2>
      <div class="summary-list">
        <div v-for="(total, person) in debtTotals" :key="person" class="summary-item">
          <div class="person-name">{{ person }}</div>
          <div class="total-debt">{{ formatCurrency(total) }}</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.debts.length === 0 && store.users.length > 0" class="balanced-state">
      <div class="balanced-icon">✓</div>
      <h3>All Balanced!</h3>
      <p>Everyone has paid their fair share.</p>
    </div>
    
    <button class="back-btn" @click="$router.push('/')">← Back to Expenses</button>
  </div>
</template>

<script setup>
import { useExpenseStore } from '../stores/expenses'
import { computed } from 'vue'

const store = useExpenseStore()

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function formatBalance(amount) {
  if (Math.abs(amount) < 0.01) return formatCurrency(0)
  if (amount > 0) return `+${formatCurrency(amount)}`
  return formatCurrency(amount)
}

function getBalanceClass(user) {
  const balance = user.total - store.expensePerUser
  if (balance > 0.01) return 'balance-positive'
  if (balance < -0.01) return 'balance-negative'
  return 'balance-neutral'
}

const debtTotals = computed(() => {
  const totals = {}
  store.debts.forEach(debt => {
    if (!totals[debt.from]) {
      totals[debt.from] = 0
    }
    totals[debt.from] += debt.amount
  })
  return totals
})
</script>

<style scoped>
.summary {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 3rem;
}

.total-box {
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.total-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.total-expenses {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.per-user {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.total-box h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -1px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.section-subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

/* Balance Summary */
.balance-summary {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.balance-grid {
  display: grid;
  gap: 12px;
}

.balance-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.balance-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.balance-item .person-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
}

.balance-positive {
  color: #059669;
  font-weight: 700;
  font-size: 1.2rem;
}

.balance-negative {
  color: #d97706;
  font-weight: 700;
  font-size: 1.2rem;
}

.balance-neutral {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.2rem;
}

.balance-detail {
  grid-column: 1 / -1;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Settlements */
.settlements {
  margin-bottom: 3rem;
}

.debt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.debt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: #f9fafb;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.debt-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
}

.debt-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.debt-arrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
}

.debt-from {
  font-weight: 600;
  color: #ef4444;
}

.debt-to {
  font-weight: 600;
  color: #10b981;
}

.arrow {
  color: #6b7280;
  font-size: 1.5rem;
}

.debt-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
}

/* Debt Summary */
.debt-summary {
  margin-top: 3rem;
  padding: 2rem;
  background: #fef3c7;
  border-radius: 12px;
  border: 1px solid #fcd34d;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.summary-item .person-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.05rem;
}

.total-debt {
  color: #d97706;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Balanced State */
.balanced-state {
  text-align: center;
  padding: 3rem;
  margin: 2rem 0;
  background: #ecfdf5;
  border-radius: 12px;
  border: 2px solid #10b981;
}

.balanced-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.balanced-state h3 {
  font-size: 1.5rem;
  color: #059669;
  margin-bottom: 0.5rem;
}

.balanced-state p {
  color: #047857;
  font-size: 1rem;
}

.back-btn {
  margin-top: 3rem;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

@media (max-width: 600px) {
  .totals {
    grid-template-columns: 1fr;
  }

  .summary {
    padding: 1rem;
  }

  .debt-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .debt-amount {
    width: 100%;
    text-align: right;
  }
}
</style>
