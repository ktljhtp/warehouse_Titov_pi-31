import { Cell } from "../models/Cell";
import { PestType, ProductType } from "../types";

export class PestManager {
  private lastThiefDay: number = 0;

  public spawnPests(
    grid: Cell[][], 
    chance: number, 
    maxPestsPerDay: number,
    healthyCount: number,
    currentDay: number
  ): void {
    if (healthyCount === 0) return;
    
    const baseChance = chance / 100;
    const pestsToSpawn = Math.min(
      1 + Math.floor(Math.random() * maxPestsPerDay),
      healthyCount
    );
    
    const healthyCells = grid.flat()
      .filter(cell => cell.status === 'healthy');
    
    let spawnedCount = 0;
    
    // Спавн воров
    if (healthyCells.length > 0 && currentDay - this.lastThiefDay >= 5) {
      const thiefChance = baseChance * 0.5;
      if (Math.random() < thiefChance) {
        const meatCells = healthyCells.filter(cell => cell.type === 'meat');
        if (meatCells.length > 0) {
          const randomIndex = Math.floor(Math.random() * meatCells.length);
          const cell = meatCells[randomIndex];
          cell.infect('thief');
          spawnedCount++;
          this.lastThiefDay = currentDay;
          healthyCells.splice(randomIndex, 1);
        }
      }
    }
    
    // Спавн обычных вредителей
    while (spawnedCount < pestsToSpawn && healthyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * healthyCells.length);
      const cell = healthyCells[randomIndex];
      
      const { pestType, infectChance } = this.determinePestParams(cell.type as ProductType, baseChance);
      
      if (Math.random() < infectChance) {
        cell.infect(pestType);
        spawnedCount++;
      }
      
      healthyCells.splice(randomIndex, 1);
    }
  }

  private determinePestParams(
    resourceType: ProductType, 
    baseChance: number
  ): { pestType: PestType, infectChance: number } {
    switch (resourceType) {
      case 'wheat':
        const pestTypeWheat: PestType = Math.random() < 0.7 ? 'mouse' : 'moth';
        return {
          pestType: pestTypeWheat,
          infectChance: pestTypeWheat === 'mouse' ? baseChance : baseChance * 0.3
        };
      case 'soap':
        return {
          pestType: 'mouse',
          infectChance: baseChance * 0.5
        };
      case 'fabric':
        const pestTypeFabric: PestType = Math.random() < 0.2 ? 'mouse' : 'moth';
        return {
          pestType: pestTypeFabric,
          infectChance: pestTypeFabric === 'mouse' ? baseChance * 0.2 : baseChance * 0.8
        };
      default:
        return {
          pestType: 'mouse',
          infectChance: 0
        };
    }
  }
}