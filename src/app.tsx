import { useState, useEffect, useCallback } from "preact/hooks";

type Point = {
  x: number;
  y: number;
};
type PointList = Point[];
type Shape = {
  name: string;
  points: PointList[];
};
const shapes: Shape[] = [
  {
    name: "line",
    points: [
      [
        {
          x: 0,
          y: 0,
        },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
      ],
      [
        {
          x: 0,
          y: 0,
        },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
    ],
  },
  {
    name: "square",
    points: [
      [
        {
          x: 0,
          y: 0,
        },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
    ],
  },
  {
    name: "spike",
    points: [
      [
        {
          x: 0,
          y: 1,
        },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        {
          x: 0,
          y: 1,
        },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
      ],
      [
        {
          x: 0,
          y: 0,
        },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        {
          x: 0,
          y: 1,
        },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 0 },
      ],
    ],
  },
  {
    name: "angle",
    points: [
      [
        {
          x: 0,
          y: 0,
        },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        {
          x: 0,
          y: 0,
        },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        {
          x: 0,
          y: 0,
        },
        {
          x: 1,
          y: 0,
        },
        {
          x: 2,
          y: 0,
        },
        {
          x: 2,
          y: 1,
        },
      ],
      [
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 1,
        },
        {
          x: 0,
          y: 2,
        },
        {
          x: 1,
          y: 2,
        },
      ],
    ],
  },
];

const getRandomShape = () => shapes[Math.floor(Math.random() * shapes.length)];

const checkEdge = ({
  grid,
  x,
  y,
  shape,
  pointIndex,
}: {
  grid: Array<Array<number | string>>;
  x: number;
  y: number;
  shape: Shape;
  pointIndex: number;
}) => {
  for (let i = 0; i < shape.points[pointIndex].length; ++i) {
    const point = shape.points[pointIndex][i];
    const nX = point.x + x;
    const nY = point.y + y;
    if (grid?.[nX]?.[nY] === "P" || typeof grid?.[nX]?.[nY] === "undefined") {
      return true;
    }
  }

  return false;
};

export function App() {
  const [grid, setGrid] = useState(
    new Array(12).fill(0).map(() => new Array(12).fill(0))
  );
  const [shape, setShape] = useState(getRandomShape());
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [pointIndex, setPointIndex] = useState(0);

  const updateGrid = (position: Point, pointIndex: number) => {
    const newGrid = new Array(12).fill(0).map(() => new Array(12).fill(0));
    shape.points[pointIndex].forEach((point) => {
      const { x, y } = point;
      const { x: offsetX, y: offsetY } = position;
      const px = x + offsetX;
      const py = y + offsetY;
      if (typeof newGrid?.[px]?.[py] !== "undefined") {
        newGrid[px][py] = 1;
      }
    });

    for (let i = 0; i < grid.length; ++i) {
      for (let j = 0; j < grid[i].length; ++j) {
        if (grid[i][j] === "P") {
          newGrid[i][j] = "P";
        }
      }
    }

    setGrid(newGrid);
  };

  const placeGrid = useCallback(
    (position: Point, pointIndex: number) => {
      if (grid[0][0] === "P") {
        setGrid(new Array(12).fill(0).map(() => new Array(12).fill(0)));
      } else {
        setGrid((oldGrid) => {
          const newGrid = new Array(12)
            .fill(0)
            .map(() => new Array(12).fill(0));

          for (let i = 0; i < oldGrid.length; ++i) {
            for (let j = 0; j < oldGrid[i].length; ++j) {
              if (oldGrid[i][j] === "P") {
                newGrid[i][j] = "P";
              }
            }
          }

          shape.points[pointIndex].forEach((point) => {
            const { x, y } = point;
            const { x: offsetX, y: offsetY } = position;
            newGrid[x + offsetX][y + offsetY] = "P";
          });

          let lineIndex = -1;

          newGrid.forEach((row, i) => {
            const filled = row.every((e) => e === "P");
            if (filled) {
              row.fill(0);
              lineIndex = i;
            }
          });

          if (lineIndex !== -1) {
            for (let i = lineIndex; i > 0; i--) {
              newGrid[i] = newGrid[i - 1];
            }
          }
          return newGrid;
        });
      }

      setPosition({ x: 0, y: 0 });
      setShape(() => getRandomShape());
      setPointIndex(0);
    },
    [shape]
  );

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "ArrowDown") {
      setPosition((prev) => {
        const isEdge = checkEdge({
          grid,
          x: prev.x + 1,
          y: prev.y,
          shape,
          pointIndex,
        });
        if (!isEdge) {
          return { x: prev.x + 1, y: prev.y };
        }
        if (isEdge) {
          placeGrid(prev, pointIndex);
        }
        return prev;
      });
    }

    if (ev.key === "ArrowUp") {
      setPosition((prev) => {
        if (prev.x - 1 >= 0) {
          return { x: prev.x - 1, y: prev.y };
        }
        return prev;
      });
    }

    if (ev.key === "ArrowLeft") {
      setPosition((prev) => {
        const isEdge = checkEdge({
          grid,
          x: prev.x,
          y: prev.y - 1,
          shape,
          pointIndex,
        });
        if (!isEdge) {
          return { x: prev.x + 1, y: prev.y - 1 };
        }
        return prev;
      });
    }

    if (ev.key === "ArrowRight") {
      setPosition((prev) => {
        const isEdge = checkEdge({
          grid,
          x: prev.x,
          y: prev.y + 1,
          shape,
          pointIndex,
        });
        if (!isEdge) {
          return { x: prev.x, y: prev.y + 1 };
        }
        return prev;
      });
    }

    if (ev.keyCode === 32) {
      if (position.y + 3 >= grid[0].length) {
        setPosition((prev) => {
          const delta = Math.abs(grid[0].length - prev.y);
          return { ...prev, y: prev.y - delta };
        });
      }
      setPointIndex((prev) => (prev + 1) % shape.points.length);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [grid, shape, pointIndex]);

  useEffect(() => {
    updateGrid(position, pointIndex);
  }, [position, pointIndex]);

  return (
    <main className="flex flex-col items-center justify-center w-full h-full">
      <div className="my-4 border-2">
        {grid.map((g, index1) => (
          <div key={`row-${index1}`} className="flex flex-row">
            {g.map((e, index2) => (
              <p
                className={`${
                  e === 0 ? "bg-black" : "bg-blue-300"
                } h-8 w-8 border-2 border-white text-sm`}
                key={`elem-${index2}`}
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
