type Duration = number;
export default class Carbon extends Date {
  public static carbon() {
    return new Carbon();
  }

  addSecond(sec: number): Carbon {
    return new Carbon(this.getTime() + Carbon.SECOND * sec);
  }

  addMinute(min: number): Carbon {
    return new Carbon(this.getTime() + Carbon.MINUTE * min);
  }

  public static get SECOND(): Duration {
    return 1000;
  }
  public static get MINUTE(): Duration {
    return 60000;
  }
}
