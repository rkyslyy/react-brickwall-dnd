import { OnChildRepositionCallback } from "./../components/Brickwall/Brickwall.models";
import { FinalReposition, DraggedItemSource } from "../components/Brickwall/Brickwall.models";
import { hasBrickwallId } from "../utils/hasBrickwallId";

import DropItem from "./DropItem";
import DropZone from "./DropZone";
import { wait } from "../utils/wait";

interface DndControllerOptions {
  animationSpeed: number;
  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;
}

class DndController {
  contextWrapper: HTMLElement;

  dropZones: DropZone[] = [];
  dropItems: DropItem[] = [];
  draggedItem: DropItem | null = null;

  animationSpeed: number;
  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;

  finalReposition: FinalReposition = {};
  latestHoveredDropZone: DraggedItemSource | null = null;

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
    process.nextTick(() => this.dropZones.forEach((dropZone) => dropZone.allowStretching()));
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

    if (!!this.finalReposition.from && !!this.finalReposition.to) {
      this.onFinalItemsReposition(
        this.finalReposition.from.dropZone.id,
        this.finalReposition.from.index,
        this.finalReposition.to.dropZone.id,
        this.finalReposition.to.index
      );
    }

    this.finalReposition = {};
    this.latestHoveredDropZone = null;
  };

  moveDraggedItem = (e: MouseEvent) => this.draggedItem?.move(e);

  isDraggingOverEmptyDropZone = (dropZone: DropZone, e: MouseEvent) => {
    const isDropZoneEmpty = !dropZone.items.length;
    const isCursorInsideDropzone =
      e.clientX > dropZone.container.getBoundingClientRect().x &&
      e.clientX < dropZone.container.getBoundingClientRect().right &&
      e.clientY > dropZone.container.getBoundingClientRect().y &&
      e.clientY < dropZone.container.getBoundingClientRect().bottom;

    return isDropZoneEmpty && isCursorInsideDropzone;
  };

  // TODO - rename "drop" to something else
  dropItemInEmptyDropZone = (newDropZone: DropZone, item: DropItem, newIndex = 0) => {
    //eslint-disable-next-line
    console.log("DROPPING IN EMPTY DZ");
    if (this.latestHoveredDropZone) {
      const { dropZone, index } = this.latestHoveredDropZone;
      dropZone.removeItemAt(index);
    }

    newDropZone.items.push(item);
    item.updateDropZone(newDropZone);

    this.finalReposition.to = { dropZone: newDropZone, index: newIndex };
    this.latestHoveredDropZone = { dropZone: newDropZone, index: newIndex };
  };

  handleContextWrapperMouseMove = (e: MouseEvent) => {
    this.dropZones.forEach((dropZone) => {
      if (!this.draggedItem) return;

      if (this.isDraggingOverEmptyDropZone(dropZone, e)) {
        this.dropItemInEmptyDropZone(dropZone, this.draggedItem);
        this.repositionItems();
        return;
      }

      dropZone.items.forEach((child, i) => {
        if (!this.draggedItem || this.draggedItem === child) return;

        if (child.isHovered(e)) {
          const draggedItemIndexInDropZone = dropZone.indexOfItem(this.draggedItem);

          //eslint-disable-next-line
          // console.log(
          //   "INDEX OF",
          //   this.draggedItem.self.textContent,
          //   "IN DZ",
          //   dropZone.id,
          //   "=",
          //   draggedItemIndexInDropZone
          // );

          // Dragged item is from another dropzone
          if (draggedItemIndexInDropZone === -1) {
            const potentialNewPosition = i + (child.isLeftSideHovered(e) ? 0 : 1);
            //eslint-disable-next-line
            console.log("DROPPING IN DIFFERENT DROPZONE", dropZone.id);

            if (this.latestHoveredDropZone) {
              //eslint-disable-next-line
              console.log(
                "REMOVING FROM",
                this.latestHoveredDropZone.dropZone.id,
                "AT",
                this.latestHoveredDropZone.index
              );
              this.latestHoveredDropZone.dropZone.removeItemAt(
                this.latestHoveredDropZone.index
              );

              console.log("INSERTING IN", dropZone.id, "AT", potentialNewPosition);
              dropZone.insertItemAt(potentialNewPosition, this.draggedItem);
              this.finalReposition.to = {
                dropZone,
                index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
              };
              this.latestHoveredDropZone = { dropZone, index: potentialNewPosition };
              this.repositionItems();
            }
          } else {
            //eslint-disable-next-line
            console.log("DROPPING IN SAME DZ", dropZone.id);
            // TODO - too many enters
            const isLeftSideHovered = child.isLeftSideHovered(e);
            const directionLeft = draggedItemIndexInDropZone > i;
            let pp: number;
            if (isLeftSideHovered && !directionLeft) pp = i - 1;
            else if (isLeftSideHovered && directionLeft) pp = i;
            else if (!isLeftSideHovered && !directionLeft) pp = i;
            else pp = i + 1;
            const potentialNewPosition = pp;
            if (potentialNewPosition !== draggedItemIndexInDropZone) {
              dropZone.switchItemPosition(
                draggedItemIndexInDropZone,
                potentialNewPosition === -1 ? 0 : potentialNewPosition
              );
              this.finalReposition.to = {
                dropZone,
                index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
              };
              this.latestHoveredDropZone = { dropZone, index: potentialNewPosition };
              this.repositionItems();
            }
          }
        } else if (
          dropZone.items[i + 1]?.rect().y !== child.rect().y &&
          child.hoveringNear(e)
        ) {
          //eslint-disable-next-line
          console.log("WE HERE BOBO");
          const currentDraggableElementPosition = dropZone.indexOfItem(this.draggedItem);

          if (currentDraggableElementPosition === -1) {
            //eslint-disable-next-line
            console.log("NOT FOUND");
            if (this.latestHoveredDropZone) {
              console.log(
                "REMOVING FROM",
                this.latestHoveredDropZone.dropZone.id,
                "AT",
                this.latestHoveredDropZone.index
              );
              this.latestHoveredDropZone.dropZone.removeItemAt(
                this.latestHoveredDropZone.index
              );

              console.log("INSERTING IN", dropZone.id, "AT", i + 1);
              dropZone.insertItemAt(i + 1, this.draggedItem);
              this.finalReposition.to = {
                dropZone,
                index: i + 1,
              };
              this.latestHoveredDropZone = { dropZone, index: i + 1 };
              this.repositionItems();
            }
          } else {
            console.log("FOUND");
            if (currentDraggableElementPosition !== i) {
              //eslint-disable-next-line
              console.log("XX");
              const directionLeft = currentDraggableElementPosition > i;
              dropZone.switchItemPosition(
                currentDraggableElementPosition,
                directionLeft ? i + 1 : i
              );
              this.finalReposition.to = {
                dropZone,
                index: directionLeft ? i + 1 : i,
              };
              this.latestHoveredDropZone = { dropZone, index: directionLeft ? i + 1 : i };
              this.repositionItems();
            }
          }
        }
      });
    });
  };

  /**
   * Setup all positioning calculations.
   * TODO - refactor this horrible mess
   */
  prepareContextWrapper = (contextWrapper: HTMLElement) => {
    this.contextWrapper = contextWrapper;
    contextWrapper.style.display = "flex";
    contextWrapper.style.position = "relative";
    contextWrapper.onmousemove = this.handleContextWrapperMouseMove;
  };

  /**
   * Recursively check all context children and build DropZone and DropItem objects.
   */
  prepareDropzonesAndItems = () => {
    // TODO - move collectDropzones from utils to this class
    this.dropZones = this.collectDropzones(this.contextWrapper);

    for (let i = 0; i < this.dropZones.length; i++) {
      const dropZone = this.dropZones[i];

      if (!dropZone.container.style.minHeight) dropZone.container.style.minHeight = "30px";

      dropZone.items.forEach((item) => {
        item.self.style.position = "absolute";

        item.self.onmousedown = (e) => {
          if (this.draggedItem) return;

          item.applyMouseDownStyle(e);
          this.draggedItem = item;
          this.finalReposition.from = {
            dropZone: item.dropZone,
            index: item.dropZone.items.lastIndexOf(item),
          };
          this.latestHoveredDropZone = {
            dropZone: item.dropZone,
            index: item.dropZone.items.lastIndexOf(item),
          };
        };
      });
    }
  };

  collectDropzones = (container: HTMLElement) => {
    const dropzones: DropZone[] = [];

    container.children.array().forEach((child) => {
      if (hasBrickwallId(child)) {
        dropzones.push(new DropZone(child));
      } else {
        dropzones.push(...this.collectDropzones(child));
      }
    });

    return dropzones;
  };

  repositionItems = (animated: boolean = true) => {
    this.dropZones.forEach((dropZone) => {
      const maxWidth = dropZone.container.clientWidth;

      let xOffset = this.gridGap;
      let yOffset = this.gridGap;
      let resultingContainerHeight = parseInt(dropZone.container.style.minHeight);

      dropZone.items.forEach((item) => {
        // Decide if we want to render this item near left edge and below current row
        if (xOffset + item.getFullWidth() + this.gridGap > maxWidth) {
          xOffset = this.gridGap;
          yOffset = resultingContainerHeight;
        }

        // Dragged item should change location without transition effect
        item.animateIf(item !== this.draggedItem && animated);

        // TODO - not sure what this line does to dragged item
        item.landInDropZone({ xOffset, yOffset });

        // Get horizonral offset for next item
        xOffset += item.getFullWidth() + this.gridGap;

        // Extend resulting container height if item won't fit in current row
        if (item.rect().height + yOffset > resultingContainerHeight)
          resultingContainerHeight = yOffset + item.rect().height + this.gridGap;
      });

      // Actually extend container height
      dropZone.container.style.height = `${resultingContainerHeight}px`;
    });
  };
}

export default DndController;
