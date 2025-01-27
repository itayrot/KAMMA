import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExpenseStore = defineStore('expenses', () => {
  const users = ref(JSON.parse(localStorage.getItem('users')) || [])
  
  const totalExpenses = computed(() => {
    return users.value.reduce((sum, user) => sum + user.total, 0)
  })
  
  const expensePerUser = computed(() => {
    return users.value.length ? totalExpenses.value / users.value.length : 0
  })
  
  const debts = computed(() => {
    const debts = []
    const avgExpense = expensePerUser.value
    
    users.value.forEach(payer => {
      users.value.forEach(receiver => {
        if (payer.id !== receiver.id) {
          const payerDiff = avgExpense - payer.total
          const receiverDiff = receiver.total - avgExpense
          
          if (payerDiff > 0 && receiverDiff > 0) {
            const debt = Math.min(payerDiff, receiverDiff)
            if (debt > 0) {
              debts.push({
                from: payer.name,
                to: receiver.name,
                amount: debt
              })
            }
          }
        }
      })
    })
    
    return debts
  })
  
  function addUser(name) {
    const newUser = {
      id: Date.now(),
      name,
      total: 0,
      expenses: []
    }
    users.value.push(newUser)
    saveToLocalStorage()
  }
  
  function addExpense(userId, amount) {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.expenses.push({
        id: Date.now(),
        amount: Number(amount)
      })
      user.total += Number(amount)
      saveToLocalStorage()
    }
  }
  
  function removeUser(userId) {
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users.value))
  }
  
  function resetAll() {
    users.value = []
    saveToLocalStorage()
  }
  
  return {
    users,
    totalExpenses,
    expensePerUser,
    debts,
    addUser,
    addExpense,
    removeUser,
    resetAll
  }
}) 