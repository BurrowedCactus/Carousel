import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";

interface CarouselControllerProps {
  images: string[];
  displayNumber: number;
  stepInterval: number;
}

// 组件逻辑， 包含点击上一页，下一页，以及暂停。
const useCarouselController = ({
  images,
  displayNumber,
  stepInterval
}: CarouselControllerProps) => {
  if (displayNumber > images.length) {
    throw new Error("展示图片数量不能超过图片数量");
  }
  // 边界是为了实现动画，预留的图片。或者说边界是在点击上一步或者下一步的时候会展示的图片。
  const border = 1;
  // allImagesTwice 是所有图片重复一次并添加边界。
  const allImagesTwice = useMemo(() => {
    return [...images, ...images, ...images.slice(0, border)].map((image) => {
      return { url: image, key: Math.random() };
    });
  }, [images]);
  // 展示区域第一张图片
  const [viewingIndex, setIndex] = useState(images.length);
  const [pause, setPause] = useState(false);
  // 展示区域最大图片与第一张图片的距离； viewingIndex + shift就是最大的图片index。
  const shift = useMemo(() => {
    if (displayNumber % 2 === 0) {
      return displayNumber / 2 - 1;
    }
    return (displayNumber - 1) / 2;
  }, [displayNumber]);
  const clickNext = useCallback(() => {
    if (viewingIndex < allImagesTwice.length - displayNumber - border) {
      setIndex(viewingIndex + 1);
    } else {
      setIndex(viewingIndex + 1 - images.length);
    }
  }, [allImagesTwice, viewingIndex, displayNumber, images, border]);
  const clickPrev = () => {
    if (viewingIndex > border) {
      setIndex(viewingIndex - 1);
    } else {
      setIndex(viewingIndex - 1 + images.length);
    }
  };
  useEffect(() => {
    if (!pause) {
      const timeout = setTimeout(() => {
        clickNext();
      }, stepInterval * 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [clickNext, pause, stepInterval]);
  const togglePause = () => {
    setPause(!pause);
  };
  return {
    // 正在展示的最大的图片 在原有图片列表的index
    viewingIndex: (viewingIndex + shift) % images.length,
    // 供展示的图片，包含两张在侧边隐藏的不展示的用作动画的图片。
    viewingImages: allImagesTwice
      .filter(
        (image, i) =>
          i >= viewingIndex - border &&
          i < viewingIndex + displayNumber + border
      )
      .map((image, i) => ({
        ...image,
        position:
          i < shift + border ? "left" : i === shift + border ? "mid" : "right"
      })),
    clickNext,
    clickPrev,
    pause,
    togglePause
  };
};

// 组件
interface CarouselProps {
  // 轮播的图片地址
  images: string[];
  // 轮番展示的图片数
  displayNumber: number;
  // 每次轮播的时间间隔
  stepInterval: number;
  // 点击事件
  onClickNext: (index: number) => void;
  onClickPrev: (index: number) => void;
}

const Carousel = (props: CarouselProps) => {
  const {
    images = [],
    displayNumber = 3,
    stepInterval,
    onClickNext,
    onClickPrev
  } = props;
  const {
    viewingIndex,
    viewingImages,
    clickNext,
    clickPrev,
    pause,
    togglePause
  } = useCarouselController({ images, displayNumber, stepInterval });
  const styleByIndex = (index) => {
    // z-index
    let zIndex = 0;
    let max = viewingImages.length;
    const length = viewingImages.length;
    if (index === 0) {
      zIndex = 0;
    } else if (viewingImages.length % 2 === 0) {
      max = viewingImages.length / 2;
      if (index > length / 2 - 2) {
        zIndex = length - index - 1;
      } else {
        zIndex = index + 1;
      }
    } else {
      max = Math.floor(viewingImages.length / 2);
      if (index > length / 2 - 1) {
        zIndex = length - index - 1;
      } else {
        zIndex = index;
      }
    }
    return {
      ...(index === 1 ? {} : { marginLeft: "-50px" }),
      zIndex: zIndex,
      display: zIndex === 0 ? "none" : "block",
      transform:
        zIndex === 0 ? "scale(0)" : `scale(${0.5 + zIndex / (2 * max)})`
    };
  };
  return (
    <>
      {viewingImages && viewingImages.length > 0 ? (
        <div
          className="container"
          style={{ background: `${pause ? "pink" : "green"}` }}
        >
          {viewingImages.map((image, index) => {
            return (
              <img
                onClick={(e) => {
                  if (image.position === "left") {
                    clickPrev();
                    onClickNext(viewingIndex);
                  } else if (image.position === "right") {
                    clickNext();
                    onClickPrev(viewingIndex);
                  } else {
                    togglePause();
                  }
                }}
                className="item"
                style={styleByIndex(index)}
                alt=""
                src={image.url}
                key={image.key}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export default Carousel;
