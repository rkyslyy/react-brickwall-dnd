import { FinalReposition, Location } from "../components/Brickwall/Brickwall.models";
import { collectDropzones } from "../utils/collectDropzones";
import DropItem from "./DropItem";
import DropZone from "./DropZone";

interface DndControllerOptions {
  gridGap: number;
}

class DndController {
  contextWrapper: HTMLElement;

  dropZones: DropZone[] = [];
  dropItems: DropItem[] = [];
  draggedItem: DropItem | null = null;

  gridGap: number;

  finalReposition: FinalReposition = {};
  currentFrom: Location | null = null;

  constructor({ gridGap }: DndControllerOptions) {
    this.gridGap = gridGap;
  }

  setup(contextWrapper: HTMLElement) {
    this.contextWrapper = contextWrapper;
    this.prepareDropzonesAndItems();
    this.repositionItems();
  }

  prepareDropzonesAndItems() {
    // TODO - move collectDropzones from utils to this class
    this.dropZones = collectDropzones(this.contextWrapper);

    this.dropZones.forEach((dropZone) => {
      if (!dropZone.container.style.minHeight) dropZone.container.style.minHeight = "30px";

      dropZone.items.forEach((child, index) => {
        child.self.style.position = "absolute";

        child.self.onmousedown = (e) => {
          if (this.draggedItem) return;

          child.applyMouseDownStyle(e);
          this.draggedItem = child;
          this.finalReposition.from = { dropZone, index };
          this.currentFrom = { dropZone, index };
        };
      });
    });
  }

  repositionItems(animated: boolean = true) {
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
  }
}

export default DndController;
