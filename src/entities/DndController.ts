import DropItem from "./DropItem";
import DropZone from "./DropZone";

class DndController {
  contextWrapper: HTMLElement;
  dropZones: DropZone[] = [];
  dropItems: DropItem[] = [];

  repositionItems() {}
}

export default DndController;
