import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  private sidebars: any = [];
  constructor() {}
  public add(sidebar: any): void {
    this.sidebars.push(sidebar);
  }
  public remove(id: string): void {
    this.sidebars = this.sidebars.filter((x: any) => x.id !== id);
  }
  public open(id: string): void {
    const sidebar: any = this.sidebars.filter((x: any) => x.id === id)[0];
    sidebar.open();
  }
  public close(id: string): void {
    const sidebar: any = this.sidebars.filter((x: any) => x.id === id)[0];
    sidebar.close();
  }
}
