import { Dropzone } from "./Dropzone";
import Item from "./Item";

describe("Dropzone", () => {
  //   let dropzoneElement: HTMLElement;
  //   let itemElement: HTMLElement;

  //   let dropzone: Dropzone;
  //   let item: Item;
  //   let mouseEvent: MouseEvent;

  //   beforeEach(() => {
  //     dropzoneElement = document.createElement("div");
  //     dropzoneElement.style.width = "500px";
  //     dropzoneElement.style.height = "400px";

  //     itemElement = document.createElement("div");
  //     itemElement.style.width = "100px";
  //     itemElement.style.height = "50px";

  //     dropzone = new Dropzone(dropzoneElement);
  //     item = new Item(dropzone, itemElement);
  //     mouseEvent = new MouseEvent("mousemove");
  //   });

  it("should store an array of Item objects built from children", () => {
    const dropzoneElement = document.createElement("div");
    const children = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];

    children.forEach((child) => dropzoneElement.appendChild(child));

    const dropzone = new Dropzone(dropzoneElement);

    dropzone.items.forEach((item, i) => expect(item.itemElement).toEqual(children[i]));
  });

  describe("id", () => {
    it("should return id prop of source HTML element", () => {
      const dropzoneElement = document.createElement("div");
      const dropzoneElementId = "foobar";

      dropzoneElement.id = dropzoneElementId;

      const dropzone = new Dropzone(dropzoneElement);

      expect(dropzone.id).toEqual(dropzoneElementId);
    });
  });

  describe("allowStretching()", () => {
    it("should set correct transition style to dropzone HTML element", () => {
      const dropzoneElement = document.createElement("div");
      const animationSpeed = 300;
      const dropzone = new Dropzone(dropzoneElement);

      dropzone.allowStretching(animationSpeed);

      expect(dropzoneElement.style.transition).toEqual(`height .${animationSpeed}s ease`);
    });
  });

  describe("insertItemAt()", () => {
    it("should insert item at the given index", () => {
      const dropzoneElement = document.createElement("div");
      const dropzoneChildren = [
        document.createElement("div"),
        document.createElement("div"),
        document.createElement("div"),
      ];
      const index = 1;

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const anotherDropzoneElement = document.createElement("div");
      const anotherItemElement = document.createElement("div");
      const anotherDropzone = new Dropzone(anotherDropzoneElement);
      const anotherItem = new Item(anotherDropzone, anotherItemElement);

      expect(anotherItem.dropzone).toEqual(anotherDropzone);

      dropzone.insertItemAt(index, anotherItem);

      expect(dropzone.items[index]).toEqual(anotherItem);
      expect(anotherItem.dropzone).toEqual(dropzone);
    });
  });

  describe("switchItemPosition()", () => {
    it("should correctly switch item positions", () => {
      const dropzoneElement = document.createElement("div");
      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      const dropzoneChildren = [child0, child1, child2];

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const item0 = dropzone.items[0];
      const item1 = dropzone.items[1];

      const from = 0;
      const to = 1;

      dropzone.switchItemPosition(from, to);

      expect(dropzone.items[0]).toEqual(item1);
      expect(dropzone.items[1]).toEqual(item0);
    });
  });

  describe("isHoveringAvailableSpaceNearItem()", () => {
    it("should return true if cursor is on the right of item and there's no next item", () => {
      const dropzoneElement = document.createElement("div");

      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      jest.spyOn(child2, "getBoundingClientRect").mockReturnValue({ y: 50 } as DOMRect);

      const dropzoneChildren = [child0, child1, child2];

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const hoveredItem = dropzone.items[2];

      const event = new MouseEvent("mousemove");

      jest.spyOn(dropzone, "isHoveringNearItem").mockReturnValue(true);

      expect(dropzone.isHoveringAvailableSpaceNearItem(hoveredItem, event)).toEqual(true);
    });

    it("should return true if cursor is on the right of item and there a next item in the next row", () => {
      const dropzoneElement = document.createElement("div");

      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      jest.spyOn(child1, "getBoundingClientRect").mockReturnValue({ y: 50 } as DOMRect);
      jest.spyOn(child2, "getBoundingClientRect").mockReturnValue({ y: 100 } as DOMRect);

      const dropzoneChildren = [child0, child1, child2];

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const hoveredItem = dropzone.items[1];

      const event = new MouseEvent("mousemove");

      jest.spyOn(dropzone, "isHoveringNearItem").mockReturnValue(true);

      expect(dropzone.isHoveringAvailableSpaceNearItem(hoveredItem, event)).toEqual(true);
    });

    it("should return false if cursor is on the right of item and there a next item in the same row", () => {
      const dropzoneElement = document.createElement("div");

      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      jest.spyOn(child1, "getBoundingClientRect").mockReturnValue({ y: 50 } as DOMRect);
      jest.spyOn(child2, "getBoundingClientRect").mockReturnValue({ y: 50 } as DOMRect);

      const dropzoneChildren = [child0, child1, child2];

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const hoveredItem = dropzone.items[1];

      const event = new MouseEvent("mousemove");

      jest.spyOn(dropzone, "isHoveringNearItem").mockReturnValue(true);

      expect(dropzone.isHoveringAvailableSpaceNearItem(hoveredItem, event)).toEqual(false);
    });
  });

  describe("isHoveringNearItem()", () => {
    it("should return true if mouse coordinates are on the right of item", () => {
      const dropzoneElement = document.createElement("div");
      const child = document.createElement("div");

      dropzoneElement.appendChild(child);

      const dropzone = new Dropzone(dropzoneElement);
      const item = dropzone.items[0];
      const mouseEvent = new MouseEvent("mousemove");

      jest
        .spyOn(dropzone, "rect", "get")
        .mockReturnValue({ bottom: 400, right: 500 } as DOMRect);

      jest.spyOn(item, "rect", "get").mockReturnValue({
        x: 80,
        y: 40,
        right: 180,
        bottom: 100,
      } as DOMRect);

      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(200);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(50);

      expect(dropzone.isHoveringNearItem(mouseEvent, item)).toEqual(true);
    });
  });

  it("should return false if mouse coordinates are not on the right of item", () => {
    const dropzoneElement = document.createElement("div");
    const child = document.createElement("div");

    dropzoneElement.appendChild(child);

    const dropzone = new Dropzone(dropzoneElement);
    const item = dropzone.items[0];
    const mouseEvent = new MouseEvent("mousemove");

    jest
      .spyOn(dropzone, "rect", "get")
      .mockReturnValue({ bottom: 400, right: 500 } as DOMRect);

    jest.spyOn(item, "rect", "get").mockReturnValue({
      x: 80,
      y: 40,
      right: 180,
      bottom: 100,
    } as DOMRect);

    jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(50);
    jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(50);

    expect(dropzone.isHoveringNearItem(mouseEvent, item)).toEqual(false);
  });
});
