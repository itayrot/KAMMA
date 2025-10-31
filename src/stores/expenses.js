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
    if (users.value.length === 0) return []
    
    const avgExpense = expensePerUser.value
    const debts = []
    
    // Step 1: Calculate difference from fair share for each person
    // difference = paid - fair_share
    // Positive = overpaid (should receive money)
    // Negative = underpaid (should pay money)
    const balances = users.value.map(user => ({
      name: user.name,
      difference: user.total - avgExpense  // paid - fair_share
    }))
    
    // Step 2: Separate overpayers and underpayers
    const overpayers = balances.filter(b => b.difference > 0)
      .map(b => ({ name: b.name, amount: b.difference }))
    const underpayers = balances.filter(b => b.difference < 0)
      .map(b => ({ name: b.name, amount: Math.abs(b.difference) })) // Convert to positive for easier calculation
    
    // Step 3: Match overpayers with underpayers to settle debts
    let overpayerIndex = 0
    let underpayerIndex = 0
    
    while (overpayerIndex < overpayers.length && underpayerIndex < underpayers.length) {
      const overpayer = overpayers[overpayerIndex]
      const underpayer = underpayers[underpayerIndex]
      
      const settlement = Math.min(overpayer.amount, underpayer.amount)
      
      if (settlement > 0.01) { // Only add debts above 1 cent to avoid floating point issues
        debts.push({
          from: underpayer.name,  // Who owes money
          to: overpayer.name,     // Who should receive money
          amount: settlement
        })
      }
      
      // Reduce the amounts
      overpayer.amount -= settlement
      underpayer.amount -= settlement
      
      // Move to next person if their balance is settled
      if (overpayer.amount < 0.01) overpayerIndex++
      if (underpayer.amount < 0.01) underpayerIndex++
    }
    
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