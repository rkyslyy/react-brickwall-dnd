# React Brickwall Drag & Drop &nbsp;<img src="https://raw.githubusercontent.com/rkyslyy/react-brickwall-dnd/main/logo.svg" width="50"/>

![example workflow](https://github.com/rkyslyy/react-brickwall/actions/workflows/ci.yml/badge.svg)
[![npm version](https://badge.fury.io/js/react-brickwall-dnd.svg)](https://www.npmjs.com/package/react-brickwall-dnd)
[![made-with-typescript](https://img.shields.io/badge/Made%20with-Typescript-1f425f.svg)](https://www.typescriptlang.org/)

React Brickwall Drag & Drop is a fancy way to move items across multiple data sources via React-driven UI.

<img src="https://i.imgur.com/Dx0dy0O.gif"/>
<br/>
<br/>

## Installing

```
npm install react-brickwall
```

## Usage

All dropzones should be wrapped inside a `<Brickwall />` component. Any HTML element inside `<Brickwall />` that has an `id` prop starting with `bw-dz` will be considered a dropzone. Dropzones cannot be nested. All direct children of a dropzone are draggable items.

React Brickwall provides a handy way of controlling data source changes via `useDataSourceController()` hook. It handles storing each dropzone's items in state and automatically handles all item replacements. This hook returns two values:

- `lists` is a dictionary where key is dropzone `id` and value is an array of your data objects;
- `handleItemDrop()` is a function that is provided to `<Brickwall />` component's `onItemDrop` prop and automatically updates data object lists for each dropzone.

Each time items composition changes inside `<Brickwall />` context, `lists` returned from the above hook will be updated with latest changes.

Alternatively you can manually store dropzone data sources wherever you like and pass your custom "on drop" handler to `onItemDrop` prop.

Example:

```ts
import Brickwall, { useDataSourceController } from "react-brickwall";

interface ShufflerComponentProps {
  listA: Item[];
  listB: Item[];
  listC: Item[];
}

const ShufflerComponent: React.FC<ShufflerComponentProps> = ({ listA, listB, listC }) => {
  const { lists, handleItemDrop } = useDataSourceController({
    "bw-dz-list-a": listA,
    "bw-dz-list-b": listB,
    "bw-dz-list-c": listC,
  });

  React.useEffect(() => {
    // do your thing with updated data
  }, [lists]);

  return (
    <Brickwall animationSpeed={200} gridGap={20} onItemDrop={handleItemDrop}>
      <div id="bw-dz-list-a">
        {lists["bw-dz-list-a"].map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
      </div>

      // it doesn't matter how deep you put your dropzones relative to <Brickwall />
      <section>
        <div id="bw-dz-list-b">
          {lists["bw-dz-list-b"].map((item) => (
            <div key={item.id}>{item.text}</div>
          ))}
        </div>

        <div>
          <div id="bw-dz-list-c">
            {lists["bw-dz-list-c"].map((item) => (
              <div key={item.id}>{item.text}</div>
            ))}
          </div>
        </div>
      </section>
    </Brickwall>
  );
};
```
