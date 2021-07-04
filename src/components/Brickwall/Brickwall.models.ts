import { Dropzone } from "../../entities";

export type OnChildRepositionCallback = (
  fromId: string,
  fromIndex: number,
  toId: string,
  toIndex: number
) => void;

export interface BrickwallProps {
  animationSpeed?: number;
  gridGap?: number;
  wrapperClassname?: string;
  onChildrenReposition: OnChildRepositionCallback;
}

export interface DraggedItemSource {
  dropzone: Dropzone;
  index: number;
}

export interface FinalReposition {
  from?: DraggedItemSource;
  to?: DraggedItemSource;
}

export interface Location {
  dropzone: Dropzone;
  index: number;
}
