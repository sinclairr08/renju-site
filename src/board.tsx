import React, { useRef, useState } from "react";
import {
  hr_line,
  stone,
  stoneComponent,
  stoneStatus,
  vr_line,
} from "./boardComponents";
import { STATIC_LINES } from "./utils";
const arr = [...Array(15).keys()];

const makeEmptyStones = (): stone[][] => {
  return Array.from({ length: 15 }, () =>
    Array(15).fill({ counter: 0, status: "blank" })
  );
};

const DIRS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

const Board = () => {
  const [counter, setCounter] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [stones] = useState<stone[][]>(makeEmptyStones());
  const [endMessage, setEndMessage] = useState("");
  const boardRef = useRef<any>(null);

  const getStoneColor = (place: number[]): stoneStatus => {
    const [x, y] = place;

    if (x > 14 || y > 14 || x < 0 || y < 0) return "edge";

    return stones[y][x].status;
  };

  const isForbidden = (x: number, y: number): boolean => {
    let Nrow3 = -1;
    let Nrow4 = -1;
    let Nrow6 = 0;
    const startPlace = [x, y];

    for (let d = 0; d < DIRS.length; d++) {
      let direction = DIRS[d];
      let rowCnt = 1;
      let rowLeftCnt = 0;
      let rowRightCnt = 0;
      let rowBlankCnt = 1;

      let isBlank = false;
      let isBlocked = false;

      // halfBlock == 2 -> blocked
      let halfBlock = 0;

      let curPlace = startPlace.map((p, i) => p + direction[i]);

      let prevColor = "black";
      let curColor = getStoneColor(curPlace);

      while (true) {
        if (curColor === "white" || curColor === "edge") {
          if (prevColor === "blank") {
            halfBlock += 1;
          } else {
            isBlocked = true;
          }
          break;
        } else if (curColor === "black") {
          rowBlankCnt += 1;
          rowLeftCnt += 1;
          if (!isBlank) rowCnt += 1;
        } else if (curColor === "blank" || curColor === "forbidden") {
          if (!isBlank) isBlank = true;
          else break;
        }

        curPlace = curPlace.map((p, i) => p + direction[i]);

        prevColor = curColor;
        curColor = getStoneColor(curPlace);
      }

      isBlank = false;
      curPlace = startPlace.map((p, i) => p - direction[i]);

      prevColor = "black";
      curColor = getStoneColor(curPlace);

      while (true) {
        if (curColor === "white" || curColor === "edge") {
          if (prevColor === "blank") {
            halfBlock += 1;
          } else {
            isBlocked = true;
          }
          break;
        } else if (curColor === "black") {
          rowBlankCnt += 1;
          rowRightCnt += 1;
          if (!isBlank) rowCnt += 1;
        } else if (curColor === "blank" || curColor === "forbidden") {
          if (!isBlank) isBlank = true;
          else break;
        }

        curPlace = curPlace.map((p, i) => p - direction[i]);

        prevColor = curColor;
        curColor = getStoneColor(curPlace);
      }

      if (halfBlock === 2) {
        isBlocked = true;
      }

      if (rowCnt === 5) {
        return false;
      } else if (rowBlankCnt === 3 && !isBlocked) {
        if (rowCnt !== 1 || rowLeftCnt * rowRightCnt === 0) {
          Nrow3 += 1;
        }
      } else if (rowBlankCnt === 4) {
        Nrow4 += 1;
      } else if (rowBlankCnt >= 6) {
        if (rowBlankCnt === rowCnt) {
          Nrow6 += 1;
        } else if (rowBlankCnt === 7 && rowCnt === 1) {
          Nrow4 += 2;
        }
      }
    }

    if (Nrow3 > 0 || Nrow4 > 0 || Nrow6 > 0) {
      return true;
    }

    return false;
  };

  const setForbidden = () => {
    stones.forEach((stoneRow, y) => {
      stoneRow.forEach((s, x) => {
        if (s.status === "blank" && isForbidden(x, y)) {
          stones[y][x] = { counter: -1, status: "forbidden" };
        }
      });
    });
  };

  const deleteForbidden = () => {
    stones.forEach((stoneRow, y) => {
      stoneRow.forEach((s, x) => {
        if (s.status === "forbidden") {
          stones[y][x] = { counter: 0, status: "blank" };
        }
      });
    });
  };

  const checkRow = (x: number, y: number) => {
    const startColor = counter % 2 === 0 ? "black" : "white";
    const startPlace = [x, y];

    stones[y][x] = {
      counter: counter + 1,
      status: startColor,
    };

    if (endMessage !== "") return;

    for (let d = 0; d < DIRS.length; d++) {
      let direction = DIRS[d];
      let rowCnt = 1;
      let curPlace = startPlace.map((p, i) => p + direction[i]);

      let prevColor = startColor;
      let curColor = getStoneColor(curPlace);

      while (curColor === prevColor) {
        rowCnt += 1;
        curPlace = curPlace.map((p, i) => p + direction[i]);

        prevColor = curColor;
        curColor = getStoneColor(curPlace);
      }

      curPlace = startPlace.map((p, i) => p - direction[i]);

      prevColor = startColor;
      curColor = getStoneColor(curPlace);

      while (curColor === prevColor) {
        rowCnt += 1;
        curPlace = curPlace.map((p, i) => p - direction[i]);

        prevColor = curColor;
        curColor = getStoneColor(curPlace);
      }

      if (rowCnt >= 5) {
        alert(`${startColor} win! 5 in a row!`);
        setEndMessage(`${startColor} win! 5 in a row!`);

        deleteForbidden();
        return;
      }
    }

    if (startColor === "white") {
      setForbidden();
    } else {
      deleteForbidden();
    }
  };

  const clickBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    const refX = boardRef.current.offsetLeft;
    const refY = boardRef.current.offsetTop;

    const offsetX = e.pageX - refX;
    const offsetY = e.pageY - refY;

    console.log(offsetX, offsetY);

    const remX = offsetX % 40;
    const remY = offsetY % 40;

    if (remX > 30 || remY > 30) {
      setStatusMessage("Ambiguous Position");
      return;
    }

    const curX = Math.floor(offsetX / 40);
    const curY = Math.floor(offsetY / 40);

    if (getStoneColor([curX, curY]) === "forbidden") {
      alert("white win! black took a forbidden place!");
      setEndMessage("white win! black took a forbidden place!");
      setStatusMessage("Forbidden");

      deleteForbidden();
      return;
    } else if (getStoneColor([curX, curY]) !== "blank") {
      setStatusMessage("Already Clicked");
      return;
    }

    checkRow(curX, curY);

    setCounter((prev) => prev + 1);
    setStatusMessage(`x: ${curX}, y: ${curY}`);
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center min-w-[622px] mt-12">
      <div
        ref={boardRef}
        onClick={clickBoard}
        className="bg-amber-600 w-[590px] h-[590px] relative"
      >
        <div
          className={`absolute w-[5px] h-[5px] z-5 flex items-center justify-center rounded-xl bg-black top-[295px] left-[295px] translate-x-[-2.5px] translate-y-[-2.5px]`}
        />

        <div className={STATIC_LINES} />
        {stones.map((row, i) =>
          row.map(
            (col, j) =>
              col.counter !== 0 && stoneComponent({ x: j, y: i, stone: col })
          )
        )}
        {arr.map((l) => hr_line(l))}
        {arr.map((l) => vr_line(l))}
      </div>
      <span className="mt-4 text-xl">{statusMessage}</span>
      <span className="mt-4 text-xl">{endMessage}</span>
      <button className="mt-4" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
};

export default Board;
