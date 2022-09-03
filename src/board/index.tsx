import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { preLine, hrLine, vrLine, stoneComponent } from "./components";
import useBoard from "./useBoard";

const arr = [...Array(15).keys()];

interface historyForm {
  historyStr: string;
}

const Board = () => {
  const [positionMessage, setPositionMessage] = useState("");
  const { board, clearBoard, putStone, saveHistory, restoreHistory } =
    useBoard();
  const { stones, winner, winReason } = board;
  const { register, handleSubmit, reset } = useForm<historyForm>();
  const boardRef = useRef<any>(null);

  const onValid = ({ historyStr }: historyForm) => {
    restoreHistory(historyStr);
    reset();
  };

  const clickBoard = async (e: React.MouseEvent<HTMLDivElement>) => {
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

    await putStone({ x: curX, y: curY });
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
        {stones.map((row, i) =>
          row.map(
            (stone, j) =>
              stone.counter !== 0 &&
              stoneComponent({ location: { x: j, y: i }, ...stone })
          )
        )}
        {arr.map((l) => hrLine(l))}
        {arr.map((l) => vrLine(l))}
      </div>

      <span className="mt-4">
        {winner
          ? `${winner} win! ${winReason}`
          : `Position: ${positionMessage}`}
      </span>
      <div className="flex flex-col w-1/2">
        <button
          className="bg-neutral-800 text-white rounded-md p-2 mt-4"
          onClick={clearBoard}
        >
          Clear
        </button>
        <button
          className="bg-neutral-800 text-white rounded-md p-2 mt-4"
          onClick={saveHistory}
        >
          Save (console)
        </button>
        <form
          className="flex flex-col items-center justify-center mt-4"
          onSubmit={handleSubmit(onValid)}
        >
          <input
            type="text"
            {...register("historyStr")}
            className="outline-none w-full border-2 border-neutral-700 rounded-lg py-1 px-1"
          />
          <button className="bg-neutral-800 text-white rounded-md p-2 mt-4 w-full">
            Restore
          </button>
        </form>
      </div>
    </div>
  );
};

export default Board;
