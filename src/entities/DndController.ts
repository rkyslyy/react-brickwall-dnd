import {
  Location,
  OnChildRepositionCallback,
} from "./../components/Brickwall/Brickwall.models";
import { hasBrickwallId } from "../utils/hasBrickwallId";

import Item from "./Item";
import Dropzone from "./Dropzone";
import { wait } from "../utils/wait";

interface DndControllerOptions {
  animationSpeed: number;
  gridGap: number;
  onItemsReposition: OnChildRepositionCallback;
}

class DndController {
  contextWrapper: HTMLElement;

  dropzones: Dropzone[] = [];
  draggedItem: Item | null = null;

  animationSpeed: number;
  gridGap: number;
  onItemsReposition: OnChildRepositionCallback;

  initialItemGrabLocation: Location | null;
  grabbedItemCurrentLocation: Location | null;

  constructor({ animationSpeed, gridGap, onItemsReposition }: DndControllerOptions) {
    this.animationSpeed = animationSpeed;
    this.gridGap = gridGap;
    this.onItemsReposition = onItemsReposition;
  }

  setup = (contextWrapper: HTMLElement | null) => {
    if (!contextWrapper) return;

    this.prepareDocument();
    this.prepareContextWrapper(contextWrapper);
    this.prepareDropzonesAndItems();

    // Initial positioning
    this.repositionItems(false);

    // Enable stretch animation on dropzones
    process.nextTick(() =>
      this.dropzones.forEach((dropzone) => dropzone.allowStretching(this.animationSpeed))
    );
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

    this.draggedItem.applyDefaultStyle(this.animationSpeed);
    this.draggedItem = null;

    this.repositionItems();

    await wait(this.animationSpeed); // to not interrupt final animation

    if (!!this.initialItemGrabLocation && !!this.grabbedItemCurrentLocation) {
      this.onItemsReposition(
        this.initialItemGrabLocation.dropzone.id,
        this.initialItemGrabLocation.index,
        this.grabbedItemCurrentLocation.dropzone.id,
        this.grabbedItemCurrentLocation.index
      );
    }

    this.initialItemGrabLocation = null;
    this.grabbedItemCurrentLocation = null;
  };

  /**
   * Called when <Brickwall /> children have changed to update each dropzone's items.
   */
  rebuildDropzones = () => {
    this.prepareDropzonesAndItems();
    this.repositionItems(false);
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

  handleIndexSwitchInsideDropzone = (dropzone: Dropzone, from: number, to: number) => {
    dropzone.switchItemPosition(from, to);

    this.grabbedItemCurrentLocation = { dropzone, index: to };

    this.repositionItems();
  };

  /**
   * Loop over each dropzone's items and check whether any of them
   * are hovered by dragged item to trigger reposition
   */
  handleContextWrapperMouseMove = (e: MouseEvent) => {
    if (!this.draggedItem) return;

    for (const dropzone of this.dropzones) {
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
    }
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
      const isDirectionLeft = draggedItemIndexInDropzone > hoveredItemIndex;
      const draggedItemIndexAfterSwitch = Math.max(
        0,
        this.getDraggedItemIndexAfterSwitch(
          isLeftSideHovered,
          isDirectionLeft,
          hoveredItemIndex
        )
      );

      if (draggedItemIndexAfterSwitch !== draggedItemIndexInDropzone) {
        this.handleIndexSwitchInsideDropzone(
          dropzone,
          draggedItemIndexInDropzone,
          draggedItemIndexAfterSwitch
        );
      }
    }
  };

  getDraggedItemIndexAfterSwitch = (
    isLeftSideHovered: boolean,
    isDirectionLeft: boolean,
    hoveredItemIndex: number
  ) => {
    if (isLeftSideHovered && !isDirectionLeft) return hoveredItemIndex - 1;
    else if (!isLeftSideHovered && isDirectionLeft) return hoveredItemIndex + 1;

    return hoveredItemIndex;
  };

  handleHoveredNearItem = (dropzone: Dropzone, itemIndex: number) => {
    if (!this.draggedItem) return;

    const draggedItemIndexInDropzone = dropzone.indexOfItem(this.draggedItem);

    if (draggedItemIndexInDropzone === -1) {
      this.placeDraggedItemInNewDropzone(dropzone, this.draggedItem, itemIndex + 1);
    } else {
      const directionLeft = draggedItemIndexInDropzone > itemIndex;

      this.handleIndexSwitchInsideDropzone(
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

    for (const dropzone of this.dropzones) {
      if (!dropzone.container.style.minHeight) dropzone.container.style.minHeight = "30px";

      dropzone.items.forEach((item) => {
        item.itemElement.style.position = "absolute";

        item.itemElement.onmousedown = (e) => {
          if (this.draggedItem) return;

          item.applyMouseDownStyle(e);
          this.draggedItem = item;
          this.initialItemGrabLocation = this.grabbedItemCurrentLocation = {
            dropzone: item.dropzone,
            index: item.dropzone.items.lastIndexOf(item),
          };
        };
      });
    }
  };

  /**
   * Recursively find all elements with id that starts with "bw-dz".
   */
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

  /**
   * Loop over all items in dropzones and place them based on previous item's
   * position in dropzone.
   */
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
        const shouldAnimateRepositioning = animated && item !== this.draggedItem;
        item.toggleAnimation(shouldAnimateRepositioning, this.animationSpeed);

        item.placeInDropzone({ xOffset, yOffset });

        // Get horizonral offset for next item
        xOffset += item.getFullWidth() + this.gridGap;

        // Extend resulting container height if item won't fit in current row
        if (item.rect.height + yOffset > resultingContainerHeight)
          resultingContainerHeight = yOffset + item.rect.height + this.gridGap;
      });

      // Extend container height
      dropzone.container.style.height = `${resultingContainerHeight}px`;
    });
  };
}

export default DndController;
