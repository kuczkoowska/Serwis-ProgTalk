<script setup>
import NavBarComponent from "./components/NavBarComponent.vue";
import { useGlobalUserSocketNotifications } from "./composables/useSocketNotifications";

useGlobalUserSocketNotifications();
</script>

<template>
  <div class="app-container">
    <nav-bar-component />
    <router-view></router-view>
  </div>
</template>
<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fbf0fa;
}
</style>
