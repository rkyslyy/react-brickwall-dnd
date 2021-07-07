import React from "react";

export const useDataSourceController = <K extends string, V>(
  itemListsMapping: Record<K, V[]>
) => {
  const [lists, setLists] = React.useState(itemListsMapping);

  const handleItemDrop = React.useCallback(
    (fromId: string, fromIndex: number, toId: string, toIndex: number) => {
      const copy = { ...lists };
      const item = copy[fromId].splice(fromIndex, 1)[0];

      copy[toId].splice(toIndex, 0, item);

      setLists(copy);
    },
    [lists]
  );

  return { lists, handleItemDrop };
};
