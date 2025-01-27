<template>
  <div class="summary">
    <div class="totals">
      <div class="total-box">
        <h3>Total Expenses</h3>
        <div class="amount">{{ store.totalExpenses }}</div>
      </div>
      <div class="total-box">
        <h3>Expense per user</h3>
        <div class="amount">{{ store.expensePerUser.toFixed(2) }}</div>
      </div>
    </div>
    
    <div class="debts">
      <div v-for="(debt, index) in store.debts" :key="index" class="debt-item">
        <div class="debt-arrow">
          {{ debt.from }} → {{ debt.to }}
        </div>
        <div class="debt-amount">
          {{ debt.amount.toFixed(2) }}
        </div>
      </div>
    </div>
    
    <button class="back-btn" @click="$router.push('/')">Back</button>
  </div>
</template>

<script setup>
import { useExpenseStore } from '../stores/expenses'

const store = useExpenseStore()
</script>

<style scoped>
.summary {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.total-box {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #2196f3;
}

.debts {
  margin-top: 40px;
}

.debt-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .totals {
    grid-template-columns: 1fr;
  }
}
</style> 