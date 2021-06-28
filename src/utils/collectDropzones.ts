import { DropZone } from "../entities";

export const collectDropzones = (container: HTMLElement) => {
  const res: DropZone[] = [];

  container.children.array().forEach((child) => {
    if (child.id) res.push(new DropZone(child));
    else
      child.children.array().forEach((subChild) => {
        if (subChild.id) res.push(new DropZone(subChild));
        else
          subChild.children.array().forEach((subSubChild) => {
            if (subSubChild.id) res.push(new DropZone(subSubChild));
          });
      });
  });
};
