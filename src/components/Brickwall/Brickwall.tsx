import React from "react";

import DndController from "../../entities/DndController";

import { BrickwallProps } from "./Brickwall.models";

const Brickwall: React.FC<BrickwallProps> = ({
  children,
  gridGap = 0,
  onChildrenReposition,
  wrapperClassname,
}) => {
  const dndController = React.useRef(
    new DndController({ gridGap, onFinalItemsReposition: onChildrenReposition })
  );

  return (
    <div
      style={{ display: "flex", position: "relative" }}
      className={wrapperClassname}
      ref={(r) => !!r && dndController.current.setup(r)}
    >
      {children}
    </div>
  );
};

export default Brickwall;

// const dndController = React.useRef(
//   new DndController({ gridGap, onFinalItemsReposition: onChildrenReposition })
// );

// return (
//   <div
//     style={{ display: "flex", position: "relative" }}
//     className={wrapperClassname}
//     ref={(r) => !!r && dndController.current.setup(r)}
//   >
//     {children}
//   </div>
// );
