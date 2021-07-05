import { DEFAULT_MIN_HEIGHT } from "../constants";
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

    this.setMinHeight();
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

  get rect() {
    return this.container.getBoundingClientRect();
  }

  private setMinHeight = () => {
    if (!this.container.style.minHeight)
      this.container.style.minHeight = `${DEFAULT_MIN_HEIGHT}px`;
  };

  allowStretching = (animationSpeed: number) =>
    (this.container.style.transition = `height .${animationSpeed}s ease`);

  indexOfItem = (item: Item) => this.items.indexOf(item);

  insertItemAt = (index: number, item: Item) => {
    this.items.splice(index, 0, item);
    item.updateDropzone(this);
  };

  removeItemAt = (index: number) => this.items.splice(index, 1);

  switchItemPosition = (from: number, to: number) =>
    this.insertItemAt(to, this.removeItemAt(from)[0]);

  isHoveringAvailableSpaceNearItem = (item: Item, e: MouseEvent) => {
    const itemIndex = this.indexOfItem(item);
    const nextItem = itemIndex === -1 ? null : this.items[itemIndex + 1];

    const isNextItemOnNextRow = nextItem?.rect.y !== item.rect.y;

    return isNextItemOnNextRow && this.isHoveringNearItem(e, item);
  };

  isHoveringNearItem = ({ clientX, clientY }: MouseEvent, item: Item) => {
    const { right, y } = item.rect;

    return (
      clientX > right && clientX < this.rect.right && clientY > y && clientY < this.rect.bottom
    );
  };

  repositionItems = (
    animated: boolean,
    animationSpeed: number,
    gridGap: number,
    draggedItem: Item | null
  ) => {
    const maxWidth = this.container.clientWidth;

    let xOffset = gridGap;
    let yOffset = gridGap;
    let resultingContainerHeight = parseInt(this.container.style.minHeight);

    this.items.forEach((item) => {
      // Decide if we want to render this item near left edge and below current row
      if (xOffset + item.getFullWidth() + gridGap > maxWidth) {
        xOffset = gridGap;
        yOffset = resultingContainerHeight;
      }

      // Dragged item should change location without transition effect
      const shouldAnimateItemPositioning = animated && item !== draggedItem;
      item.toggleAnimation(shouldAnimateItemPositioning, animationSpeed);

      item.applyDropzoneOffset({ xOffset, yOffset });

      // Get horizonral offset for next item
      xOffset += item.getFullWidth() + gridGap;

      // Extend resulting container height if item won't fit in current row
      if (item.rect.height + yOffset > resultingContainerHeight)
        resultingContainerHeight = yOffset + item.rect.height + gridGap;
    });

    // Extend container height
    this.container.style.height = `${resultingContainerHeight}px`;
  };

  isEmptyAndHovered = (e: MouseEvent) => {
    const isDropzoneEmpty = !this.items.length;
    const isCursorInsideDropzone =
      e.clientX > this.container.getBoundingClientRect().x &&
      e.clientX < this.container.getBoundingClientRect().right &&
      e.clientY > this.container.getBoundingClientRect().y &&
      e.clientY < this.container.getBoundingClientRect().bottom;

    return isDropzoneEmpty && isCursorInsideDropzone;
  };
}

export default Dropzone;
