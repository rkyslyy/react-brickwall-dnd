import { Item } from "./Item";

const makeArayOfElements = (collection: HTMLCollection) => [
  ...(collection as unknown as HTMLElement[]),
];

export class Dropzone {
  private _container: HTMLElement;
  private _items: Item[];

  constructor(container: HTMLElement) {
    this._container = container;
    this._items = makeArayOfElements(container.children).map(
      (element) => new Item(this, element)
    );
  }

  get id() {
    return this._container.id;
  }

  get container() {
    return this._container;
  }

  get items() {
    return this._items;
  }

  allowStretching = () => (this._container.style.transition = "height .2s ease");

  indexOfItem = (item: Item) => this._items.indexOf(item);

  insertItemAt = (index: number, item: Item) => {
    this._items.splice(index, 0, item);
    item.updateDropzone(this);
  };

  removeItemAt = (index: number) => this._items.splice(index, 1);

  switchItemPosition = (from: number, to: number) =>
    this.insertItemAt(to, this.removeItemAt(from)[0]);

  isHoveringFreeSpaceNearItem = (item: Item, e: MouseEvent) => {
    const itemIndex = this._items.lastIndexOf(item);
    const nextItem = itemIndex === -1 ? null : this._items[itemIndex + 1];

    const isNextItemOnNextRow = nextItem?.rect().y !== item.rect().y;

    return isNextItemOnNextRow && item.hoveringNear(e);
  };
}

export default Dropzone;
