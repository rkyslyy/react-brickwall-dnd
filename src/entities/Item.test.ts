import { DEFAULT_ANIMATION_SPEED } from "../constants";
import { Dropzone } from "./Dropzone";
import { DEFAULT_STYLE, Item, MOUSE_DOWN_STYLE } from "./Item";

describe("Item", () => {
  let dropzoneElement: HTMLElement;
  let itemElement: HTMLElement;

  let dropzone: Dropzone;
  let item: Item;
  let mouseEvent: MouseEvent;

  beforeEach(() => {
    dropzoneElement = document.createElement("div");
    dropzoneElement.style.width = "500px";
    dropzoneElement.style.height = "400px";

    itemElement = document.createElement("div");
    itemElement.style.width = "100px";
    itemElement.style.height = "50px";

    dropzone = new Dropzone(dropzoneElement);
    item = new Item(dropzone, itemElement);
    mouseEvent = new MouseEvent("mousemove");
  });

  describe("toggleAnimation()", () => {
    it("should correctly enable animation", () => {
      const animationSpeed = 300;

      item.toggleAnimation(true, animationSpeed);
      expect(itemElement.style.transition).toEqual(`all .${animationSpeed}s ease`);

      item.toggleAnimation(true);
      expect(itemElement.style.transition).toEqual(`all .${DEFAULT_ANIMATION_SPEED}s ease`);
    });

    it("should correctly disable animation", () => {
      itemElement.style.transition = "all 1s ease";

      item.toggleAnimation(false);

      expect(itemElement.style.transition).toEqual("");
    });
  });

  describe("applyMouseDownStyle()", () => {
    it("should set all MOUSE_DOWN_STYLE props to itemElement.style and call Item.protoptype.move() with passed event", () => {
      jest.spyOn(item, "moveOnScreen");
      item.applyMouseDownStyle(mouseEvent);

      Object.keys(MOUSE_DOWN_STYLE).forEach((key) =>
        expect(itemElement.style[key]).toEqual(MOUSE_DOWN_STYLE[key])
      );
      expect(item.moveOnScreen).toHaveBeenCalledWith(mouseEvent);
    });
  });

  describe("applyDefaultStyle()", () => {
    it("should set all DEFAULT_STYLE props to itemElement.style and call Item.protoptype.toggleAnimation() with passed animationSpeed", () => {
      const animationSpeed = 300;

      jest.spyOn(item, "toggleAnimation");
      item.applyDefaultStyle(animationSpeed);

      Object.keys(DEFAULT_STYLE).forEach((key) =>
        expect(itemElement.style[key]).toEqual(DEFAULT_STYLE[key])
      );
      expect(item.toggleAnimation).toHaveBeenCalledWith(true, animationSpeed);
    });
  });

  describe("isHovered()", () => {
    it("should return true if mouse event coordinates are inside item", () => {
      jest.spyOn(item, "rect", "get").mockReturnValue({
        x: 80,
        y: 40,
        right: 180,
        bottom: 100,
      } as DOMRect);

      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(100);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(50);

      expect(item.isHovered(mouseEvent)).toEqual(true);
    });

    it("should return false if mouse event coordinates are outside item", () => {
      jest
        .spyOn(item, "rect", "get")
        .mockReturnValue({ x: 80, y: 40, right: 180, bottom: 100 } as DOMRect);

      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(100);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(200);

      expect(item.isHovered(mouseEvent)).toEqual(false);
    });
  });

  describe("isLeftSideHovered()", () => {
    it("should return true if mouse event horizontal position is less than half of item width", () => {
      jest.spyOn(item, "rect", "get").mockReturnValue({ x: 100, width: 200 } as DOMRect);

      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(150);

      expect(item.isLeftSideHovered(mouseEvent)).toEqual(true);
    });

    it("should return false if mouse event horizontal position is more than half of item width", () => {
      jest.spyOn(item, "rect", "get").mockReturnValue({ x: 100, width: 200 } as DOMRect);

      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(210);

      expect(item.isLeftSideHovered(mouseEvent)).toEqual(false);
    });
  });

  describe("getFullWidth()", () => {
    it("should return total width including border width on left and right", () => {
      const itemClientWidth = 200;
      const itemLeftBorderWidth = 2;
      const itemRightBorderWidth = 3;

      jest.spyOn(itemElement, "scrollWidth", "get").mockReturnValue(itemClientWidth);
      itemElement.style.borderLeft = `${itemLeftBorderWidth}px`;
      itemElement.style.borderRight = `${itemRightBorderWidth}px`;

      expect(item.getFullWidth()).toEqual(
        itemClientWidth + itemLeftBorderWidth + itemRightBorderWidth
      );
    });

    it("should consider invalid border width strings as when calculating total width", () => {
      const itemClientWidth = 200;

      jest.spyOn(itemElement, "scrollWidth", "get").mockReturnValue(itemClientWidth);
      itemElement.style.borderLeft = "invalid0";
      itemElement.style.borderRight = "invalid1";

      expect(item.getFullWidth()).toEqual(itemClientWidth);
    });
  });

  describe("getOriginalParentOffset()", () => {
    it("should return correct coordinate difference between the dropzone that currently hosts element and element's real HTML parent", () => {
      const originalParentElement = document.createElement("div");
      const originalParentX = 100;
      const originalParentY = 200;

      const dropzoneX = 400;
      const dropzoneY = 400;

      jest
        .spyOn(originalParentElement, "getBoundingClientRect")
        .mockReturnValue({ x: originalParentX, y: originalParentY } as DOMRect);
      jest.spyOn(itemElement, "parentElement", "get").mockReturnValue(originalParentElement);

      jest
        .spyOn(dropzone, "rect", "get")
        .mockReturnValue({ x: dropzoneX, y: dropzoneY } as DOMRect);

      expect(item.getOriginalParentOffset()).toEqual({
        xOffset: dropzoneX - originalParentX,
        yOffset: dropzoneY - originalParentY,
      });
    });
  });

  describe("applyDropzoneOffset()", () => {
    it("should set correct marginLeft and marginRight considering original parent offset X and Y, and apply 'grab' cursor style", () => {
      const dropzoneOffset = { xOffset: 100, yOffset: 200 };
      const originalParentOffset = { xOffset: 500, yOffset: 500 };

      jest.spyOn(item, "getOriginalParentOffset").mockReturnValue(originalParentOffset);

      item.applyDropzoneOffset(dropzoneOffset);

      expect(itemElement.style.marginLeft).toEqual(
        `${dropzoneOffset.xOffset + originalParentOffset.xOffset}px`
      );
      expect(itemElement.style.marginTop).toEqual(
        `${dropzoneOffset.yOffset + originalParentOffset.yOffset}px`
      );
      expect(itemElement.style.cursor).toEqual("grab");
    });
  });
});
