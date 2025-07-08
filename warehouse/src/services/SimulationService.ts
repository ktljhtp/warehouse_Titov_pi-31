import { Warehouse } from "@/models/Warehouse";
import { SimulationSettings, ProductPrices } from "@/types";

export class SimulationService {
  private warehouse: Warehouse;
  private timer: any = null;
  public  isRunning: boolean = false;

  constructor() {
    this.warehouse = new Warehouse();
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.runSimulationCycle();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public reset(): void {
    this.stop();
    this.warehouse.reset();
  }

  private runSimulationCycle(): void {
    if (!this.isRunning) return;
  
  this.warehouse.simulateDay();
  
  if (this.warehouse.money <= 0) {
    this.stop();
    return;
  }
  
  // Инвертируем значение скорости (2000 - rawSpeed + 100)
  const actualDelay = 2100 - this.warehouse.settings.speed;
  this.timer = setTimeout(
    () => this.runSimulationCycle(), 
    actualDelay
  );
  }

  public getWarehouse(): Warehouse {
    return this.warehouse;
  }

  public updateSettings(settings: Partial<SimulationSettings>): void {
    this.warehouse.updateSettings(settings);
    if (settings.speed !== undefined && this.isRunning) {
    this.stop();
    this.start();
  }
  }

  public updatePrices(prices: Partial<ProductPrices>): void {
    this.warehouse.updatePrices(prices);
  }
}