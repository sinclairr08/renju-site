import { join_cls } from "./utils";

export type stoneStatus = "black" | "white" | "forbidden" | "blank" | "edge";

export type stone = {
  counter: number;
  status: stoneStatus;
};

export interface stoneLocation {
  x: number;
  y: number;
  stone: stone;
}

const getStoneStyle = (status: stoneStatus): string => {
  if (status === "white") return "bg-white text-black w-[30px] h-[30px]";
  else if (status === "black") return "bg-black text-white w-[30px] h-[30px]";
  else if (status === "forbidden")
    return "bg-red-600 w-[10px] h-[10px] text-transparent translate-x-[10px] translate-y-[10px]";
  else return "";
};

export const stoneComponent = (stoneLoc: stoneLocation) => {
  const topD = `top-[${stoneLoc.y * 40}px]`;
  const leftD = `left-[${stoneLoc.x * 40}px]`;
  return (
    <div
      key={`${stoneLoc.x}-${stoneLoc.y}`}
      className={join_cls(
        "absolute z-10 flex items-center justify-center rounded-xl select-none",
        topD,
        leftD,
        getStoneStyle(stoneLoc.stone.status)
      )}
    >
      {stoneLoc.stone.counter}
    </div>
  );
};

export const hr_line = (line_num: number) => {
  const topD = `top-[${line_num * 40}px]`;
  return (
    <div
      key={`hr-${line_num}`}
      className={join_cls(
        "absolute translate-x-[15px] border-b-2 border-black w-[560px] translate-y-[14px]",
        topD
      )}
    />
  );
};

export const vr_line = (line_num: number) => {
  const leftD = `left-[${line_num * 40}px]`;
  return (
    <div
      key={`vr-${line_num}`}
      className={join_cls(
        "absolute translate-y-[15px] border-r-2 border-black h-[560px] translate-x-[14px]",
        leftD
      )}
    />
  );
};
