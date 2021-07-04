import { DropItem } from "./DropItem";

const makeArayOfElements = (collection: HTMLCollection) => [
  ...(collection as unknown as HTMLElement[]),
];

export class Dropzone {
  container: HTMLElement;
  items: DropItem[]; // TODO - make properties private

  constructor(container: HTMLElement) {
    this.container = container;
    this.items = makeArayOfElements(container.children).map(
      (element) => new DropItem(this, element)
    );
  }

  get id() {
    return this.container.id;
  }

  allowStretching = () => (this.container.style.transition = "height .2s ease");

  indexOfItem = (item: DropItem) => this.items.indexOf(item);

  insertItemAt = (index: number, item: DropItem) => {
    this.items.splice(index, 0, item);
    item.updateDropzone(this);
  };

  removeItemAt = (index: number) => this.items.splice(index, 1);

  switchItemPosition = (from: number, to: number) =>
    this.insertItemAt(to, this.removeItemAt(from)[0]);
}

export default Dropzone;
