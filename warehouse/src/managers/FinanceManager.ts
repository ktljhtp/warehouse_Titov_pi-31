import { ProductType, ProductPrices } from "@/types";
import { Cell } from "@/models/Cell";

export class FinanceManager {
  private productPrices: ProductPrices = {
    wheat: 2,
    soap: 4,
    fabric: 3,
    meat: 8
  };

  public setPrice(product: ProductType, price: number): void {
    this.productPrices[product] = price;
  }

  public getPrices(): ProductPrices {
    return { ...this.productPrices };
  }

  public getPrice(product: ProductType): number {
    return this.productPrices[product];
  }

  public calculateShipmentValue(cells: Cell[]): number {
    console.log("Калькуляция стоимости отправки", cells.map(c => c.type));
  return cells.reduce((sum, cell) => {
    const price = this.getPrice(cell.type as ProductType);
    console.log(`Товар: ${cell.type}, Цена: ${price}`);
    return sum + price;
  }, 0);
  }

  private isSellableProduct(type: string): type is ProductType {
    return ['wheat', 'soap', 'fabric', 'meat'].includes(type);
  }

  public processDailyCosts(warehouse: any, rent: number): void {
    warehouse.money = Math.max(0, warehouse.money - rent);
  }
}