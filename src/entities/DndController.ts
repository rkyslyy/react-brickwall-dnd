import { Location, OnItemDropCallback } from "./../components/Brickwall/Brickwall.models";
import { hasBrickwallId } from "../utils/hasBrickwallId";

import Item from "./Item";
import Dropzone from "./Dropzone";
import { wait } from "../utils/wait";

interface DndControllerOptions {
  animationSpeed: number;
  gridGap: number;
  onItemDrop: OnItemDropCallback;
}

class DndController {
  contextWrapper: HTMLElement;

  dropzones: Dropzone[] = [];
  draggedItem: Item | null = null;

  animationSpeed: number;
  gridGap: number;
  onItemDrop: OnItemDropCallback;

  initialItemGrabLocation: Location | null;
  grabbedItemCurrentLocation: Location | null;

  constructor({ animationSpeed, gridGap, onItemDrop }: DndControllerOptions) {
    this.animationSpeed = animationSpeed;
    this.gridGap = gridGap;
    this.onItemDrop = onItemDrop;
  }

  setup = (contextWrapper: HTMLElement | null) => {
    if (!contextWrapper) return;

    this.prepareDocument();
    this.prepareContextWrapper(contextWrapper);
    this.prepareDropzonesAndItems();

    // Initial positioning
    this.repositionItems(false);

    // Enable stretch animation on dropzones once initial positioning is finished
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
      this.onItemDrop(
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

  moveDraggedItem = (e: MouseEvent) => this.draggedItem?.moveOnScreen(e);

  placeDraggedItemInNewDropzone = (newDropzone: Dropzone, item: Item, index = 0) => {
    // this.grabbedItemCurrentLocation?.dropzone.removeItemAt(
    //   this.grabbedItemCurrentLocation.index
    // );

    newDropzone.insertItemAt(index, item);

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
      if (dropzone.isEmptyAndHovered(e)) {
        this.placeDraggedItemInNewDropzone(dropzone, this.draggedItem);
        return;
      }

      dropzone.items.forEach((item, itemIndex) => {
        if (!this.draggedItem || this.draggedItem === item) return;

        const isItemHovered = item.isHovered(e);
        const isHoveringFreeSpaceNearItem = dropzone.isHoveringAvailableSpaceNearItem(item, e);
        const draggedItemIndexInDropzone = dropzone.indexOfItem(this.draggedItem);

        if (isItemHovered) {
          this.handleItemHovered(dropzone, draggedItemIndexInDropzone, item, itemIndex, e);
        } else if (isHoveringFreeSpaceNearItem) {
          this.handleHoveredNearItem(draggedItemIndexInDropzone, dropzone, itemIndex);
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

  handleHoveredNearItem = (
    draggedItemIndexInDropzone: number,
    dropzone: Dropzone,
    itemIndex: number
  ) => {
    if (!this.draggedItem) return;

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
      dropzone.items.forEach((item) => {
        item.itemElement.style.position = "absolute";

        item.itemElement.onmousedown = (e) => {
          if (this.draggedItem) return;

          item.applyMouseDownStyle(e);
          this.draggedItem = item;
          this.initialItemGrabLocation = this.grabbedItemCurrentLocation = {
            dropzone: item.dropzone,
            index: item.dropzone.indexOfItem(item),
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
      dropzone.repositionItems(animated, this.animationSpeed, this.gridGap, this.draggedItem);
    });
  };
}

export default DndController;
