import { DEFAULT_ANIMATION_SPEED } from "../constants";
import { Dropzone } from "./Dropzone";

export interface Offset {
  xOffset: number;
  yOffset: number;
}

export const MOUSE_DOWN_STYLE = {
  cursor: "grabbing",
  transition: "",
  zIndex: "9999",
};

export const DEFAULT_STYLE = {
  zIndex: "1",
  cursor: "grab",
};

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

  toggleAnimation = (enabled: boolean, animationSpeed?: number) =>
    (this.itemElement.style.transition = enabled
      ? `all .${animationSpeed || DEFAULT_ANIMATION_SPEED}s ease`
      : "");

  applyMouseDownStyle = (event: MouseEvent) => {
    Object.assign(this.itemElement.style, MOUSE_DOWN_STYLE);

    this.moveOnScreen(event);
  };

  applyDefaultStyle = (animationSpeed: number) => {
    Object.assign(this.itemElement.style, DEFAULT_STYLE);

    this.toggleAnimation(true, animationSpeed);
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
    ((parseInt(this.itemElement.style.borderLeft) || 0) +
      (parseInt(this.itemElement.style.borderRight) || 0));

  getOriginalParent = () => this.itemElement.parentElement;

  getOriginalParentOffset = (): Offset => ({
    xOffset: this.dropzone.rect.x - (this.getOriginalParent()?.getBoundingClientRect().x || 0),
    yOffset: this.dropzone.rect.y - (this.getOriginalParent()?.getBoundingClientRect().y || 0),
  });

  getPositionInDropzone = (dropzone: Dropzone) => dropzone.items.indexOf(this);

  applyDropzoneOffset = (dropzoneOffset: Offset) => {
    const originalParentOffset = this.getOriginalParentOffset();

    this.itemElement.style.marginLeft = `${
      dropzoneOffset.xOffset + originalParentOffset.xOffset
    }px`;
    this.itemElement.style.marginTop = `${
      dropzoneOffset.yOffset + originalParentOffset.yOffset
    }px`;
    this.itemElement.style.cursor = "grab";
  };

  moveOnScreen = (event: MouseEvent) => {
    const { xOffset, yOffset } = this.getOriginalParentOffset();

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
