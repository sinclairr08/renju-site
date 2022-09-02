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

export interface useBoardReturns {
  board: boardState;
  clearBoard: () => void;
  putStone: (p: place) => Promise<void>;
  putStones: (p: place[]) => Promise<void>;
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

const getCounterColor = (counter: number): "black" | "white" => {
  return counter % 2 === 0 ? "white" : "black";
};

const useBoard = (): useBoardReturns => {
  const [board, setBoard] = useState<boardState>(makeEmptyBoardState());

  const saveHistory = () => {
    console.log(JSON.stringify(board.history));
  };

  const restoreHistory = (historyStr: string) => {
    putStones(JSON.parse(historyStr));
  };

  const putStone = async (p: place) => {
    setBoard((prev) => putStoneBoardState(prev, p));
    return;
  };

  const putStones = async (places: place[]) => {
    for (let i = 0; i < places.length; i++) {
      await putStone(places[i]);
    }
  };

  const putStoneBoardState = (prevState: boardState, p: place): boardState => {
    if (prevState.isEnd) return prevState;

    let curIsEnd: boolean = prevState.isEnd;
    let curWinner = prevState.winner;
    let curWinReason = prevState.winReason;
    let isForbiddenDeleted: boolean = false;

    const curCounter = prevState.counter + 1;
    const curPlaceColor = getStoneColor(p, prevState.stones);
    const curCounterColor = getCounterColor(curCounter);

    if (curPlaceColor === "forbidden") {
      isForbiddenDeleted = true;
      curIsEnd = true;
      curWinner = "white";
      curWinReason = "Black took a forbidden";
    } else if (curPlaceColor === "blank") {
      if (curCounterColor === "black") {
        isForbiddenDeleted = true;
      }

      if (isRow(p, curCounterColor, prevState.stones)) {
        isForbiddenDeleted = true;
        curIsEnd = true;
        curWinner = curCounterColor;
        curWinReason = "5 in a row";
      }
    } else {
      return prevState;
    }

    const curStones = prevState.stones.map((row, y) =>
      row.map((curStone, x) => {
        if (x === p.x && y === p.y)
          return { counter: curCounter, color: curCounterColor };
        else if (isForbiddenDeleted && curStone.color === "forbidden")
          return EMPTY_STONE;
        else if (
          !isForbiddenDeleted &&
          curStone.color === "blank" &&
          isForbidden({ x, y }, prevState.stones)
        )
          return FORBIDDEN_STONE;
        else return curStone;
      })
    );

    return {
      counter: curCounter,
      stones: curStones,
      history: [...prevState.history, p],
      isEnd: curIsEnd,
      winReason: curWinReason,
      winner: curWinner,
    };
  };

  const getStoneColor = (p: place, stones: stone[][]): stoneColor => {
    if (p.x > 14 || p.y > 14 || p.x < 0 || p.y < 0) return "edge";

    return stones[p.y][p.x].color;
  };

  const isForbidden = (startPlace: place, stones: stone[][]): boolean => {
    let Nrow3 = -1;
    let Nrow4 = -1;
    let Nrow6 = 0;

    for (let d = 0; d < DIRECTIONS.length; d++) {
      let direction = DIRECTIONS[d];
      let rowCnt = 1;
      let rowBlankCnt = 1;
      let isBlocked = false;

      let [leftCnt, leftBlankCnt, leftBlockStack] = countBlankRow(
        {
          startPlace,
          startColor: "black",
          direction,
        },
        stones
      );
      let [rightCnt, rightBlankCnt, rightBlockStack] = countBlankRow(
        {
          startPlace,
          startColor: "black",
          direction: negativePlace(direction),
        },
        stones
      );

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

  const isRow = (
    startPlace: place,
    startColor: stoneColor,
    stones: stone[][]
  ): boolean => {
    for (let d = 0; d < DIRECTIONS.length; d++) {
      let direction = DIRECTIONS[d];
      let rowCnt = 1;

      rowCnt += countRow({ startPlace, startColor, direction }, stones);
      rowCnt += countRow(
        {
          startPlace,
          startColor,
          direction: negativePlace(direction),
        },
        stones
      );

      if (rowCnt >= 5) {
        return true;
      }
    }

    return false;
  };

  const countRow = (
    { startPlace, startColor, direction }: countRowProps,
    stones: stone[][]
  ): number => {
    let cnt = 0;

    let curPlace = movePlace(startPlace, direction);

    let prevColor = startColor;
    let curColor = getStoneColor(curPlace, stones);

    while (curColor === prevColor) {
      cnt += 1;
      curPlace = movePlace(curPlace, direction);

      prevColor = curColor;
      curColor = getStoneColor(curPlace, stones);
    }

    return cnt;
  };

  const countBlankRow = (
    { startPlace, startColor, direction }: countRowProps,
    stones: stone[][]
  ): number[] => {
    let cnt = 0;
    let blankCnt = 0;
    let blockStack = 0;
    let isBlank = false;

    let curPlace = movePlace(startPlace, direction);

    let prevColor = startColor;
    let curColor = getStoneColor(curPlace, stones);

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
      curColor = getStoneColor(curPlace, stones);
    }

    return [cnt, blankCnt, blockStack];
  };

  const clearBoard = () => {
    setBoard(makeEmptyBoardState());
  };

  return {
    board,
    clearBoard,
    putStone,
    putStones,
    saveHistory,
    restoreHistory,
  };
};

export default useBoard;
