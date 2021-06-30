import React from "react";
import { DEFAULT_ANIMATION_SPEED } from "../../constants";

import DndController from "../../entities/DndController";

import { BrickwallProps } from "./Brickwall.models";

const Brickwall: React.FC<BrickwallProps> = ({
  animationSpeed = DEFAULT_ANIMATION_SPEED,
  children,
  gridGap = 0,
  onChildrenReposition,
  wrapperClassname,
}) => {
  const dndController = React.useRef(
    new DndController({
      animationSpeed,
      gridGap,
      onFinalItemsReposition: onChildrenReposition,
    })
  );

  return (
    <div className={wrapperClassname} ref={dndController.current.setup}>
      {children}
    </div>
  );
};

export default Brickwall;
