import { DropZone } from "./DropZone";

export interface Offset {
  xOffset: number;
  yOffset: number;
}

export class DropItem {
  dropZone: DropZone;
  self: HTMLElement;

  constructor(dropZone: DropZone, element: HTMLElement) {
    this.dropZone = dropZone;
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
      clientX < this.dropZone.container.getBoundingClientRect().right &&
      clientY > y &&
      clientY < this.dropZone.container.getBoundingClientRect().bottom
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

  getCurrentDropZone = () => this.dropZone;

  getRealParent = () => this.self.parentElement;

  getRealParentOffset = (): Offset => {
    return {
      xOffset:
        this.dropZone.container.getBoundingClientRect().x -
        (this.getRealParent()?.getBoundingClientRect().x || 0),
      yOffset:
        this.dropZone.container.getBoundingClientRect().y -
        (this.getRealParent()?.getBoundingClientRect().y || 0),
    };
  };

  getPositionInDropZone = (dropZone: DropZone) => dropZone.items.indexOf(this);

  landInDropZone = (dropZoneOffset: Offset) => {
    const realParentOffset = this.getRealParentOffset();
    this.self.style.marginLeft = `${dropZoneOffset.xOffset + realParentOffset.xOffset}px`;
    this.self.style.marginTop = `${dropZoneOffset.yOffset + realParentOffset.yOffset}px`;
    this.self.style.cursor = "grab";
  };

  move = (event: MouseEvent) => {
    const { xOffset, yOffset } = this.getRealParentOffset();
    this.self.style.marginLeft = `${
      event.clientX -
      this.self.clientWidth / 2 -
      this.dropZone.container.getBoundingClientRect().x +
      xOffset
    }px`;
    this.self.style.marginTop = `${
      event.clientY -
      this.self.clientHeight / 2 -
      this.dropZone.container.getBoundingClientRect().y +
      yOffset
    }px`;
  };

  rect = () => this.self.getBoundingClientRect();

  updateDropZone = (newDropZone: DropZone) => (this.dropZone = newDropZone);
}
