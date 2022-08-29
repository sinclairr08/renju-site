import { place } from "./place";
import { stone, stoneColor } from "./useBoard";
import { join_cls } from "../utils";

interface stoneWLocation extends stone {
  location: place;
}

const STATIC_LINES =
  "left-[0px] left-[40px] left-[80px] left-[120px] left-[160px] left-[200px] left-[240px] left-[280px] left-[320px] left-[360px] left-[400px] left-[440px] left-[480px] left-[520px] left-[560px] left-[600px]" +
  "top-[0px] top-[40px] top-[80px] top-[120px] top-[160px] top-[200px] top-[240px] top-[280px] top-[320px] top-[360px] top-[400px] top-[440px] top-[480px] top-[520px] top-[560px] top-[600px]";

const getStoneStyle = (color: stoneColor): string => {
  if (color === "white") return "bg-white text-black w-[30px] h-[30px]";
  else if (color === "black") return "bg-black text-white w-[30px] h-[30px]";
  else if (color === "forbidden")
    return "bg-red-600 w-[10px] h-[10px] text-transparent translate-x-[10px] translate-y-[10px]";
  else return "";
};

export const stoneComponent = (stoneWLoc: stoneWLocation) => {
  const topD = `top-[${stoneWLoc.location.y * 40}px]`;
  const leftD = `left-[${stoneWLoc.location.x * 40}px]`;
  return (
    <div
      key={`${stoneWLoc.location.x}-${stoneWLoc.location.y}`}
      className={join_cls(
        "absolute z-10 flex items-center justify-center rounded-xl select-none",
        topD,
        leftD,
        getStoneStyle(stoneWLoc.color)
      )}
    >
      {stoneWLoc.counter}
    </div>
  );
};

export const hrLine = (line_num: number) => {
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

export const vrLine = (line_num: number) => {
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

export const preLine = () => {
  return <div className={STATIC_LINES} />;
};
