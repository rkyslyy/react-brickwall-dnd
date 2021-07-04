import React from "react";
import { DEFAULT_ANIMATION_SPEED } from "../../constants";

import { DndController } from "../../entities";

import { BrickwallProps } from "./Brickwall.models";

const Brickwall: React.FC<BrickwallProps> = ({
  animationSpeed = DEFAULT_ANIMATION_SPEED,
  children,
  gridGap = 0,
  onItemsReposition,
  wrapperClassname,
}) => {
  const dndController = React.useRef(
    new DndController({
      animationSpeed,
      gridGap,
      onItemsReposition,
    })
  );

  React.useEffect(() => dndController.current.rebuildDropzones(), [children]);

  return (
    <div className={wrapperClassname} ref={dndController.current.setup}>
      {children}
    </div>
  );
};

export default Brickwall;
