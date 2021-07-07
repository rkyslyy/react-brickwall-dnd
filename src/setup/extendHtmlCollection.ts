export {};

declare global {
  interface HTMLCollection {
    array(this: HTMLCollection): HTMLElement[];
  }
}

HTMLCollection.prototype.array = function (this: HTMLCollection): HTMLElement[] {
  return [...(this as unknown as HTMLElement[])];
};
