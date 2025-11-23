<template>
  <div class="container mt-4">
    <h1 class="mb-3">🛒 Quản lý cửa hàng</h1>
    <div class="row">
      <div class="col-md-4" v-for="card in stats" :key="card.title">
        <div class="card shadow-sm p-3">
          <div class="card-body">
            <h5>{{ card.title }}</h5>
            <h2 class="text-primary">{{ card.value }}</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: 'Tổng sản phẩm', value: 128 },
  { title: 'Đơn hàng hôm nay', value: 7 },
  { title: 'Người dùng mới', value: 3 },
])
</script>
