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

  describe("repositionItems()", () => {
    it("should correctly place items inside dropzone", () => {
      const dropzoneElement = document.createElement("div");
      const dropzoneWidth = 500;
      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      const child3 = document.createElement("div");
      const child4 = document.createElement("div");
      const gridGap = 20;

      jest.spyOn(dropzoneElement, "clientWidth", "get").mockReturnValue(dropzoneWidth);

      const child0Width = 100;
      const child1Width = 100;
      const child2Width = 300;
      const child3Width = 100;
      const child4Width = 400;

      jest.spyOn(child0, "scrollWidth", "get").mockReturnValue(child0Width);
      jest.spyOn(child1, "scrollWidth", "get").mockReturnValue(child1Width);
      jest.spyOn(child2, "scrollWidth", "get").mockReturnValue(child2Width);
      jest.spyOn(child3, "scrollWidth", "get").mockReturnValue(child3Width);
      jest.spyOn(child4, "scrollWidth", "get").mockReturnValue(child4Width);

      [child0, child1, child2, child3, child4].forEach((child) =>
        dropzoneElement.appendChild(child)
      );

      const dropzone = new Dropzone(dropzoneElement);
      const childHeight = 50;

      dropzone.items.forEach((item) => {
        jest.spyOn(item, "rect", "get").mockReturnValue({ height: childHeight } as DOMRect);
        jest
          .spyOn(item, "getOriginalParentOffset")
          .mockReturnValue({ xOffset: 0, yOffset: 0 });
      });

      dropzone.repositionItems(false, 300, gridGap, null);

      // for first item offset should only be based on gridGap
      expect(parseInt(child0.style.marginTop)).toEqual(gridGap);
      expect(parseInt(child0.style.marginLeft)).toEqual(gridGap);

      // second item should be moved to right by first item width + gridGap
      expect(parseInt(child1.style.marginTop)).toEqual(gridGap);
      expect(parseInt(child1.style.marginLeft)).toEqual(
        gridGap + child0.scrollWidth + gridGap
      );

      // third item should start on next row since it does not fit
      expect(parseInt(child2.style.marginTop)).toEqual(gridGap + childHeight + gridGap);
      expect(parseInt(child2.style.marginLeft)).toEqual(gridGap);

      // fourth item should fit near third one
      expect(parseInt(child3.style.marginTop)).toEqual(gridGap + childHeight + gridGap);
      expect(parseInt(child3.style.marginLeft)).toEqual(gridGap + child2Width + gridGap);

      // last item doesnt should go to new row
      expect(parseInt(child4.style.marginTop)).toEqual(
        gridGap + childHeight + gridGap + childHeight + gridGap
      );
      expect(parseInt(child4.style.marginLeft)).toEqual(gridGap);
    });
  });

  describe("isEmptyAndHovered()", () => {
    it("should return true if cursor is inside dropzone with no items", () => {
      const dropzoneElement = document.createElement("div");
      const dropzone = new Dropzone(dropzoneElement);
      const mouseEvent = new MouseEvent("mousemove");

      jest.spyOn(dropzone.container, "getBoundingClientRect").mockReturnValue({
        x: 100,
        y: 100,
        right: 300,
        bottom: 300,
      } as DOMRect);
      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(150);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(150);

      expect(dropzone.isEmptyAndHovered(mouseEvent)).toEqual(true);
    });

    it("should return false if cursor is inside dropzone but there are items inside", () => {
      const dropzoneElement = document.createElement("div");
      const childElement = document.createElement("div");

      dropzoneElement.appendChild(childElement);

      const dropzone = new Dropzone(dropzoneElement);
      const mouseEvent = new MouseEvent("mousemove");

      jest.spyOn(dropzone.container, "getBoundingClientRect").mockReturnValue({
        x: 100,
        y: 100,
        right: 300,
        bottom: 300,
      } as DOMRect);
      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(150);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(150);

      expect(dropzone.isEmptyAndHovered(mouseEvent)).toEqual(false);
    });

    it("should return false if cursor is outside dropzone", () => {
      const dropzoneElement = document.createElement("div");
      const dropzone = new Dropzone(dropzoneElement);
      const mouseEvent = new MouseEvent("mousemove");

      jest.spyOn(dropzone.container, "getBoundingClientRect").mockReturnValue({
        x: 400,
        y: 100,
        right: 300,
        bottom: 300,
      } as DOMRect);
      jest.spyOn(mouseEvent, "clientX", "get").mockReturnValue(150);
      jest.spyOn(mouseEvent, "clientY", "get").mockReturnValue(150);

      expect(dropzone.isEmptyAndHovered(mouseEvent)).toEqual(false);
    });
  });
});
