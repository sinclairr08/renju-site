import { useState } from "react";
import { DIRECTIONS, movePlace, negativePlace, place } from "./place";

export type stoneColor = "black" | "white" | "forbidden" | "blank" | "edge";

export interface stone {
  counter: number;
  color: stoneColor;
}

interface boardState {
  counter: number;
  stones: stone[][];
  history: place[];
  isEnd: boolean;
  winner: "black" | "white" | "";
  winReason: "Black took a forbidden" | "5 in a row" | "";
}

export interface useBoardReturns extends boardState {
  clearBoard: () => void;
  putStone: (p: place) => void;
  putStones: (p: place[]) => void;
  saveHistory: () => void;
  restoreHistory: (str: string) => void;
}

interface countRowProps {
  startPlace: place;
  startColor: stoneColor;
  direction: place;
}

const EMPTY_STONE: stone = { counter: 0, color: "blank" };
const FORBIDDEN_STONE: stone = { counter: -1, color: "forbidden" };

const makeEmptyBoardState = (): boardState => {
  return {
    stones: Array.from({ length: 15 }, () => Array(15).fill(EMPTY_STONE)),
    counter: 0,
    history: [],
    isEnd: false,
    winner: "",
    winReason: "",
  };
};

const useBoard = (): useBoardReturns => {
  const [{ counter, history, isEnd, stones, winner, winReason }, setBoard] =
    useState<boardState>(makeEmptyBoardState());

  const saveHistory = () => {
    console.log(JSON.stringify(history));
  };

  const restoreHistory = (historyStr: string) => {
    putStones(JSON.parse(historyStr));
  };

  const putStone = (p: place) => {
    /** 1. Check a place is puttable */
    if (isEnd || !isPuttable(p)) return;

    /** 2. Put a stone */
    const curColor: stoneColor = counter % 2 === 0 ? "black" : "white";

    setBoard((prev) => ({
      ...prev,
      counter: prev.counter + 1,
      history: [...prev.history, p],
      stones: updatedStones(prev.stones, p, {
        color: curColor,
        counter: counter + 1,
      }),
    }));

    /** 3. Set forbidden */
    if (curColor === "white") {
      setForbidden();
    } else {
      deleteForbidden();
    }

    /** 4. Check a row is made */
    const isRowMade = isRow(p, curColor);
    if (isRowMade) {
      setBoard((prev) => ({
        ...prev,
        isEnd: true,
        winner: curColor,
        winReason: "5 in a row",
      }));

      deleteForbidden();
    }

    return;
  };

  const putStones = (places: place[]) => {
    places.forEach((p) => putStone(p));
  };

  const updatedStones = (
    stones: stone[][],
    p: place,
    newStone: stone
  ): stone[][] => {
    return stones.map((row, i) =>
      row.map((stone, j) => (i === p.y && j === p.x ? newStone : stone))
    );
  };

  const getStoneColor = (p: place): stoneColor => {
    if (p.x > 14 || p.y > 14 || p.x < 0 || p.y < 0) return "edge";

    return stones[p.y][p.x].color;
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
      setBoard((prev) => ({
        ...prev,
        isEnd: true,
        winner: "white",
        winReason: "Black took a forbidden",
      }));

      return false;
    }

    if (curPlaceColor !== "blank") {
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
    stones.forEach((row, y) => {
      row.forEach((stone, x) => {
        const curPlace = { x, y };
        if (stone.color === "blank" && isForbidden(curPlace)) {
          setBoard((prev) => ({
            ...prev,
            stones: updatedStones(prev.stones, curPlace, FORBIDDEN_STONE),
          }));
        }
      });
    });
  };

  const deleteForbidden = () => {
    stones.forEach((row, y) => {
      row.forEach((stone, x) => {
        const curPlace = { x, y };
        if (stone.color === "forbidden") {
          setBoard((prev) => ({
            ...prev,
            stones: updatedStones(prev.stones, curPlace, EMPTY_STONE),
          }));
        }
      });
    });
  };

  const clearBoard = () => {
    setBoard(makeEmptyBoardState());
  };

  return {
    stones,
    counter,
    history,
    isEnd,
    winner,
    winReason,
    clearBoard,
    putStone,
    putStones,
    saveHistory,
    restoreHistory,
  };
};

export default useBoard;
