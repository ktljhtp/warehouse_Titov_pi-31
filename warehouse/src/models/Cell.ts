import { Product } from "./Product";
import { PestType, ProductType } from "@/types";

export class Cell {
  public product: Product;

  constructor(
    public readonly x: number,
    public readonly y: number,
    initialType: ProductType | 'empty' = 'empty'
  ) {
    this.product = new Product(initialType);
  }

  public update(): void {
    this.product.update();
  }

  public infect(pestType: PestType): void {
    this.product.infect(pestType);
  }

  public startTreatment(): void {
    this.product.startTreatment();
  }

  public finishTreatment(): void {
    this.product.finishTreatment();
  }

  public get emoji(): string {
    return this.product.emoji;
  }

  public get status(): string {
    return this.product.status;
  }

  public get type(): string {
    return this.product.type;
  }

  public get pestType(): PestType | null {
    return this.product.pestType;
  }

  public get beingTreated(): boolean {
    return this.product.beingTreated;
  }

  public get daysInfected(): number {
    return this.product.daysInfected;
  }
}