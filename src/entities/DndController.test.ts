import "../setup";

import DndController from "./DndController";

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
    it("should add listeners to document", () => {
      const spy = jest.spyOn(document, "addEventListener");

      dndController.prepareDocument();

      expect(spy.mock.calls).toEqual([
        ["mouseup", dndController.clearDraggedItem],
        ["mousemove", dndController.moveDraggedItem],
      ]);
    });
  });

  describe("cleanUp()", () => {
    it("should remove listeners from documents", () => {
      const spy = jest.spyOn(document, "removeEventListener");

      dndController.cleanUp();

      expect(spy.mock.calls).toEqual([
        ["mouseup", dndController.clearDraggedItem],
        ["mousemove", dndController.moveDraggedItem],
      ]);
    });
  });

  describe("clearDraggedItem()", () => {
    it("should exit early if draggedItem is null", () => {
      const wrapperElement = document.createElement("div");
      const dropzoneElement = document.createElement("div");
      const itemElement = document.createElement("div");

      dropzoneElement.appendChild(itemElement);
      wrapperElement.appendChild(dropzoneElement);

      dndController.setup(wrapperElement);

      dndController.draggedItem = null;

      jest.spyOn(dndController, "onItemDrop");
      jest.spyOn(dndController, "repositionItems");

      dndController.clearDraggedItem();

      expect(dndController.repositionItems).not.toHaveBeenCalled();
      expect(dndController.onItemDrop).not.toHaveBeenCalled();
    });

    it("should reset draggedItem, reposition items, notify parent about item drop and reset from/to locations", async () => {
      const wrapperElement = document.createElement("div");
      const dropzoneElement = document.createElement("div");
      const itemElement0 = document.createElement("div");
      const itemElement1 = document.createElement("div");

      dropzoneElement.id = "bw-dz-a";
      dropzoneElement.appendChild(itemElement0);
      dropzoneElement.appendChild(itemElement1);
      wrapperElement.appendChild(dropzoneElement);

      dndController.setup(wrapperElement);

      const dropzone = dndController.dropzones[0];
      const draggedItem = dropzone.items[0];
      jest.spyOn(draggedItem, "applyDefaultStyle");

      dndController.draggedItem = draggedItem;
      dndController.initialItemGrabLocation = { dropzone, index: 0 };
      dndController.grabbedItemCurrentLocation = { dropzone, index: 1 };

      jest.spyOn(dndController, "onItemDrop");
      jest.spyOn(dndController, "repositionItems");

      await dndController.clearDraggedItem();

      expect(draggedItem.applyDefaultStyle).toHaveBeenCalled();
      expect(dndController.draggedItem).toBeNull();
      expect(dndController.repositionItems).toHaveBeenCalled();
      expect(dndController.onItemDrop).toHaveBeenCalledWith(dropzone.id, 0, dropzone.id, 1);
      expect(dndController.initialItemGrabLocation).toBeNull();
      expect(dndController.grabbedItemCurrentLocation).toBeNull();
    });
  });

  describe("rebuildDropzones()", () => {
    it("should re-collect dropzones and reposition items without animation", () => {
      const wrapperElement = document.createElement("div");

      jest.spyOn(dndController, "prepareDropzonesAndItems");
      jest.spyOn(dndController, "repositionItems");

      dndController.setup(wrapperElement);
      dndController.rebuildDropzones();

      expect(dndController.prepareDropzonesAndItems).toHaveBeenCalled();
      expect(dndController.repositionItems).toHaveBeenCalledWith(false);
    });
  });

  describe("placeDraggedItemInNewDropzone()", () => {
    it("should remove item from current dropzone, insert it to new dropzone, update current location and reposition items", () => {
      const wrapperElement = document.createElement("div");
      const dropzoneElement0 = document.createElement("div");
      const itemElement0 = document.createElement("div");
      const dropzoneElement1 = document.createElement("div");
      const itemElement1 = document.createElement("div");

      dropzoneElement0.id = "bw-dz-a";
      dropzoneElement1.id = "bw-dz-b";
      dropzoneElement0.appendChild(itemElement0);
      dropzoneElement1.appendChild(itemElement1);
      wrapperElement.appendChild(dropzoneElement0);
      wrapperElement.appendChild(dropzoneElement1);

      dndController.setup(wrapperElement);

      const dropzone0 = dndController.dropzones[0];
      const dropzone1 = dndController.dropzones[1];

      const draggedItem = dropzone0.items[0];
      const placingIndex = 1;

      dndController.draggedItem = draggedItem;
      dndController.grabbedItemCurrentLocation = { dropzone: dropzone0, index: 0 };

      jest.spyOn(dndController, "repositionItems");

      dndController.placeDraggedItemInNewDropzone(dropzone1, draggedItem, placingIndex);

      expect(dropzone0.items).toHaveLength(0);
      expect(dropzone1.items).toContain(draggedItem);
      expect(dndController.grabbedItemCurrentLocation).toEqual({
        dropzone: dropzone1,
        index: placingIndex,
      });
      expect(dndController.repositionItems).toHaveBeenCalled();
    });
  });

  describe("handleIndexSwitchInsideDropzone()", () => {
    it("should switch item positions in dropzone, update current dragged item location and reposition items", () => {
      const wrapperElement = document.createElement("div");
      const dropzoneElement = document.createElement("div");
      const itemElement0 = document.createElement("div");
      const itemElement1 = document.createElement("div");

      dropzoneElement.id = "bw-dz-a";
      dropzoneElement.appendChild(itemElement0);
      dropzoneElement.appendChild(itemElement1);
      wrapperElement.appendChild(dropzoneElement);

      dndController.setup(wrapperElement);

      const dropzone = dndController.dropzones[0];
      const dropzoneItem0 = dropzone.items[0];
      const dropzoneItem1 = dropzone.items[1];
      const from = 0;
      const to = 1;

      jest.spyOn(dndController, "repositionItems");

      dndController.handleIndexSwitchInsideDropzone(dropzone, from, to);

      expect(dropzone.items[0]).toBe(dropzoneItem1);
      expect(dropzone.items[1]).toBe(dropzoneItem0);
      expect(dndController.grabbedItemCurrentLocation).toEqual({ dropzone, index: to });
      expect(dndController.repositionItems).toHaveBeenCalled();
    });
  });

  describe("handleContextWrapperMouseMove()", () => {
    let wrapperElement: HTMLElement;
    let dropzoneElement0: HTMLElement;
    let dropzoneElement1: HTMLElement;
    let itemElement0: HTMLElement;
    let itemElement1: HTMLElement;

    beforeEach(() => {
      wrapperElement = document.createElement("div");
      dropzoneElement0 = document.createElement("div");
      dropzoneElement1 = document.createElement("div");
      itemElement0 = document.createElement("div");
      itemElement1 = document.createElement("div");

      dropzoneElement0.id = "bw-dz-a";
      dropzoneElement1.id = "bw-dz-b";
      dropzoneElement1.appendChild(itemElement0);
      dropzoneElement1.appendChild(itemElement1);
      wrapperElement.appendChild(dropzoneElement0);
      wrapperElement.appendChild(dropzoneElement1);

      dndController.setup(wrapperElement);
    });

    it("should loop through dropzones and correctly handle empty dropzone", () => {
      const emptyDropzone = dndController.dropzones[0];
      const dropzone = dndController.dropzones[1];
      const draggedItem = dropzone.items[0];

      dndController.draggedItem = draggedItem;

      jest.spyOn(emptyDropzone, "isEmptyAndHovered").mockReturnValue(true);
      jest.spyOn(dndController, "placeDraggedItemInNewDropzone");

      dndController.handleContextWrapperMouseMove(new MouseEvent("mousemove"));

      expect(dndController.placeDraggedItemInNewDropzone(emptyDropzone, draggedItem));
    });

    it("should loop through dropzones and correctly handle non-empty dropzone with it's item hovered", () => {
      const dropzone = dndController.dropzones[1];
      const draggedItemIndex = 0;
      const draggedItem = dropzone.items[draggedItemIndex];
      const hoveredItemIndex = 1;
      const hoveredItem = dropzone.items[hoveredItemIndex];
      const mouseEvent = new MouseEvent("mousemove");

      dndController.draggedItem = draggedItem;

      jest.spyOn(hoveredItem, "isHovered").mockReturnValue(true);
      jest.spyOn(dropzone, "isHoveringAvailableSpaceNearItem").mockReturnValue(false);
      jest.spyOn(dndController, "handleItemHovered");

      dndController.handleContextWrapperMouseMove(mouseEvent);

      expect(dndController.handleItemHovered).toHaveBeenCalledWith(
        dropzone,
        draggedItemIndex,
        hoveredItem,
        hoveredItemIndex,
        mouseEvent
      );
    });

    it("should loop through dropzones and correctly handle non-empty dropzone with it's item hovered nearby", () => {
      const dropzone = dndController.dropzones[1];
      const draggedItemIndex = 0;
      const draggedItem = dropzone.items[draggedItemIndex];
      const hoveredNearbyItemIndex = 1;
      const hoveredNearbyItem = dropzone.items[hoveredNearbyItemIndex];
      const mouseEvent = new MouseEvent("mousemove");

      dndController.draggedItem = draggedItem;

      jest.spyOn(hoveredNearbyItem, "isHovered").mockReturnValue(false);
      jest
        .spyOn(dropzone, "isHoveringAvailableSpaceNearItem")
        .mockImplementation((item) => item === hoveredNearbyItem);
      jest.spyOn(dndController, "handleHoveredNearItem");

      dndController.handleContextWrapperMouseMove(mouseEvent);

      expect(dndController.handleHoveredNearItem).toHaveBeenCalledWith(
        draggedItemIndex,
        dropzone,
        hoveredNearbyItemIndex
      );
    });
  });

  describe("handleItemHovered()", () => {
    const mouseEvent = new MouseEvent("mousemove");

    let wrapperElement: HTMLElement;
    let dropzoneElement0: HTMLElement;
    let dropzoneElement1: HTMLElement;
    let itemElement0: HTMLElement;
    let itemElement1: HTMLElement;
    let itemElement2: HTMLElement;

    beforeEach(() => {
      wrapperElement = document.createElement("div");
      dropzoneElement0 = document.createElement("div");
      dropzoneElement1 = document.createElement("div");
      itemElement0 = document.createElement("div");
      itemElement1 = document.createElement("div");
      itemElement2 = document.createElement("div");

      dropzoneElement0.id = "bw-dz-a";
      dropzoneElement1.id = "bw-dz-b";
    });

    describe("hovering over item from different dropzone", () => {
      beforeEach(() => {
        dropzoneElement0.appendChild(itemElement0);
        dropzoneElement1.appendChild(itemElement1);
        wrapperElement.appendChild(dropzoneElement0);
        wrapperElement.appendChild(dropzoneElement1);

        dndController.setup(wrapperElement);
      });

      it("should call placeDraggedItemInNewDropzone() with correct desired index for dragged item when hovering on left side", () => {
        const sourceDropzone = dndController.dropzones[0];
        const destinationDropzone = dndController.dropzones[1];

        const draggedItem = sourceDropzone.items[0];
        const hoveredItem = destinationDropzone.items[0];

        const draggedItemIndexInTargetDropzone = -1;

        dndController.draggedItem = draggedItem;

        jest.spyOn(hoveredItem, "isLeftSideHovered").mockReturnValue(true);
        jest.spyOn(dndController, "placeDraggedItemInNewDropzone");

        dndController.handleItemHovered(
          destinationDropzone,
          draggedItemIndexInTargetDropzone,
          hoveredItem,
          0,
          mouseEvent
        );

        const expectedDraggedItemDesiredIndex = 0;
        expect(dndController.placeDraggedItemInNewDropzone).toHaveBeenCalledWith(
          destinationDropzone,
          draggedItem,
          expectedDraggedItemDesiredIndex
        );
      });

      it("should call placeDraggedItemInNewDropzone() with correct desired index for dragged item when hovering on right side", () => {
        const sourceDropzone = dndController.dropzones[0];
        const destinationDropzone = dndController.dropzones[1];

        const draggedItem = sourceDropzone.items[0];
        const hoveredItem = destinationDropzone.items[0];

        const draggedItemIndexInTargetDropzone = -1;

        dndController.draggedItem = draggedItem;

        jest.spyOn(hoveredItem, "isLeftSideHovered").mockReturnValue(false);
        jest.spyOn(dndController, "placeDraggedItemInNewDropzone");

        dndController.handleItemHovered(
          destinationDropzone,
          draggedItemIndexInTargetDropzone,
          hoveredItem,
          0,
          mouseEvent
        );

        const expectedDraggedItemDesiredIndex = 1;
        expect(dndController.placeDraggedItemInNewDropzone).toHaveBeenCalledWith(
          destinationDropzone,
          draggedItem,
          expectedDraggedItemDesiredIndex
        );
      });
    });

    describe("hovering over item from same dropzone", () => {
      beforeEach(() => {
        dropzoneElement0.appendChild(itemElement0);
        dropzoneElement0.appendChild(itemElement1);
        dropzoneElement0.appendChild(itemElement2);
        wrapperElement.appendChild(dropzoneElement0);

        dndController.setup(wrapperElement);
      });

      it("should call handleIndexSwitchInsideDropzone() with correct desired index for dragged item when hovering on left side", () => {
        const dropzone = dndController.dropzones[0];

        const draggedItemIndex = 0;
        const hoveredItemIndex = 2;

        const draggedItem = dropzone.items[draggedItemIndex];
        const hoveredItem = dropzone.items[hoveredItemIndex];

        jest.spyOn(hoveredItem, "isLeftSideHovered").mockReturnValue(true);
        jest.spyOn(dndController, "handleIndexSwitchInsideDropzone");

        dndController.draggedItem = draggedItem;

        dndController.handleItemHovered(
          dropzone,
          draggedItemIndex,
          hoveredItem,
          hoveredItemIndex,
          mouseEvent
        );

        const expectedDraggedItemDesiredIndex = 1;
        expect(dndController.handleIndexSwitchInsideDropzone).toHaveBeenCalledWith(
          dropzone,
          draggedItemIndex,
          expectedDraggedItemDesiredIndex
        );
      });
    });
  });

  describe("getDraggedItemIndexAfterSwitch()", () => {
    it("should return correct value based on isLeftHovered and isDirectionLeft", () => {
      const hoveredItemIndex = 2;

      let isLeftHovered: boolean;
      let isDirectionLeft: boolean;

      isLeftHovered = true;
      isDirectionLeft = true;
      expect(
        dndController.getDraggedItemIndexAfterSwitch(
          isLeftHovered,
          isDirectionLeft,
          hoveredItemIndex
        )
      ).toEqual(hoveredItemIndex);

      isLeftHovered = false;
      isDirectionLeft = false;
      expect(
        dndController.getDraggedItemIndexAfterSwitch(
          isLeftHovered,
          isDirectionLeft,
          hoveredItemIndex
        )
      ).toEqual(hoveredItemIndex);

      isLeftHovered = true;
      isDirectionLeft = false;
      expect(
        dndController.getDraggedItemIndexAfterSwitch(
          isLeftHovered,
          isDirectionLeft,
          hoveredItemIndex
        )
      ).toEqual(hoveredItemIndex - 1);

      isLeftHovered = false;
      isDirectionLeft = true;
      expect(
        dndController.getDraggedItemIndexAfterSwitch(
          isLeftHovered,
          isDirectionLeft,
          hoveredItemIndex
        )
      ).toEqual(hoveredItemIndex + 1);
    });
  });
});
