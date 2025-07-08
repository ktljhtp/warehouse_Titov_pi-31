<template>
  <WarehouseGame />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WarehouseGame from './views/WarehouseGame.vue';

export default defineComponent({
  name: 'App',
  components: {
    WarehouseGame
  }
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}
</style>