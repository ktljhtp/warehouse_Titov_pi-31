import { Cell } from "./Cell";
import { PestManager } from "../managers/PestManager";
import { FinanceManager } from "../managers/FinanceManager";
import { ShipmentManager } from "../managers/ShipmentManager";
import { SimulationSettings, ProductPrices, ProductType } from "../types";

export class Warehouse {
  public grid: Cell[][];
  public day: number = 1;
  public money: number;
  public salesHistory: any[] = [];
  public settings: SimulationSettings;
  public productPrices: ProductPrices;

  private pestManager = new PestManager();
  private financeManager = new FinanceManager();
  private shipmentManager = new ShipmentManager(this.financeManager);

  constructor(
    width: number = 10,
    height: number = 10,
    initialMoney: number = 1000
  ) {
    this.money = initialMoney;
    this.grid = this.initializeGrid(width, height);
    
    this.settings = {
      speed: 1000,
      pestChance: 30,
      treatmentAmount: 3,
      rent: 5,
      poisonCost: 20,
      importAmount: 10,
      exportAmount: 10
    };
    
    this.productPrices = { ...this.financeManager.getPrices() };
  }

  private initializeGrid(width: number, height: number): Cell[][] {
    return Array(height).fill(null).map((_, y) =>
      Array(width).fill(null).map((_, x) => 
        new Cell(x, y)
      )
    );
  }

  public updateSettings(settings: Partial<SimulationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  public updatePrices(prices: Partial<ProductPrices>): void {
  this.productPrices = { ...this.productPrices, ...prices };
  
  // Используем явную проверку ключей
  const validKeys: ProductType[] = ['wheat', 'soap', 'fabric', 'meat'];
  
  for (const [product, price] of Object.entries(prices)) {
    if (validKeys.includes(product as ProductType)) {
      this.financeManager.setPrice(product as ProductType, price);
    }
  }
}

  public simulateDay(): void {
    this.day++;
    
    this.grid.forEach(row => row.forEach(cell => {
      if (cell.beingTreated) cell.finishTreatment();
      cell.update();
    }));
    
    this.financeManager.processDailyCosts(this, this.settings.rent);
    
    this.treatPests();
    
    if (this.day > 5) {
      const healthyCount = this.grid.flat().filter(cell => cell.status === 'healthy').length;
      this.pestManager.spawnPests(
        this.grid, 
        this.settings.pestChance, 
        5,
        healthyCount,
        this.day
      );
    }
    
    if (this.day % 5 === 0) {
      if (this.day % 10 === 5) {
        this.shipmentManager.importGoods(this.grid, this.settings.importAmount);
      } 
      else if (this.day % 10 === 0) {
        this.processShipment();
      }
    }
  }

  private treatPests(): void {
    const infectedCells = this.grid.flat()
      .filter(cell => cell.status === 'infected')
      .sort((a, b) => {
        if (a.pestType === 'thief') return -1;
        if (b.pestType === 'thief') return 1;
        return b.daysInfected - a.daysInfected;
      });
    
    if (this.money < this.settings.poisonCost || infectedCells.length === 0) {
      return;
    }
    
    const cellsToTreat = Math.min(
      this.settings.treatmentAmount,
      infectedCells.length,
      Math.floor(this.money / this.settings.poisonCost)
    );
    
    for (let i = 0; i < cellsToTreat; i++) {
      infectedCells[i].startTreatment();
    }
    
    this.money -= cellsToTreat * this.settings.poisonCost;
  }

  private processShipment(): void {
  const { value, exported, details } = this.shipmentManager.exportGoods(
    this.grid, 
    this.settings.exportAmount
  );
  
  const fine = (this.settings.exportAmount - exported) * 10;
  
  this.salesHistory.push({
    day: this.day,
    sales: { ...details },
    imported: this.settings.importAmount,
    exported,
    total: value,
    fine
  });
  

  this.money += value - fine; 
}

  public reset(): void {
    this.day = 1;
    this.money = 1000;
    this.salesHistory = [];
    this.grid = this.initializeGrid(10, 10);
    
    this.settings = {
      speed: 1000,
      pestChance: 30,
      treatmentAmount: 3,
      rent: 5,
      poisonCost: 20,
      importAmount: 10,
      exportAmount: 10
    };
    
    this.updatePrices({
      wheat: 2,
      soap: 4,
      fabric: 3,
      meat: 8
    });
  }

  public get miceCount(): number {
    return this.grid.flat().filter(cell => 
      cell.status === 'infected' && cell.pestType === 'mouse').length;
  }

  public get mothsCount(): number {
    return this.grid.flat().filter(cell => 
      cell.status === 'infected' && cell.pestType === 'moth').length;
  }

  public get healthyCount(): number {
    return this.grid.flat().filter(cell => cell.status === 'healthy').length;
  }

  public get emptyCount(): number {
    return this.grid.flat().filter(cell => cell.status === 'empty').length;
  }
}