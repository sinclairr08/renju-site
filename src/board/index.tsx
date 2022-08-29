import React, { useRef, useState } from "react";
import { preLine, hrLine, vrLine, stoneComponent } from "./components";
import useBoard from "./useBoard";

const arr = [...Array(15).keys()];

const Board = () => {
  const [positionMessage, setPositionMessage] = useState("");
  const { board, status, isEnd, putStone } = useBoard();
  const boardRef = useRef<any>(null);

  const clickBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    const refX = boardRef.current.offsetLeft;
    const refY = boardRef.current.offsetTop;

    const offsetX = e.pageX - refX;
    const offsetY = e.pageY - refY;

    const remX = offsetX % 40;
    const remY = offsetY % 40;

    if (remX > 30 || remY > 30) {
      setPositionMessage(`x : -, y : -`);
      return;
    }

    const curX = Math.floor(offsetX / 40);
    const curY = Math.floor(offsetY / 40);

    putStone({ x: curX, y: curY });
    setPositionMessage(`x : ${curX}, y : ${curY}`);
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

        {preLine()}
        {board.map((boardRow, i) =>
          boardRow.map(
            (stone, j) =>
              stone.counter !== 0 &&
              stoneComponent({ location: { x: j, y: i }, ...stone })
          )
        )}
        {arr.map((l) => hrLine(l))}
        {arr.map((l) => vrLine(l))}
      </div>
      <span className="mt-4 text-xl">{positionMessage}</span>
      <span className="mt-4 text-xl">{status}</span>
      <span className="mt-4 text-xl">{isEnd ? "Game End" : ""}</span>
      <button className="mt-4" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
};

export default Board;
