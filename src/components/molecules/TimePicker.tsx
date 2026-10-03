"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";

// Reusable scroll picker component
const ScrollPicker = ({
  items,
  selected,
  onSelect,
  itemHeight = 40,
  width = "2.75rem",
}: {
  items: (string | number)[];
  onSelect?: (payload: string | number) => void;
  selected: string | number;
  width?: string;
  itemHeight?: number;
}) => {
  const containerRef = useRef(null);
  const isProgrammaticScroll = useRef(false); // My attempt at multiple state changes, I noticed when there's a 'selected' state, the component scrolls to the particular number, this in turn triggers the handleScroll function which changes the state further, thus creating a chain reaction, here's the fix (A programmatic scroll, during this period, the handleScroll is invalidated)
  const scrollTimeoutRef = useRef(null);

  // When `selected` changes, trigger a programmatic scroll.
  useEffect(() => {
    isProgrammaticScroll.current = true;
    if (containerRef.current) {
      const index = items.indexOf(selected);
      if (index !== -1) {
        (containerRef.current as any)?.scrollTo({
          top: index * itemHeight,
          behavior: "smooth",
        });
      }
    }
    // Wait for the smooth scroll to likely finish before accepting user scroll events.
    const timer = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 300); // Adjust this duration based on your animation timing

    return () => clearTimeout(timer);
  }, [selected]);

  const handleScroll = () => {
    // If a programmatic scroll is in progress, ignore scroll events.
    if (isProgrammaticScroll.current) return;

    // Debounce the scroll updates.
    clearTimeout(scrollTimeoutRef.current as unknown as NodeJS.Timeout);
    (scrollTimeoutRef.current as unknown as NodeJS.Timeout) = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = (containerRef.current as any)?.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      if (items[index] !== selected) {
        onSelect?.(items[index]);
      }
    }, 100); // Debounce here, why?, to avoid too much updates, unneccesary ones, so that only after scroll snaps at a value, time is updated
  };

  const handleClick = (index: number) => {
    if (!containerRef.current) return;
    const scrollTop = index * itemHeight;
    (containerRef.current as any)?.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        height: itemHeight * 3,
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="hide-scrollbar"
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          paddingTop: itemHeight,
          paddingBottom: itemHeight,
        }}
      >
        {items.map((item, index) => (
          <button
            type="button"
            onClick={() => handleClick(index)}
            key={`__scroll__snap__button__${item}__${index}`}
            className="flex w-full items-center justify-center text-[1rem]"
            style={{
              height: itemHeight,
              scrollSnapAlign: "center",
              fontWeight: selected === item ? "600" : "500",
              color: selected === item ? "#344054" : "#667085",
            }}
          >
            {+item < 10 ? `0${item}` : item}
          </button>
        ))}
      </div>
      <div
        className="border-b-[0.5px] border-t-[0.5px] border-[#EAECF0]"
        style={{
          position: "absolute",
          top: itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

interface ITimeUpdatePayload {
  hour: number;
  minute: number;
  second: number;
  isAM: boolean;
}

const TimePicker = ({
  pendingSelectedTime,
  onChange,
}: {
  pendingSelectedTime?: ITimeUpdatePayload;
  onChange?: (update: ITimeUpdatePayload) => void;
}) => {
  // Convert `pendingSelectedTime` or fallback to the current time
  const getInitialTime = () => {
    if (pendingSelectedTime) {
      return pendingSelectedTime;
    }
    const now = new Date();
    let hour = now.getHours();
    const isAM = hour < 12;
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;

    return {
      hour,
      minute: now.getMinutes(),
      second: now.getSeconds(),
      isAM,
    };
  };

  const [selectedTime, setSelectedTime] = useState({
    hour: 12,
    minute: 0,
    second: 0,
    isAM: true,
  });

  const lastEmittedTime = useRef<ITimeUpdatePayload | null>(null); // In the bid (my unrelenting attempt) to avoid rerender hell as much as possible, I decided to track updates and make sure they've truly changerd before I emit changes to the parent, I'd implement a debounce too(see below)...
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ensure UI updates if `pendingSelectedTime` changes
  useEffect(() => {
    setSelectedTime(getInitialTime());
  }, [JSON.stringify(pendingSelectedTime)]);

  // Generate time values
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const meridiems = ["AM", "PM"];

  // Emit updated time on any change

  useEffect(() => {
    if (
      JSON.stringify(selectedTime) !==
        JSON.stringify(lastEmittedTime.current) &&
      JSON.stringify(selectedTime) !== JSON.stringify(pendingSelectedTime)
    ) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Timeout here is to allow the parent to update the child before the child starts sending updates to the parent...
      debounceTimeout.current = setTimeout(() => {
        onChange?.(selectedTime);

        lastEmittedTime.current = selectedTime; // Update the last emitted time
      }, 200);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [JSON.stringify(selectedTime)]);

  const handleSelect = (key: string, value: number | boolean) => {
    setSelectedTime((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-w-[17.875rem] p-[1.25rem_1.5rem]">
      <h4 className="py-[.625rem] text-[1.02rem] font-[600] text-[#344054]">
        Set Time
      </h4>
      <div className="flex">
        <div>
          <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">
            HR
          </h5>
          <ScrollPicker
            items={hours}
            selected={selectedTime?.hour}
            onSelect={(value) => handleSelect("hour", Number(value))}
          />
        </div>
        <div>
          <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">
            MIN
          </h5>
          <ScrollPicker
            items={minutes}
            selected={selectedTime.minute}
            onSelect={(value) => handleSelect("minute", Number(value))}
          />
        </div>
        <div>
          <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">
            SEC
          </h5>
          <ScrollPicker
            items={seconds}
            selected={selectedTime.second}
            onSelect={(value) => handleSelect("second", Number(value))}
          />
        </div>
        <div>
          <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">
            MER
          </h5>
          <ScrollPicker
            items={meridiems}
            selected={selectedTime.isAM ? "AM" : "PM"}
            onSelect={(value) => handleSelect("isAM", value === "AM")}
          />
        </div>
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1rem", color: "#344054" }}>
        <p>
          Selected Time: {selectedTime.hour}:
          {String(selectedTime.minute).padStart(2, "0")}:
          {String(selectedTime.second).padStart(2, "0")}{" "}
          {selectedTime.isAM ? "AM" : "PM"}
        </p>
      </div>
    </div>
  );
};

export { TimePicker };
