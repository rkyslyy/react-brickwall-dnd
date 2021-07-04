import {
  Location,
  OnChildRepositionCallback,
} from "./../components/Brickwall/Brickwall.models";
import { hasBrickwallId } from "../utils/hasBrickwallId";

import Item from "./DropItem";
import Dropzone from "./Dropzone";
import { wait } from "../utils/wait";

interface DndControllerOptions {
  animationSpeed: number;
  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;
}

class DndController {
  contextWrapper: HTMLElement;

  dropzones: Dropzone[] = [];
  dropItems: Item[] = [];
  draggedItem: Item | null = null;

  animationSpeed: number;
  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;

  itemGrabLocation: Location | null;
  grabbedItemCurrentLocation: Location | null;

  constructor({ animationSpeed, gridGap, onFinalItemsReposition }: DndControllerOptions) {
    this.animationSpeed = animationSpeed;
    this.gridGap = gridGap;
    this.onFinalItemsReposition = onFinalItemsReposition;
  }

  setup = (contextWrapper: HTMLElement | null) => {
    if (!contextWrapper) return;

    this.prepareDocument();
    this.prepareContextWrapper(contextWrapper);
    this.prepareDropzonesAndItems();

    // Initial positioning
    this.repositionItems(false);

    // Enable stretch animation on dropzones
    process.nextTick(() => this.dropzones.forEach((dropzone) => dropzone.allowStretching()));
  };

  /**
   * We want to track mousemove / mouseup everywhere in the document to
   * allow dragging items outside Brickwall context.
   */
  prepareDocument = () => {
    document.addEventListener("mouseup", this.clearDraggedItem);
    document.addEventListener("mousemove", this.moveDraggedItem);
    return () => {
      document.removeEventListener("mouseup", this.clearDraggedItem);
      document.removeEventListener("mousemove", this.moveDraggedItem);
    };
  };

  /**
   * Finish dragging.
   *
   * 1. Animate placing dragged item in the new position.
   * 2. Notify parent about final changes.
   */
  clearDraggedItem = async () => {
    if (!this.draggedItem) return;

    this.draggedItem.self.style.zIndex = "1";
    this.draggedItem.self.style.transition = "all .15s ease";
    this.draggedItem.self.style.cursor = "grab";
    this.draggedItem = null;

    this.repositionItems();

    await wait(this.animationSpeed); // to not interrupt final animation

    if (!!this.itemGrabLocation && !!this.grabbedItemCurrentLocation) {
      this.onFinalItemsReposition(
        this.itemGrabLocation.dropzone.id,
        this.itemGrabLocation.index,
        this.grabbedItemCurrentLocation.dropzone.id,
        this.grabbedItemCurrentLocation.index
      );
    }

    this.itemGrabLocation = null;
    this.grabbedItemCurrentLocation = null;
  };

  moveDraggedItem = (e: MouseEvent) => this.draggedItem?.move(e);

  isDraggingOverEmptyDropzone = (dropzone: Dropzone, e: MouseEvent) => {
    const isDropzoneEmpty = !dropzone.items.length;
    const isCursorInsideDropzone =
      e.clientX > dropzone.container.getBoundingClientRect().x &&
      e.clientX < dropzone.container.getBoundingClientRect().right &&
      e.clientY > dropzone.container.getBoundingClientRect().y &&
      e.clientY < dropzone.container.getBoundingClientRect().bottom;

    return isDropzoneEmpty && isCursorInsideDropzone;
  };

  placeDraggedItemInNewDropzone = (newDropzone: Dropzone, item: Item, index = 0) => {
    this.grabbedItemCurrentLocation?.dropzone.removeItemAt(
      this.grabbedItemCurrentLocation.index
    );

    newDropzone.insertItemAt(index, item);
    item.updateDropzone(newDropzone);

    this.grabbedItemCurrentLocation = { dropzone: newDropzone, index };

    this.repositionItems();
  };

  handlePositionSwitchInsideDropzone = (dropzone: Dropzone, from: number, to: number) => {
    dropzone.switchItemPosition(from, to);

    this.grabbedItemCurrentLocation = { dropzone, index: to };

    this.repositionItems();
  };

  handleContextWrapperMouseMove = (e: MouseEvent) => {
    this.dropzones.forEach((dropzone) => {
      if (!this.draggedItem) return;

      if (this.isDraggingOverEmptyDropzone(dropzone, e)) {
        this.placeDraggedItemInNewDropzone(dropzone, this.draggedItem);
        return;
      }

      dropzone.items.forEach((item, itemIndex) => {
        if (!this.draggedItem || this.draggedItem === item) return;

        const isItemHovered = item.isHovered(e);
        const isHoveringFreeSpaceNearItem = dropzone.isHoveringFreeSpaceNearItem(item, e);
        const draggedItemIndexInDropzone = dropzone.indexOfItem(this.draggedItem);

        if (isItemHovered) {
          this.handleItemHovered(dropzone, draggedItemIndexInDropzone, item, itemIndex, e);
        } else if (isHoveringFreeSpaceNearItem) {
          this.handleHoveredNearItem(dropzone, itemIndex);
        }
      });
    });
  };

  handleItemHovered = (
    dropzone: Dropzone,
    draggedItemIndexInDropzone: number,
    hoveredItem: Item,
    hoveredItemIndex: number,
    e: MouseEvent
  ) => {
    if (!this.draggedItem) return;

    if (draggedItemIndexInDropzone === -1) {
      const indexForDraggedItem =
        hoveredItemIndex + (hoveredItem.isLeftSideHovered(e) ? 0 : 1);

      this.placeDraggedItemInNewDropzone(dropzone, this.draggedItem, indexForDraggedItem);
    } else {
      const isLeftSideHovered = hoveredItem.isLeftSideHovered(e);
      const directionLeft = draggedItemIndexInDropzone > hoveredItemIndex;
      let pp: number;
      if (isLeftSideHovered && !directionLeft) pp = hoveredItemIndex - 1;
      else if (isLeftSideHovered && directionLeft) pp = hoveredItemIndex;
      else if (!isLeftSideHovered && !directionLeft) pp = hoveredItemIndex;
      else pp = hoveredItemIndex + 1;
      const potentialNewPosition = pp;
      if (potentialNewPosition !== draggedItemIndexInDropzone) {
        this.handlePositionSwitchInsideDropzone(
          dropzone,
          draggedItemIndexInDropzone,
          Math.max(0, potentialNewPosition)
        );
      }
    }
  };

  handleHoveredNearItem = (dropzone: Dropzone, itemIndex: number) => {
    if (!this.draggedItem) return;

    const draggedItemIndexInDropzone = dropzone.indexOfItem(this.draggedItem);

    if (draggedItemIndexInDropzone === -1) {
      this.placeDraggedItemInNewDropzone(dropzone, this.draggedItem, itemIndex + 1);
    } else {
      const directionLeft = draggedItemIndexInDropzone > itemIndex;

      this.handlePositionSwitchInsideDropzone(
        dropzone,
        draggedItemIndexInDropzone,
        itemIndex + (directionLeft ? 1 : 0)
      );
    }
  };

  /**
   * Setup all positioning calculations.
   */
  prepareContextWrapper = (contextWrapper: HTMLElement) => {
    this.contextWrapper = contextWrapper;
    contextWrapper.style.display = "flex";
    contextWrapper.style.position = "relative";
    contextWrapper.onmousemove = this.handleContextWrapperMouseMove;
  };

  /**
   * Recursively check all context children and build Dropzone and DropItem objects.
   */
  prepareDropzonesAndItems = () => {
    this.dropzones = this.collectDropzones(this.contextWrapper);

    for (let i = 0; i < this.dropzones.length; i++) {
      const dropzone = this.dropzones[i];

      if (!dropzone.container.style.minHeight) dropzone.container.style.minHeight = "30px";

      dropzone.items.forEach((item, index) => {
        item.self.style.position = "absolute";

        item.self.onmousedown = (e) => {
          if (this.draggedItem) return;

          item.applyMouseDownStyle(e);
          this.draggedItem = item;
          this.grabbedItemCurrentLocation = { dropzone: item.dropzone, index };
        };
      });
    }
  };

  collectDropzones = (container: HTMLElement) => {
    const dropzones: Dropzone[] = [];

    container.children.array().forEach((child) => {
      if (hasBrickwallId(child)) {
        dropzones.push(new Dropzone(child));
      } else {
        dropzones.push(...this.collectDropzones(child));
      }
    });

    return dropzones;
  };

  repositionItems = (animated: boolean = true) => {
    this.dropzones.forEach((dropzone) => {
      const maxWidth = dropzone.container.clientWidth;

      let xOffset = this.gridGap;
      let yOffset = this.gridGap;
      let resultingContainerHeight = parseInt(dropzone.container.style.minHeight);

      dropzone.items.forEach((item) => {
        // Decide if we want to render this item near left edge and below current row
        if (xOffset + item.getFullWidth() + this.gridGap > maxWidth) {
          xOffset = this.gridGap;
          yOffset = resultingContainerHeight;
        }

        // Dragged item should change location without transition effect
        item.animateIf(item !== this.draggedItem && animated);

        item.placeInDropzone({ xOffset, yOffset });

        // Get horizonral offset for next item
        xOffset += item.getFullWidth() + this.gridGap;

        // Extend resulting container height if item won't fit in current row
        if (item.rect().height + yOffset > resultingContainerHeight)
          resultingContainerHeight = yOffset + item.rect().height + this.gridGap;
      });

      // Actually extend container height
      dropzone.container.style.height = `${resultingContainerHeight}px`;
    });
  };
}

export default DndController;
