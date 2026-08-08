import { SupplierAdapter } from './supplier.adapter.js';
import { AliExpressAdapter } from './adapters/aliexpress.adapter.js';
import { ManualAdapter } from './adapters/manual.adapter.js';

export class SupplierRegistry {
  private static adapters: Map<string, SupplierAdapter> = new Map();
  
  static register(adapter: SupplierAdapter) {
    this.adapters.set(adapter.name.toUpperCase(), adapter);
  }
  
  static get(name: string): SupplierAdapter | undefined {
    return this.adapters.get(name.toUpperCase());
  }
  
  static getAll(): SupplierAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  static initialize() {
    this.register(new AliExpressAdapter());
    this.register(new ManualAdapter());
  }
}
