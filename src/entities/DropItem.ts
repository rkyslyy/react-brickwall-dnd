import { Dropzone } from "./Dropzone";

export interface Offset {
  xOffset: number;
  yOffset: number;
}

export class Item {
  dropzone: Dropzone;
  self: HTMLElement;

  constructor(dropzone: Dropzone, element: HTMLElement) {
    this.dropzone = dropzone;
    this.self = element;
  }

  animateIf = (condition: boolean) =>
    (this.self.style.transition = condition ? "all .15s ease" : "");

  applyMouseDownStyle = (event: MouseEvent) => {
    this.self.style.cursor = "grabbing";
    this.self.style.transition = "";
    this.self.style.zIndex = "9999";
    this.move(event);
  };

  hoveringNear = ({ clientX, clientY }: MouseEvent) => {
    const { right, y } = this.rect();

    return (
      clientX > right &&
      clientX < this.dropzone.container.getBoundingClientRect().right &&
      clientY > y &&
      clientY < this.dropzone.container.getBoundingClientRect().bottom
    );
  };

  isHovered = ({ clientX, clientY }: MouseEvent) => {
    const { x, y, right, bottom } = this.rect();
    return clientX > x && clientX < right && clientY > y && clientY < bottom;
  };

  isLeftSideHovered = ({ clientX }: MouseEvent) => {
    const { x, width } = this.rect();
    return clientX < x + width / 2;
  };

  getFullWidth = () =>
    this.self.scrollWidth +
    (parseInt(this.self.style.borderLeft || "0") +
      parseInt(this.self.style.borderRight || "0"));

  getCurrentDropzone = () => this.dropzone;

  getRealParent = () => this.self.parentElement;

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
    this.self.style.marginLeft = `${dropzoneOffset.xOffset + realParentOffset.xOffset}px`;
    this.self.style.marginTop = `${dropzoneOffset.yOffset + realParentOffset.yOffset}px`;
    this.self.style.cursor = "grab";
  };

  move = (event: MouseEvent) => {
    const { xOffset, yOffset } = this.getRealParentOffset();
    this.self.style.marginLeft = `${
      event.clientX -
      this.self.clientWidth / 2 -
      this.dropzone.container.getBoundingClientRect().x +
      xOffset
    }px`;
    this.self.style.marginTop = `${
      event.clientY -
      this.self.clientHeight / 2 -
      this.dropzone.container.getBoundingClientRect().y +
      yOffset
    }px`;
  };

  rect = () => this.self.getBoundingClientRect();

  updateDropzone = (newDropzone: Dropzone) => (this.dropzone = newDropzone);
}

export default Item;
