import { PlaceInfoCard } from "../../components";
import { IconAi } from "../../icons";
import mapBg from "./assets/map-bg.png";
import { SHOOT_PLACES, type ShootPlace } from "./shootPlaceData";
import styles from "./shoot-map-chat.module.css";

type ShootMapChatProps = {
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
};

/**
 * `06 · 지도 채팅` — 지도 배경 + 장소 마커 + 하단 PlaceInfoCard.
 */
export function ShootMapChat({
  selectedPlaceId,
  onSelectPlace,
}: ShootMapChatProps) {
  const selected =
    SHOOT_PLACES.find((place) => place.id === selectedPlaceId) ?? null;
  const selectedIndex = selected
    ? SHOOT_PLACES.findIndex((place) => place.id === selected.id) + 1
    : 0;

  return (
    <div className={styles.root}>
      <img className={styles.map} src={mapBg} alt="" draggable={false} />

      <div className={styles.markers} aria-label="추천 장소">
        {SHOOT_PLACES.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={place.id === selectedPlaceId}
            onSelect={() => onSelectPlace(place.id)}
          />
        ))}
      </div>

      {selected ? (
        <div className={styles.cardSlot}>
          <PlaceInfoCard
            imageSrc={selected.imageSrc}
            imageAlt={selected.name}
            title={selected.name}
            status={selected.status}
            hours={selected.hours}
            distance={selected.distance}
            walkTime={selected.walkTime}
            address={selected.address}
            insight={selected.insight}
            index={selectedIndex}
            total={SHOOT_PLACES.length}
          />
        </div>
      ) : null}
    </div>
  );
}

function markerAlign(leftPercent: number): "start" | "center" | "end" {
  if (leftPercent < 28) return "start";
  if (leftPercent > 72) return "end";
  return "center";
}

function PlaceMarker({
  place,
  selected,
  onSelect,
}: {
  place: ShootPlace;
  selected: boolean;
  onSelect: () => void;
}) {
  const align = markerAlign(place.marker.left);
  const alignClass =
    align === "start"
      ? styles.markerStart
      : align === "end"
        ? styles.markerEnd
        : styles.markerCenter;

  /** 선택 캡슐이 좌·우로 잘리지 않도록 앵커를 안쪽으로 보정 */
  const leftStyle =
    align === "start"
      ? `max(${place.marker.left}%, 16px)`
      : align === "end"
        ? `min(${place.marker.left}%, calc(100% - 16px))`
        : `${place.marker.left}%`;

  return (
    <button
      type="button"
      className={[styles.marker, alignClass].join(" ")}
      style={{ left: leftStyle, top: `${place.marker.top}%` }}
      aria-label={place.name}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {selected ? (
        <span className={styles.markerCapsule}>{place.name}</span>
      ) : (
        <span className={styles.markerPin}>
          <IconAi size={18} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
