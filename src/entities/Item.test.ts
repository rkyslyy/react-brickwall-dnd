import { Dropzone } from "./Dropzone";
import { Item } from "./Item";

describe("Item", () => {
  it("should do", () => {
    const dropzoneElement = document.createElement("div");
    dropzoneElement.style.width = "500px";
    dropzoneElement.style.height = "400px";

    const dropzone = new Dropzone(dropzoneElement);

    const itemElement = document.createElement("div");
    itemElement.style.width = "100px";
    itemElement.style.height = "50px";

    const item = new Item(dropzone, itemElement);

    item.toggleAnimation(true, 150);

    expect(itemElement.style.transition).toEqual(`all .${150}s ease`);
  });
});
