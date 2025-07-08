import { ProductType, PestType, CellStatus } from "@/types";

export class Product {
  constructor(
    public type: ProductType | 'empty' | 'spoiled' | 'stolen',
    public value: number = 0,
    public daysInfected: number = 0,
    public pestType: PestType | null = null,
    public beingTreated: boolean = false
  ) {
    this.calculateValue();
  }

  private calculateValue(): void {
    const baseValues: Record<string, number> = {
      wheat: 2,
      soap: 4,
      fabric: 3,
      meat: 8,
      empty: 0,
      spoiled: 0,
      stolen: 0
    };
    this.value = baseValues[this.type] || 0;
  }

  public infect(pestType: PestType): void {
    if (this.type !== 'empty' && this.pestType === null) {
      this.pestType = pestType;
      this.daysInfected = 0;
    }
  }

  public startTreatment(): void {
    if (this.pestType) {
      this.beingTreated = true;
    }
  }

  public finishTreatment(): void {
    this.beingTreated = false;
    this.pestType = null;
    this.daysInfected = 0;
  }

  public update(): void {
  if (this.pestType && !this.beingTreated) {
    this.daysInfected++;

    const spoilThreshold = this.pestType === 'thief' ? 1 : 3;

    if (this.daysInfected >= spoilThreshold) {
      // Вместо превращения в испорченный/украденный — очищаем ячейку
      this.type = 'empty';
      this.pestType = null;
      this.daysInfected = 0;
    }
  }
}


  public get emoji(): string {
    if (this.pestType) {
      if (this.pestType === 'mouse') return '🐀';
      if (this.pestType === 'moth') return '🦋';
      if (this.pestType === 'thief') return '🕴️';
    }
    
    if (this.type === 'spoiled') return '💀';
    if (this.type === 'stolen') return '🕵️‍♂️';
    if (this.type === 'empty') return '⬜';
    
    return this.type === 'wheat' ? '🌾' :
           this.type === 'soap' ? '🧼' :
           this.type === 'fabric' ? '🧵' :
           this.type === 'meat' ? '🍖' : '⬜';
  }

  public get status(): CellStatus {
    if (this.type === 'empty') return 'empty';
    if (this.type === 'spoiled') return 'spoiled';
    if (this.type === 'stolen') return 'stolen';
    return this.pestType ? 'infected' : 'healthy';
  }
}