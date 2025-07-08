import { defineStore } from 'pinia';
import { SimulationService } from "@/services/SimulationService";
import { Cell } from "@/models/Cell";
import type { 
  SimulationSettings, 
  ProductPrices 
} from "@/types";

export const useWarehouseStore = defineStore('warehouse', {
  state: () => ({
    simulation: new SimulationService(),
    tooltip: {
      visible: false,
      content: { type: '', status: '', pestType: '' },
      position: { left: '0px', top: '0px' }
    }
  }),
  getters: {
    warehouse: (state) => state.simulation.getWarehouse(),
    // Теперь свойство isRunning доступно
    isRunning: (state) => state.simulation.isRunning
  },
  actions: {
    startSimulation() {
      this.simulation.start();
    },
    stopSimulation() {
      this.simulation.stop();
    },
    resetSimulation() {
      this.simulation.reset();
    },
    updateSettings(settings: Partial<SimulationSettings>) {
      this.simulation.updateSettings(settings);
    },
    updatePrices(prices: Partial<ProductPrices>) {
      this.simulation.updatePrices(prices);
    },
    showTooltip(cell: Cell, event: MouseEvent) {
      const statusMap: Record<string, string> = {
        'healthy': 'Здоров',
        'infected': 'Заражен',
        'spoiled': 'Испорчен',
        'stolen': 'Украдено',
        'empty': 'Пустая'
      };
      
      const typeMap: Record<string, string> = {
        'wheat': "Пшеница",
        'soap': "Мыло",
        'fabric': "Ткань",
        'meat': "Мясо",
        'empty': "Пусто",
        'spoiled': "Испорчено",
        'stolen': "Украдено"
      };
      
      const pestMap: Record<string, string> = {
        'mouse': "Мышь",
        'moth': "Моль",
        'thief': "Вор"
      };
      
      this.tooltip.content = {
        type: typeMap[cell.type] || '',
        status: statusMap[cell.status] || '',
        pestType: cell.pestType ? pestMap[cell.pestType] : ''
      };
      
      this.tooltip.position = {
        left: `${event.clientX + 10}px`,
        top: `${event.clientY + 10}px`
      };
      
      this.tooltip.visible = true;
    },
    hideTooltip() {
      this.tooltip.visible = false;
    }
  }
});