import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { preLine, hrLine, vrLine, stoneComponent } from "./components";
import useBoard from "./useBoard";
import testData from "./testData.json";
import { join_cls } from "../utils";

const arr = [...Array(15).keys()];

interface historyForm {
  historyStr: string;
}

const Board = () => {
  const [positionMessage, setPositionMessage] = useState("");
  const [testId, setTestId] = useState(-1);
  const [testOpen, setTestOpen] = useState(false);
  const [testResult, setTestResult] = useState(
    new Array(testData.length).fill("-")
  );
  const {
    board,
    clearBoard,
    putStone,
    saveHistory,
    restoreHistory,
    undo,
    redo,
    undoAll,
    redoAll,
  } = useBoard();
  const { stones, winner, winReason } = board;
  const { register, handleSubmit, reset } = useForm<historyForm>();
  const boardRef = useRef<any>(null);

  useEffect(() => {
    setTestResult((prev) =>
      prev.map((res, i) => (i === testId ? board.winner : res))
    );
  }, [testId]);

  const onValid = async ({ historyStr }: historyForm) => {
    await restoreHistory(historyStr);
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

  const testStart = async ({ data, id }: any) => {
    clearBoard();
    await restoreHistory(JSON.stringify(data));
    setTestId(id);
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
      <div className="flex space-x-8 mt-4">
        <svg
          onClick={undoAll}
          className="w-6 h-6 cursor-pointer"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          ></path>
        </svg>
        <svg
          onClick={undo}
          className="w-6 h-6 cursor-pointer"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>

        <svg
          onClick={redo}
          className="w-6 h-6 cursor-pointer"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
        <svg
          onClick={redoAll}
          className="w-6 h-6 cursor-pointer"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          ></path>
        </svg>
      </div>
      <span className="mt-4 select-none">
        {winner
          ? `${winner} win! ${winReason}`
          : `Position: ${positionMessage}`}
      </span>
      <div className="flex flex-col w-1/2">
        <button
          className="bg-neutral-800 text-white rounded-md p-2 mt-4 select-none"
          onClick={clearBoard}
        >
          Clear
        </button>
        <button
          className="bg-neutral-800 text-white rounded-md p-2 mt-4 select-none"
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
          <button className="bg-neutral-800 text-white rounded-md p-2 mt-4 w-full select-none">
            Restore
          </button>
        </form>
        <button
          onClick={() => setTestOpen((prev) => !prev)}
          className="bg-neutral-800 text-white rounded-md p-2 mt-4 w-full text-center select-none"
        >
          Test
        </button>
        {testOpen && (
          <div className="flex flex-col">
            <div className="mt-2 grid grid-cols-3 gap-x-2 text-center text-xs">
              <span>Test Start</span>
              <span>Result</span>
              <span>Expected</span>
            </div>
            {testData.map((td) => (
              <div
                key={td.id}
                className={join_cls(
                  "mt-2 grid grid-cols-3 gap-x-2 text-center"
                )}
              >
                <button
                  className="border-2 border-neutral-700 rounded-md"
                  onClick={() => testStart(td)}
                >
                  {td.id}
                </button>
                <span
                  className={
                    testResult[td.id] === "-"
                      ? ""
                      : testResult[td.id] === td.winner
                      ? "bg-green-400"
                      : "bg-red-400"
                  }
                >
                  {testResult[td.id]}
                </span>
                <span>{td.winner}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
