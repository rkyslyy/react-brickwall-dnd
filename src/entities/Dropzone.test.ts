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
});
