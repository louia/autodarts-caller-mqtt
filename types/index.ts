export type EventType = "state" | "cam_stats" | "stats" | "motion_state";

type Resolution = {
  width: number;
  height: number;
};

export type Event = {
  data: unknown;
  type: EventType;
};

export interface CamStateEvent extends Event {
  data: {
    id: number;
    fps: number;
    resolution: Resolution;
  };
}

export interface StatsEvent extends Event {
  data: {
    fps: number;
    resolution: Resolution;
  };
}

export interface MotionStateEvent extends Event {
  data: {
    darts: number;
    isStable: boolean;
    handWasInFrame: boolean;
    handIsInFrame: boolean;
    dartIsInFrame: boolean;
    allDartsRemoved: boolean;
    anyDartRemoved: boolean;
    updating: boolean;
  };
}

type Bed = "Outside" | "SingleOuter" | "Triple" | "Double" | "SingleInner";
type ThrowEvent = {
  segment: {
    name: string;
    number: number;
    bed: Bed;
    multiplier: number;
    detectionVersion: number;
  };
  coords: {
    x: number;
    y: number;
  };
};

type StateThrowEvent = "Throw detected" | "Takeout finished";

export interface StateEvent extends Event {
  data: {
    connected: boolean;
    running: boolean;
    status: string;
    event: StateThrowEvent;
    numThrows: number;
    throws: ThrowEvent[];
  };
}
