import { Item } from "./DropItem";

const makeArayOfElements = (collection: HTMLCollection) => [
  ...(collection as unknown as HTMLElement[]),
];

export class Dropzone {
  container: HTMLElement;
  items: Item[]; // TODO - make properties private

  constructor(container: HTMLElement) {
    this.container = container;
    this.items = makeArayOfElements(container.children).map(
      (element) => new Item(this, element)
    );
  }

  get id() {
    return this.container.id;
  }

  allowStretching = () => (this.container.style.transition = "height .2s ease");

  indexOfItem = (item: Item) => this.items.indexOf(item);

  insertItemAt = (index: number, item: Item) => {
    this.items.splice(index, 0, item);
    item.updateDropzone(this);
  };

  removeItemAt = (index: number) => this.items.splice(index, 1);

  switchItemPosition = (from: number, to: number) =>
    this.insertItemAt(to, this.removeItemAt(from)[0]);

  isHoveringFreeSpaceNearItem = (item: Item, e: MouseEvent) => {
    const itemIndex = this.items.lastIndexOf(item);
    const nextItem = itemIndex === -1 ? null : this.items[itemIndex + 1];

    const isNextItemOnNextRow = nextItem?.rect().y !== item.rect().y;

    return isNextItemOnNextRow && item.hoveringNear(e);
  };
}

export default Dropzone;
