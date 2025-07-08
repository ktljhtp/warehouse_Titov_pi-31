<template>
  <div class="main-container">
    <div class="left-panel">
      <div class="ProjectName">
        <h1>Имитационная модель будней кладовщика</h1>
      </div>
      
      <div class="control">
        <div class="button">
          <button @click="startSimulation" :disabled="isSimulationRunning">Старт</button>
          <button @click="stopSimulation" :disabled="!isSimulationRunning">Стоп</button>
          <button @click="resetSimulation">Сброс</button>
        </div>
        
        <div class="slider" v-for="setting in sliderSettings" :key="setting.name">
          <label>{{ setting.label }}: {{ settings[setting.name] }}{{ setting.unit || '' }}</label>
          <input
            type="range"
            v-model.number="settings[setting.name]"
            :min="setting.min"
            :max="setting.max"
            :step="setting.step"
            @input="updateSettings"
            :disabled="isSimulationRunning"
          >
        </div>

        <div class="slider">
          <label>Стартовый капитал: {{ startMoney }} ₽</label>
          <input
            type="range"
            v-model.number="startMoney"
            min="1000"
            max="10000"
            step="100"
            :disabled="isSimulationRunning"
          >
          <button @click="applyStartMoney">Применить</button>
        </div>

        <div v-if="warehouse.day % 5 === 0" class="truck">
          🚚
        </div>
      </div>

      <p>День: {{ warehouse.day }} | Деньги: {{ warehouse.money }}₽ | Мышей: {{ warehouse.miceCount }} | Моли: {{ warehouse.mothsCount }}</p>

      <div class="warehouse">
        <div v-for="(row, y) in warehouse.grid" :key="y" class="row">
          <div
            v-for="(cell, x) in row"
            :key="x"
            :class="['cell', cell.type, cell.status, cell.beingTreated ? 'smoke' : '']"
            @mouseover="showCellTooltip($event, cell)"
            @mouseleave="hideTooltip"
          >
            {{ cell.beingTreated ? '💨' : cell.emoji }}
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="price-controls">
        <h3>Цены при отгрузке</h3>
        <div class="slider" v-for="product in resourceTypes" :key="product">
          <label>{{ productName(product) }}: {{ productPrices[product] }} ₽</label>
          <input
            type="range"
            v-model.number="productPrices[product]"
            min="1"
            max="15"
            step="1"
            @input="updatePrices"
            :disabled="isSimulationRunning"
          >
        </div>
      </div>

      <div class="sales-history">
        <h3>История продаж и штрафов</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>День</th>
                <th v-for="product in resourceTypes" :key="product">
                  {{ productName(product) }}
                </th>
                <th>Завезено</th>
                <th>Вывезено</th>
                <th>Сумма</th>
                <th>Штраф</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in warehouse.salesHistory" :key="index">
                <td>{{ record.day }}</td>
                <td v-for="product in resourceTypes" :key="product">
                  {{ record.sales[product] || 0 }}
                </td>
                <td>{{ record.imported }}</td>
                <td>{{ record.exported }}</td>
                <td>{{ record.total }}₽</td>
                <td class="fine">{{ record.fine }}₽</td>
                <td :class="{'profit': record.profit >= 0, 'loss': record.profit < 0}">
                  {{ record.profit }}₽
                </td>
              </tr>
              <tr v-if="warehouse.salesHistory.length === 0">
                <td :colspan="resourceTypes.length + 6">Пока нет данных о продажах</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div v-if="tooltip.visible" class="tooltip" :style="{ left: tooltip.position.left, top: tooltip.position.top }">
      <div v-if="tooltip.content.type"><strong>Тип:</strong> {{ tooltip.content.type }}</div>
      <div v-if="tooltip.content.status"><strong>Состояние:</strong> {{ tooltip.content.status }}</div>
      <div v-if="tooltip.content.pestType"><strong>Вредитель:</strong> {{ tooltip.content.pestType }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { ProductType } from '@/types/index';

export default defineComponent({
  name: 'WarehouseGame',
  
  data() {
    return {
      startMoney: 1000,
      resourceTypes: ['wheat', 'soap', 'fabric', 'meat'] as ProductType[],
      sliderSettings: [
        { name: 'speed', label: 'Скорость симуляции', min: 100, max: 2000, step: 100, unit: ' мс' },
        { name: 'importAmount', label: 'Кол-во завозимых товаров', min: 1, max: 100, step: 1 },
        { name: 'exportAmount', label: 'Кол-во вывозимых товаров', min: 1, max: 100, step: 1 },
        { name: 'pestChance', label: 'Шанс появления вредителей', min: 0, max: 100, step: 5 },
        { name: 'treatmentAmount', label: 'Отравлений за ход', min: 1, max: 100, step: 1 },
        { name: 'rent', label: 'Аренда склада', min: 1, max: 100, step: 1, unit: ' ₽' },
        { name: 'poisonCost', label: 'Стоимость обработки', min: 5, max: 50, step: 1, unit: ' ₽' }
      ]
    };
  },
  
  setup() {
    const store = useWarehouseStore();
    return { store };
  },
  
  computed: {
    warehouse() {
      return this.store.warehouse;
    },
    settings() {
      return this.warehouse.settings;
    },
    isSimulationRunning(): boolean {
      return this.store.isRunning;
    },
    productPrices() {
      return this.warehouse.productPrices;
    },
    tooltip() {
      return this.store.tooltip;
    }
  },
  
  methods: {
    productName(type: ProductType): string {
      const names = {
        wheat: "Пшеница",
        soap: "Мыло",
        fabric: "Ткань",
        meat: "Мясо"
      };
      return names[type] || type;
    },
    
    startSimulation() {
      this.store.startSimulation();
    },
    
    stopSimulation() {
      this.store.stopSimulation();
    },
    
    resetSimulation() {
      this.store.resetSimulation();
      this.startMoney = 1000;
    },
    
    updateSettings() {
      this.store.updateSettings(this.settings);
    },
    
    updatePrices() {
      const prices: Record<ProductType, number> = { ...this.productPrices };
      this.store.updatePrices(prices);
    },
    
    applyStartMoney() {
      this.warehouse.money = this.startMoney;
    },
    
    showCellTooltip(event: MouseEvent, cell: any) {
      this.store.showTooltip(cell, event);
    },
    
    hideTooltip() {
      this.store.hideTooltip();
    }
  },
  
  created() {
    this.store.updateSettings({ importAmount: 10 });
  }
});
</script>

<style scoped>
.main-container {
  display: flex;
  gap: 20px;
  padding: 10px;
}

.left-panel {
  flex: 1;
  min-width: 0;
}

.right-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ProjectName h1 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 10px;
  color: #2f621f;
  text-shadow: 1px 1px 0 #cde8be;
}

.control {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: #f0fdf0;
  padding: 10px;
  border: 1px solid #b5e3af;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.button button {
  margin-right: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #7acb55;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.button button:hover {
  background-color: #5faa3e;
}

.slider {
  flex: 1 1 200px;
}

.warehouse {
  display: inline-block;
  border: 4px double #6b8e23;
  border-radius: 10px;
  background: linear-gradient(#d4f4c5, #c2edb8);
  padding: 10px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.row {
  display: flex;
  height: 40px;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ffffff55;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  border-radius: 4px;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
}

.cell.smoke {
  animation: puff 1s infinite;
}

@keyframes puff {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}

.cell.wheat {
  background-color: #f8f3d4;
}

.cell.soap {
  background-color: #d4f8f7;
}

.cell.fabric {
  background-color: #f8d4f0;
}

.cell.meat {
  background-color: #7bbfff;
}

.cell.stolen {
  background-color: #505050;
  font-style: italic;
}

.cell.empty {
  background-color: #e0e0e0;
}

.truck {
  position: fixed;
  bottom: -70px;
  transform: translateX(260%);
  font-size: 48px;
  z-index: 2000;
  animation: truckArriveLeave 1s ease-in-out forwards;
}

@keyframes truckArriveLeave {
  0% {
    bottom: -80px;
    opacity: 0;
  }
  25% {
    bottom: 250px;
    opacity: 1;
  }
  50% {
    bottom: 250px;
    opacity: 1;
  }
  75% {
    bottom: -80px;
    opacity: 1;
  }
  100% {
    bottom: -80px;
    opacity: 0;
  }
}

.price-controls {
  background: #f5f5f5;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.sales-history {
  background: #f5f5f5;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 600px;
  overflow-y: auto;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background-color: #7acb55;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

.fine {
  color: #ff4444;
  font-weight: bold;
}

.profit {
  color: #2e7d32;
  font-weight: bold;
}

.loss {
  color: #c62828;
  font-weight: bold;
}

.tooltip {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  max-width: 200px;
  font-size: 14px;
}

@media (max-width: 1500px) {
  .main-container {
    flex-direction: column;
  }
  
  .right-panel {
    width: 100%;
  }
  
  .sales-history {
    height: auto;
    max-height: 300px;
  }
}
</style>