declare module "@createjs/core" {
  export type TickMode = "raf" | "synched" | "timeout";

  export class Ticker {
    static RAF: TickMode;
    static RAF_SYNCHED: TickMode;
    static TIMEOUT: TickMode;
    static timingMode: TickMode;
  }
}

declare module "@createjs/tweenjs" {
  export type EaseFunction = (t: number) => number;

  export type TweenProps = {
    override?: boolean;
    [key: string]: unknown;
  };

  export class Tween<T extends object = object> {
    static get<TTarget extends object>(
      target: TTarget,
      props?: TweenProps,
    ): Tween<TTarget>;
    static removeAllTweens(): void;
    to(props: Partial<T>, duration?: number, ease?: EaseFunction): Tween<T>;
    call(callback: () => void): Tween<T>;
  }
  export class Ease {
    static quadOut: EaseFunction;
    static linear: EaseFunction;
  }
}
