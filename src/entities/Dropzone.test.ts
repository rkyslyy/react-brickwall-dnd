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
    it("should correctly insert item at the start of array", () => {
      const dropzoneElement = document.createElement("div");
      const dropzoneChildren = [
        document.createElement("div"),
        document.createElement("div"),
        document.createElement("div"),
      ];

      dropzoneChildren.forEach((child) => dropzoneElement.appendChild(child));

      const dropzone = new Dropzone(dropzoneElement);

      const anotherDropzoneElement = document.createElement("div");
      const anotherItemElement = document.createElement("div");
      const anotherDropzone = new Dropzone(anotherDropzoneElement);
      const anotherItem = new Item(anotherDropzone, anotherItemElement);

      expect(anotherItem.dropzone).toEqual(anotherDropzone);

      dropzone.insertItemAt(0, anotherItem);

      expect(dropzone.items[0]).toEqual(anotherItem);
      expect(anotherItem.dropzone).toEqual(dropzone);
    });
  });
});
