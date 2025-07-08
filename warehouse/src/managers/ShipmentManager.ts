import { Cell } from "@/models/Cell";
import { ProductType } from "@/types";
import { FinanceManager } from "./FinanceManager";
import { Product } from "@/models/Product";

export class ShipmentManager {
  constructor(private financeManager: FinanceManager) {}

  public importGoods(grid: Cell[][], amount: number): void {
  const height = grid.length; // 10 строк (0-9)
  const productZones = {
    wheat: { start: 6, end: 9 }, // Нижние 3 строки (7-9 в нумерации с 1)
    soap: { start: 3, end: 6 },  // Следующие 3 строки (4-6)
    fabric: { start: 0, end: 3 }, // Верхние 3 строки (1-3)
    meat: { start: 9, end: 10 }   // Самая нижняя строка (10)
  };

  let imported = 0;
  
  // Идем по столбцам слева направо
  for (let x = 0; x < grid[0].length && imported < amount; x++) {
    // Заполняем столбец снизу вверх
    for (let y = height - 1; y >= 0 && imported < amount; y--) {
      if (grid[y][x].status === 'empty') {
        // Определяем тип товара по строке
        let productType: ProductType;
        
        if (y >= productZones.wheat.start && y < productZones.wheat.end) {
          productType = 'wheat';
        } else if (y >= productZones.soap.start && y < productZones.soap.end) {
          productType = 'soap';
        } else if (y >= productZones.fabric.start && y < productZones.fabric.end) {
          productType = 'fabric';
        } else {
          productType = 'meat';
        }

        grid[y][x].product = new Product(productType);
        imported++;
      }
    }
  }
}


  public exportGoods(
  grid: Cell[][], 
  amount: number
): { value: number; exported: number; details: Record<ProductType, number> } {
  const details: Record<ProductType, number> = {
    wheat: 0,
    soap: 0,
    fabric: 0,
    meat: 0
  };
  
  let exported = 0;
  let totalValue = 0;
  const width = grid[0].length;

  // Идем по столбцам СПРАВА НАЛЕВО (изменение)
  for (let x = width - 1; x >= 0 && exported < amount; x--) {
    // Внутри столбца идем снизу вверх (как при завозе)
    for (let y = grid.length - 1; y >= 0 && exported < amount; y--) {
      const cell = grid[y][x];
      
      if (cell.status === 'healthy' && this.isProductType(cell.type)) {
        details[cell.type]++;
        totalValue += this.financeManager.getPrice(cell.type);
        cell.product = new Product('empty');
        exported++;
      }
    }
  }

  return {
    value: totalValue,
    exported,
    details
  };
}

private isProductType(type: string): type is ProductType {
  return ['wheat', 'soap', 'fabric', 'meat'].includes(type);
}
}