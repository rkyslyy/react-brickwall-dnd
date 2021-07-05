import { Dropzone } from "./Dropzone";

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
});
