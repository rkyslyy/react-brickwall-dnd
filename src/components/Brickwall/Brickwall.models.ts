import { DropZone } from "../../entities";

type OnChildRepositionCallback = (
  fromId: string,
  fromIndex: number,
  toId: string,
  toIndex: number
) => void;

export interface BrickwallProps {
  gridGap?: number;
  wrapperClassname?: string;
  onChildrenReposition: OnChildRepositionCallback;
}

export interface Location {
  dropZone: DropZone;
  index: number;
}

export interface FinalReposition {
  from?: Location;
  to?: Location;
}
