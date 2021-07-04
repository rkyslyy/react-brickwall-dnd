import { Dropzone } from "./Dropzone";

export interface Offset {
  xOffset: number;
  yOffset: number;
}

export class Item {
  dropzone: Dropzone;
  itemElement: HTMLElement;

  constructor(dropzone: Dropzone, element: HTMLElement) {
    this.dropzone = dropzone;
    this.itemElement = element;
  }

  get rect() {
    return this.itemElement.getBoundingClientRect();
  }

  toggleAnimation = (enabled: boolean, animationSpeed: number) => {
    this.itemElement.style.transition = enabled ? `all .${animationSpeed}s ease` : "";
  };

  applyMouseDownStyle = (event: MouseEvent) => {
    this.itemElement.style.cursor = "grabbing";
    this.itemElement.style.transition = "";
    this.itemElement.style.zIndex = "9999";

    this.move(event);
  };

  applyDefaultStyle = (animationSpeed: number) => {
    this.itemElement.style.zIndex = "1";
    this.itemElement.style.cursor = "grab";
    this.toggleAnimation(true, animationSpeed);
  };

  hoveringNear = ({ clientX, clientY }: MouseEvent) => {
    const { right, y } = this.rect;

    return (
      clientX > right &&
      clientX < this.dropzone.container.getBoundingClientRect().right &&
      clientY > y &&
      clientY < this.dropzone.container.getBoundingClientRect().bottom
    );
  };

  isHovered = ({ clientX, clientY }: MouseEvent) => {
    const { x, y, right, bottom } = this.rect;
    return clientX > x && clientX < right && clientY > y && clientY < bottom;
  };

  isLeftSideHovered = ({ clientX }: MouseEvent) => {
    const { x, width } = this.rect;
    return clientX < x + width / 2;
  };

  getFullWidth = () =>
    this.itemElement.scrollWidth +
    (parseInt(this.itemElement.style.borderLeft || "0") +
      parseInt(this.itemElement.style.borderRight || "0"));

  getCurrentDropzone = () => this.dropzone;

  getRealParent = () => this.itemElement.parentElement;

  getRealParentOffset = (): Offset => {
    return {
      xOffset:
        this.dropzone.container.getBoundingClientRect().x -
        (this.getRealParent()?.getBoundingClientRect().x || 0),
      yOffset:
        this.dropzone.container.getBoundingClientRect().y -
        (this.getRealParent()?.getBoundingClientRect().y || 0),
    };
  };

  getPositionInDropzone = (dropzone: Dropzone) => dropzone.items.indexOf(this);

  placeInDropzone = (dropzoneOffset: Offset) => {
    const realParentOffset = this.getRealParentOffset();
    this.itemElement.style.marginLeft = `${
      dropzoneOffset.xOffset + realParentOffset.xOffset
    }px`;
    this.itemElement.style.marginTop = `${
      dropzoneOffset.yOffset + realParentOffset.yOffset
    }px`;
    this.itemElement.style.cursor = "grab";
  };

  move = (event: MouseEvent) => {
    const { xOffset, yOffset } = this.getRealParentOffset();
    this.itemElement.style.marginLeft = `${
      event.clientX -
      this.itemElement.clientWidth / 2 -
      this.dropzone.container.getBoundingClientRect().x +
      xOffset
    }px`;
    this.itemElement.style.marginTop = `${
      event.clientY -
      this.itemElement.clientHeight / 2 -
      this.dropzone.container.getBoundingClientRect().y +
      yOffset
    }px`;
  };

  updateDropzone = (newDropzone: Dropzone) => (this.dropzone = newDropzone);
}

export default Item;
