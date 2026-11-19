import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ResourceNoteCard, ShotPoint } from "../../components";
import {
  SHOOT_DETAIL_SETS,
  type ShootDetailSlide,
} from "./shootDetailData";
import styles from "./shoot-resource-detail.module.css";

type ShootResourceDetailProps = {
  resourceId: string;
};

function slideKey(slide: ShootDetailSlide, index: number) {
  return `${slide.title}-${index}`;
}

/**
 * 시안 `02 · 강변 촬영`.
 * 캐러셀 + ShotPoint + ResourceNoteCard(등록 카드).
 * 첫 이미지 왼쪽 `--padding-ios-x`(16px) · 가로 스와이프.
 */
export function ShootResourceDetail({ resourceId }: ShootResourceDetailProps) {
  const detail = SHOOT_DETAIL_SETS[resourceId];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);
  const [active, setActive] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    setActive(0);
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [resourceId]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function measure() {
      const pad =
        Number.parseFloat(getComputedStyle(el).paddingLeft) || 0;
      setSlideWidth(Math.max(0, el.clientWidth - pad * 2));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [resourceId, detail?.slides.length]);

  if (!detail) return null;

  const slide = detail.slides[active] ?? detail.slides[0];
  const gap = 8;

  function stepSize() {
    return slideWidth > 0 ? slideWidth + gap : 0;
  }

  function syncActive() {
    const el = scrollerRef.current;
    const step = stepSize();
    if (!el || step <= 0) return;
    const next = Math.round(el.scrollLeft / step);
    setActive(Math.min(Math.max(next, 0), detail.slides.length - 1));
  }

  function snapTo(index: number) {
    const el = scrollerRef.current;
    const step = stepSize();
    if (!el || step <= 0) return;
    const clamped = Math.min(Math.max(index, 0), detail.slides.length - 1);
    el.scrollTo({ left: clamped * step, behavior: "smooth" });
    setActive(clamped);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
    };
    el.style.scrollSnapType = "none";
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag || !el || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    el.scrollLeft = drag.startScroll - (event.clientX - drag.startX);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag || !el || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    el.style.scrollSnapType = "";
    const step = stepSize();
    if (step <= 0) {
      syncActive();
      return;
    }
    snapTo(Math.round(el.scrollLeft / step));
  }

  return (
    <div className={styles.root}>
      <div
        ref={scrollerRef}
        className={styles.carousel}
        onScroll={syncActive}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="레퍼런스 이미지"
      >
        {detail.slides.map((item, index) => (
          <div
            key={slideKey(item, index)}
            className={styles.slide}
            style={
              slideWidth > 0
                ? { width: slideWidth, flex: `0 0 ${slideWidth}px` }
                : undefined
            }
          >
            <img
              className={styles.photo}
              src={item.image}
              alt=""
              draggable={false}
            />
          </div>
        ))}
      </div>

      <ShotPoint
        className={styles.shot}
        index={String(active + 1)}
        title={slide.title}
        description={slide.description}
      />

      <div className={styles.noteBand}>
        <ResourceNoteCard
          className={styles.note}
          source={slide.noteSource}
          date={slide.noteDate}
          title={slide.noteTitle}
          body={slide.noteBody}
        />
      </div>
    </div>
  );
}

export function getShootDetailHeaderTitle(resourceId: string) {
  return SHOOT_DETAIL_SETS[resourceId]?.headerTitle ?? "촬영 자료";
}
