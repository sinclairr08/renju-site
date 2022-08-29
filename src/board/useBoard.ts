import { useState } from "react";
import { DIRECTIONS, movePlace, negativePlace, place } from "./place";

export type stoneColor = "black" | "white" | "forbidden" | "blank" | "edge";

export interface stone {
  counter: number;
  color: stoneColor;
}

export interface useBoardReturns {
  board: stone[][];
  isEnd: boolean;
  status: string;
  putStone: (p: place) => void;
  putStones: (p: place[]) => void;
}

interface countRowProps {
  startPlace: place;
  startColor: stoneColor;
  direction: place;
}

const makeEmptyBoard = (): stone[][] => {
  return Array.from({ length: 15 }, () =>
    Array(15).fill({ counter: 0, color: "blank" })
  );
};

const useBoard = (): useBoardReturns => {
  const [board] = useState<stone[][]>(makeEmptyBoard());
  const [counter, setCounter] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [status, setStatus] = useState("");

  const putStone = (p: place) => {
    /** 1. Check a place is puttable */
    if (isEnd || !isPuttable(p)) return;

    /** 2. Put a stone */
    const curTurnColor: stoneColor = counter % 2 === 0 ? "black" : "white";
    setStone(p, curTurnColor);

    /** 3. Set forbidden */
    if (curTurnColor === "white") {
      setForbidden();
    } else {
      deleteForbidden();
    }

    /** 4. Check a row is made */
    const isRowMade = isRow(p, curTurnColor);
    if (isRowMade) {
      setIsEnd(true);
      setStatus(`${curTurnColor} win! 5 in a row!`);
      deleteForbidden();
    }

    return;
  };

  const putStones = (places: place[]) => {
    places.forEach((p) => putStone(p));
  };

  const getStoneColor = (p: place): stoneColor => {
    if (p.x > 14 || p.y > 14 || p.x < 0 || p.y < 0) return "edge";

    return board[p.y][p.x].color;
  };

  const setStone = (p: place, color: stoneColor) => {
    setCounter((prev) => prev + 1);
    board[p.y][p.x] = {
      counter: counter + 1,
      color,
    };
  };

  const isForbidden = (startPlace: place): boolean => {
    let Nrow3 = -1;
    let Nrow4 = -1;
    let Nrow6 = 0;

    for (let d = 0; d < DIRECTIONS.length; d++) {
      let direction = DIRECTIONS[d];
      let rowCnt = 1;
      let rowBlankCnt = 1;
      let isBlocked = false;

      let [leftCnt, leftBlankCnt, leftBlockStack] = countBlankRow({
        startPlace,
        startColor: "black",
        direction,
      });
      let [rightCnt, rightBlankCnt, rightBlockStack] = countBlankRow({
        startPlace,
        startColor: "black",
        direction: negativePlace(direction),
      });

      rowCnt += leftCnt + rightCnt;
      rowBlankCnt += leftBlankCnt + rightBlankCnt;

      if (leftBlockStack + rightBlockStack > 1) {
        isBlocked = true;
      }

      if (rowCnt === 5) {
        return false;
      } else if (rowBlankCnt === 3 && !isBlocked) {
        if (rowCnt !== 1 || leftBlankCnt * rightBlankCnt === 0) {
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

  const isRow = (startPlace: place, startColor: stoneColor): boolean => {
    for (let d = 0; d < DIRECTIONS.length; d++) {
      let direction = DIRECTIONS[d];
      let rowCnt = 1;

      rowCnt += countRow({ startPlace, startColor, direction });
      rowCnt += countRow({
        startPlace,
        startColor,
        direction: negativePlace(direction),
      });

      if (rowCnt >= 5) {
        return true;
      }
    }

    return false;
  };

  const isPuttable = (p: place): boolean => {
    const curPlaceColor = getStoneColor(p);

    if (curPlaceColor === "forbidden") {
      deleteForbidden();
      setIsEnd(true);
      setStatus("white win! black took a forbidden place!");

      return false;
    }

    if (curPlaceColor !== "blank") {
      setStatus("already clicked");
      return false;
    }

    return true;
  };

  const countRow = ({
    startPlace,
    startColor,
    direction,
  }: countRowProps): number => {
    let cnt = 0;

    let curPlace = movePlace(startPlace, direction);

    let prevColor = startColor;
    let curColor = getStoneColor(curPlace);

    while (curColor === prevColor) {
      cnt += 1;
      curPlace = movePlace(curPlace, direction);

      prevColor = curColor;
      curColor = getStoneColor(curPlace);
    }

    return cnt;
  };

  const countBlankRow = ({
    startPlace,
    startColor,
    direction,
  }: countRowProps): number[] => {
    let cnt = 0;
    let blankCnt = 0;
    let blockStack = 0;
    let isBlank = false;

    let curPlace = movePlace(startPlace, direction);

    let prevColor = startColor;
    let curColor = getStoneColor(curPlace);

    while (true) {
      if (curColor === "white" || curColor === "edge") {
        if (prevColor === "blank") {
          blockStack += 1;
        } else {
          blockStack += 2;
        }
        break;
      } else if (curColor === "black") {
        blankCnt += 1;
        if (!isBlank) cnt += 1;
      } else if (curColor === "blank" || curColor === "forbidden") {
        if (!isBlank) isBlank = true;
        else break;
      }

      curPlace = movePlace(curPlace, direction);

      prevColor = curColor;
      curColor = getStoneColor(curPlace);
    }

    return [cnt, blankCnt, blockStack];
  };

  const setForbidden = () => {
    board.forEach((stoneRow, y) => {
      stoneRow.forEach((stone, x) => {
        if (stone.color === "blank" && isForbidden({ x, y })) {
          board[y][x] = { counter: -1, color: "forbidden" };
        }
      });
    });
  };

  const deleteForbidden = () => {
    board.forEach((boardRow, y) => {
      boardRow.forEach((stone, x) => {
        if (stone.color === "forbidden") {
          board[y][x] = { counter: 0, color: "blank" };
        }
      });
    });
  };

  return {
    board,
    status,
    isEnd,
    putStone,
    putStones,
  };
};

export default useBoard;
