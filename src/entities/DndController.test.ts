import DndController from "./DndController";
// import Item from "./Item";

describe("DndController", () => {
  const animationSpeed = 100;
  const gridGap = 20;
  let dndController: DndController;

  beforeEach(() => {
    dndController = new DndController({
      animationSpeed,
      gridGap,
      onItemDrop: () => null,
    });
  });

  describe("setup()", () => {
    it("should exit early if wrapper element is null", () => {
      jest.spyOn(dndController, "prepareDocument");
      jest.spyOn(dndController, "prepareContextWrapper");
      jest.spyOn(dndController, "prepareDropzonesAndItems");
      jest.spyOn(dndController, "repositionItems");

      dndController.setup(null);

      expect(dndController.prepareDocument).not.toHaveBeenCalled();
      expect(dndController.prepareContextWrapper).not.toHaveBeenCalled();
      expect(dndController.prepareDropzonesAndItems).not.toHaveBeenCalled();
      expect(dndController.repositionItems).not.toHaveBeenCalled();
    });

    it("should call preparation methods, do initial positioning and enable stretch animation on dropzones", () => {
      const wrapperElement = document.createElement("div");
      // const dropzoneElement = document.createElement("div");
      // const itemElement = document.createElement("div");

      // dropzoneElement.appendChild(itemElement);

      // dropzoneElement.id = "bw-dz-a";

      // wrapperElement.appendChild(dropzoneElement);

      jest.spyOn(dndController, "prepareDocument").mockReturnValue();
      jest.spyOn(dndController, "prepareContextWrapper").mockReturnValue();
      jest.spyOn(dndController, "prepareDropzonesAndItems").mockReturnValue();
      jest.spyOn(dndController, "repositionItems").mockReturnValue();
      dndController.dropzones.forEach((dropzone) => jest.spyOn(dropzone, "allowStretching"));

      dndController.setup(wrapperElement);

      expect(dndController.prepareDocument).toHaveBeenCalled();
      expect(dndController.prepareContextWrapper).toHaveBeenCalledWith(wrapperElement);
      expect(dndController.prepareDropzonesAndItems).toHaveBeenCalled();
      expect(dndController.repositionItems).toHaveBeenCalledWith(false);
      dndController.dropzones.forEach((dropzone) =>
        expect(dropzone.allowStretching).toHaveBeenCalledWith(animationSpeed)
      );
    });
  });

  describe("prepareDocument()", () => {
    it("should add listeners to documents", () => {
      const spy = jest.spyOn(document, "addEventListener");

      dndController.prepareDocument();

      expect(spy.mock.calls).toEqual([
        ["mouseup", dndController.clearDraggedItem],
        ["mousemove", dndController.moveDraggedItem],
      ]);
    });
  });

  describe("cleanUp()", () => {
    it("should add listeners to documents", () => {
      const spy = jest.spyOn(document, "removeEventListener");

      dndController.cleanUp();

      expect(spy.mock.calls).toEqual([
        ["mouseup", dndController.clearDraggedItem],
        ["mousemove", dndController.moveDraggedItem],
      ]);
    });
  });

  // describe("clearDraggedItem()", () => {
  //   it("should exit early if draggedItem is null", () => {
  //     const wrapperElement = document.createElement("div");
  //     const dropzoneElement = document.createElement("div");
  //     const itemElement = document.createElement("div");

  //     dropzoneElement.appendChild(itemElement);

  //     dndController.setup();
  //   });
  // });
});
