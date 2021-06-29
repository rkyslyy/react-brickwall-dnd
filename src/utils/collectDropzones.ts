import { DropZone } from "../entities";

const hasBrickwallId = (element: HTMLElement) => element.id?.match(/^bw-dz/);

export const collectDropzones = (container: HTMLElement) => {
  const dropzones: DropZone[] = [];

  container.children.array().forEach((child) => {
    if (hasBrickwallId(child)) {
      dropzones.push(new DropZone(child));
    } else {
      dropzones.push(...collectDropzones(child));
    }
  });

  return dropzones;
};
