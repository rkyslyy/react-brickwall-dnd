import { DEFAULT_ANIMATION_SPEED } from "../constants";
import { Dropzone } from "./Dropzone";
import { DEFAULT_STYLE, Item, MOUSE_DOWN_STYLE } from "./Item";

describe("Item", () => {
  let dropzoneElement: HTMLElement;
  let itemElement: HTMLElement;

  beforeEach(() => {
    dropzoneElement = document.createElement("div");
    dropzoneElement.style.width = "500px";
    dropzoneElement.style.height = "400px";

    itemElement = document.createElement("div");
    itemElement.style.width = "100px";
    itemElement.style.height = "50px";

    document.body.appendChild(dropzoneElement);
    document.body.appendChild(itemElement);
  });
  describe("toggleAnimation()", () => {
    it("should correctly enable animation", () => {
      const dropzone = new Dropzone(dropzoneElement);
      const item = new Item(dropzone, itemElement);
      const animationSpeed = 300;

      item.toggleAnimation(true, animationSpeed);
      expect(itemElement.style.transition).toEqual(`all .${animationSpeed}s ease`);

      item.toggleAnimation(true);
      expect(itemElement.style.transition).toEqual(`all .${DEFAULT_ANIMATION_SPEED}s ease`);
    });

    it("should correctly disable animation", () => {
      itemElement.style.transition = "all 1s ease";

      const dropzone = new Dropzone(dropzoneElement);
      const item = new Item(dropzone, itemElement);

      item.toggleAnimation(false);

      expect(itemElement.style.transition).toEqual("");
    });
  });

  describe("applyMouseDownStyle()", () => {
    it("should set all MOUSE_DOWN_STYLE props to itemElement.style and call Item.protoptype.move() with passed event", () => {
      const dropzone = new Dropzone(dropzoneElement);
      const item = new Item(dropzone, itemElement);
      const event = new MouseEvent("mousemove");

      jest.spyOn(item, "move");
      item.applyMouseDownStyle(event);

      Object.keys(MOUSE_DOWN_STYLE).forEach((key) =>
        expect(itemElement.style[key]).toEqual(MOUSE_DOWN_STYLE[key])
      );
      expect(item.move).toHaveBeenCalledWith(event);
    });
  });

  describe("applyDefaultStyle()", () => {
    it("should set all DEFAULT_STYLE props to itemElement.style and call Item.protoptype.toggleAnimation() with passed animationSpeed", () => {
      const dropzone = new Dropzone(dropzoneElement);
      const item = new Item(dropzone, itemElement);
      const animationSpeed = 300;

      jest.spyOn(item, "toggleAnimation");
      item.applyDefaultStyle(animationSpeed);

      Object.keys(DEFAULT_STYLE).forEach((key) =>
        expect(itemElement.style[key]).toEqual(DEFAULT_STYLE[key])
      );
      expect(item.toggleAnimation).toHaveBeenCalledWith(true, animationSpeed);
    });
  });
});
