import { OnChildRepositionCallback } from "./../components/Brickwall/Brickwall.models";
import { FinalReposition, Location } from "../components/Brickwall/Brickwall.models";
import { collectDropzones } from "../utils/collectDropzones";

import DropItem from "./DropItem";
import DropZone from "./DropZone";

interface DndControllerOptions {
  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;
}

class DndController {
  contextWrapper: HTMLElement;

  dropZones: DropZone[] = [];
  dropItems: DropItem[] = [];
  draggedItem: DropItem | null = null;

  gridGap: number;
  onFinalItemsReposition: OnChildRepositionCallback;

  finalReposition: FinalReposition = {};
  currentFrom: Location | null = null;

  constructor({ gridGap, onFinalItemsReposition }: DndControllerOptions) {
    this.gridGap = gridGap;
    this.onFinalItemsReposition = onFinalItemsReposition;
  }

  setup = (contextWrapper: HTMLElement) => {
    // Make document listen to mouse events
    this.prepareDocument();

    // Make wrapper interactive (listen to clicks, drags etc)
    this.prepareContextWrapper(contextWrapper);

    // Set base styles, make items responsive to clicks
    this.prepareDropzonesAndItems();

    // Initial positioning
    this.repositionItems();
  };

  prepareDocument = () => {
    document.addEventListener("mouseup", this.clearDraggedItem);
    document.addEventListener("mousemove", this.moveDraggedItem);
    return () => {
      document.removeEventListener("mouseup", this.clearDraggedItem);
      document.removeEventListener("mousemove", this.moveDraggedItem);
    };
  };

  clearDraggedItem = () => {
    if (!this.draggedItem) return;
    this.draggedItem.self.style.zIndex = "1";
    this.draggedItem.self.style.transition = "all .15s ease";
    this.draggedItem.self.style.cursor = "grab";
    this.draggedItem = null;
    this.repositionItems();

    // setTimeout() needed to allow animation to finish
    setTimeout(() => {
      if (this.finalReposition.from !== undefined && this.finalReposition.to !== undefined)
        this.onFinalItemsReposition(
          this.finalReposition.from.dropZone.id,
          this.finalReposition.from.index,
          this.finalReposition.to.dropZone.id,
          this.finalReposition.to.index
        );
      this.finalReposition = {};
      this.currentFrom = null;
    }, 150);
  };

  moveDraggedItem = (e: MouseEvent) => this.draggedItem?.move(e);

  prepareContextWrapper = (contextWrapper: HTMLElement) => {
    this.contextWrapper = contextWrapper;

    contextWrapper.onmousemove = (e) => {
      for (let i = 0; i < this.dropZones.length; i++) {
        const dropZone = this.dropZones[i];
        if (!this.draggedItem) break;
        if (
          !dropZone.items.length &&
          e.clientX > dropZone.container.getBoundingClientRect().x &&
          e.clientX < dropZone.container.getBoundingClientRect().right &&
          e.clientY > dropZone.container.getBoundingClientRect().y &&
          e.clientY < dropZone.container.getBoundingClientRect().bottom
        ) {
          if (this.currentFrom) {
            this.currentFrom.dropZone.removeItemAt(this.currentFrom.index);
            dropZone.items.push(this.draggedItem);
            this.draggedItem.updateDropZone(dropZone);
            this.finalReposition.to = {
              dropZone,
              index: 0,
            };
            this.currentFrom = { dropZone, index: 0 };
            this.repositionItems();
          }
          break;
        }
        for (let i = 0; i < dropZone.items.length; i++) {
          const child = dropZone.items[i];
          if (this.draggedItem === child) continue;
          if (child.isHovered(e)) {
            const currentDraggableElementPosition = dropZone.indexOfItem(this.draggedItem);
            if (currentDraggableElementPosition === -1) {
              const potentialNewPosition = i + (child.isLeftSideHovered(e) ? 0 : 1);
              if (this.currentFrom) {
                this.currentFrom.dropZone.removeItemAt(this.currentFrom.index);
                dropZone.insertItemAt(potentialNewPosition, this.draggedItem);
                this.finalReposition.to = {
                  dropZone,
                  index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
                };
                this.currentFrom = { dropZone, index: potentialNewPosition };
                this.repositionItems();
              }
            } else {
              const isLeftSideHovered = child.isLeftSideHovered(e);
              const directionLeft = currentDraggableElementPosition > i;
              let pp: number;
              if (isLeftSideHovered && !directionLeft) pp = i - 1;
              else if (isLeftSideHovered && directionLeft) pp = i;
              else if (!isLeftSideHovered && !directionLeft) pp = i;
              else pp = i + 1;
              const potentialNewPosition = pp;
              if (potentialNewPosition !== currentDraggableElementPosition) {
                dropZone.switchItemPosition(
                  currentDraggableElementPosition,
                  potentialNewPosition === -1 ? 0 : potentialNewPosition
                );
                this.finalReposition.to = {
                  dropZone,
                  index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
                };
                this.currentFrom = { dropZone, index: potentialNewPosition };
                this.repositionItems();
              }
            }
            break;
          } else if (
            dropZone.items[i + 1]?.rect().y !== child.rect().y &&
            child.hoveringNear(e)
          ) {
            const currentDraggableElementPosition = dropZone.indexOfItem(this.draggedItem);
            if (currentDraggableElementPosition === -1) {
              if (this.currentFrom) {
                this.currentFrom.dropZone.removeItemAt(this.currentFrom.index);
                dropZone.insertItemAt(i + 1, this.draggedItem);
                this.finalReposition.to = {
                  dropZone,
                  index: i + 1,
                };
                this.currentFrom = { dropZone, index: i + 1 };
                this.repositionItems();
              }
            } else {
              if (currentDraggableElementPosition !== i) {
                const directionLeft = currentDraggableElementPosition > i;
                dropZone.switchItemPosition(
                  currentDraggableElementPosition,
                  directionLeft ? i + 1 : i
                );
                this.finalReposition.to = {
                  dropZone,
                  index: directionLeft ? i + 1 : i,
                };
                this.currentFrom = { dropZone, index: directionLeft ? i + 1 : i };
                this.repositionItems();
              }
            }
          }
        }
      }
    };
  };

  prepareDropzonesAndItems = () => {
    // TODO - move collectDropzones from utils to this class
    this.dropZones = collectDropzones(this.contextWrapper);

    for (let i = 0; i < this.dropZones.length; i++) {
      const dropZone = this.dropZones[i];

      if (!dropZone.container.style.minHeight) dropZone.container.style.minHeight = "30px";

      dropZone.items.forEach((item, index) => {
        item.self.style.position = "absolute";

        item.self.onmousedown = (e) => {
          if (this.draggedItem) return;

          item.applyMouseDownStyle(e);
          this.draggedItem = item;
          this.finalReposition.from = { dropZone, index };
          this.currentFrom = { dropZone, index };
        };
      });
    }
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
