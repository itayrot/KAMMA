<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<style>
.app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

input, button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #2196f3;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style> 