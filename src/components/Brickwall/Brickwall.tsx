import React from "react";

import { DropItem, DropZone } from "../../entities";
import { collectDropzones } from "../../utils/collectDropzones";

import { BrickwallProps, FinalReposition, Location } from "./Brickwall.models";

const Brickwall: React.FC<BrickwallProps> = ({
  children,
  gridGap = 0,
  onChildrenReposition,
  wrapperClassname,
}) => {
  const context = React.useRef<HTMLDivElement>(null);
  const dropZones = React.useRef<DropZone[]>([]);
  const draggedElement = React.useRef<DropItem | null>(null);

  const finalReposition = React.useRef<FinalReposition>({});
  const currentFrom = React.useRef<Location>();

  const repositionChildren = React.useCallback((animated = true) => {
    if (!context.current) return;

    dropZones.current.forEach((dropZone) => {
      if (!dropZone.container.style.minHeight) dropZone.container.style.minHeight = "30px";

      const maxWidth = dropZone.container.clientWidth;

      let xOffset = gridGap;
      let yOffset = gridGap;
      let containerHeight = 0;

      dropZone.items.forEach((child, i) => {
        child.self.style.position = "absolute";

        if (xOffset + child.getFullWidth() + gridGap > maxWidth) {
          xOffset = gridGap;
          yOffset = containerHeight;
        }
        child.animateIf(child !== draggedElement.current && animated);
        child.landInDropZone({ xOffset, yOffset });
        xOffset += child.getFullWidth() + gridGap;

        child.self.onmousedown = (e) => {
          if (draggedElement.current || !context.current) return;
          child.applyMouseDownStyle(e);
          draggedElement.current = child;
          finalReposition.current.from = { dropZone, index: i };
          currentFrom.current = { dropZone, index: i };
        };

        if (child.rect().height + yOffset > containerHeight)
          containerHeight = yOffset + child.rect().height + gridGap;
      });
      dropZone.container.style.height = `${containerHeight}px`;
    });
  }, []);

  const moveDawg = React.useCallback(
    (e: MouseEvent) => draggedElement.current?.move(e),
    [draggedElement]
  );

  React.useEffect(() => {
    if (!context.current) return;

    dropZones.current = collectDropzones(context.current);

    if (!context.current.onmousemove) {
      context.current.onmousemove = (e) => {
        for (let i = 0; i < dropZones.current.length; i++) {
          const dropZone = dropZones.current[i];
          if (!draggedElement.current) break;
          if (
            !dropZone.items.length &&
            e.clientX > dropZone.container.getBoundingClientRect().x &&
            e.clientX < dropZone.container.getBoundingClientRect().right &&
            e.clientY > dropZone.container.getBoundingClientRect().y &&
            e.clientY < dropZone.container.getBoundingClientRect().bottom
          ) {
            if (currentFrom.current) {
              currentFrom.current.dropZone.removeItemAt(currentFrom.current.index);
              dropZone.items.push(draggedElement.current);
              draggedElement.current.updateDropZone(dropZone);
              finalReposition.current.to = {
                dropZone,
                index: 0,
              };
              currentFrom.current = { dropZone, index: 0 };
              repositionChildren();
            }
            break;
          }
          for (let i = 0; i < dropZone.items.length; i++) {
            const child = dropZone.items[i];
            if (draggedElement.current === child) continue;
            if (child.isHovered(e)) {
              const currentDraggableElementPosition = dropZone.indexOfItem(
                draggedElement.current
              );
              if (currentDraggableElementPosition === -1) {
                const potentialNewPosition = i + (child.isLeftSideHovered(e) ? 0 : 1);
                if (currentFrom.current) {
                  currentFrom.current.dropZone.removeItemAt(currentFrom.current.index);
                  dropZone.insertItemAt(potentialNewPosition, draggedElement.current);
                  finalReposition.current.to = {
                    dropZone,
                    index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
                  };
                  currentFrom.current = { dropZone, index: potentialNewPosition };
                  repositionChildren();
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
                  finalReposition.current.to = {
                    dropZone,
                    index: potentialNewPosition === -1 ? 0 : potentialNewPosition,
                  };
                  currentFrom.current = { dropZone, index: potentialNewPosition };
                  repositionChildren();
                }
              }
              break;
            } else if (
              dropZone.items[i + 1]?.rect().y !== child.rect().y &&
              child.hoveringNear(e)
            ) {
              const currentDraggableElementPosition = dropZone.indexOfItem(
                draggedElement.current
              );
              if (currentDraggableElementPosition === -1) {
                if (currentFrom.current) {
                  currentFrom.current.dropZone.removeItemAt(currentFrom.current.index);
                  dropZone.insertItemAt(i + 1, draggedElement.current);
                  finalReposition.current.to = {
                    dropZone,
                    index: i + 1,
                  };
                  currentFrom.current = { dropZone, index: i + 1 };
                  repositionChildren();
                }
              } else {
                if (currentDraggableElementPosition !== i) {
                  const directionLeft = currentDraggableElementPosition > i;
                  dropZone.switchItemPosition(
                    currentDraggableElementPosition,
                    directionLeft ? i + 1 : i
                  );
                  finalReposition.current.to = {
                    dropZone,
                    index: directionLeft ? i + 1 : i,
                  };
                  currentFrom.current = { dropZone, index: directionLeft ? i + 1 : i };
                  repositionChildren();
                }
              }
            }
          }
        }
      };
    }

    repositionChildren(false);
  }, [children, repositionChildren]);

  React.useEffect(() => {
    const cleanDraggedElement = () => {
      if (!draggedElement.current) return;
      draggedElement.current.self.style.zIndex = "1";
      draggedElement.current.self.style.transition = "all .15s ease";
      draggedElement.current.self.style.cursor = "grab";
      draggedElement.current = null;
      repositionChildren();
      setTimeout(() => {
        if (
          finalReposition.current.from !== undefined &&
          finalReposition.current.to !== undefined
        )
          onChildrenReposition(
            finalReposition.current.from.dropZone.id,
            finalReposition.current.from.index,
            finalReposition.current.to.dropZone.id,
            finalReposition.current.to.index
          );
        finalReposition.current = {};
        currentFrom.current = undefined;
      }, 150);
    };
    document.addEventListener("mouseup", cleanDraggedElement);
    document.addEventListener("mousemove", moveDawg);
    return () => {
      document.removeEventListener("mouseup", cleanDraggedElement);
      document.removeEventListener("mousemove", moveDawg);
    };
  }, [moveDawg, repositionChildren, onChildrenReposition]);

  return (
    <div
      style={{ display: "flex", position: "relative" }}
      className={wrapperClassname}
      ref={context}
    >
      {children}
    </div>
  );
};

export default Brickwall;
