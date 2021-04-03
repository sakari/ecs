import { Suite } from "benchmark";
import * as setup from "./setup";

const suite = new Suite();

suite.add("1000 entities moving for 100 steps", {
  fn: () => {
    const { clock, engine } = setup.setup();
    for (let i = 0; i < 100; i++) {
      engine.set(clock, "clock", { deltaMs: 10 });
      engine.step();
    }
  },
  onComplete: (r: any) => {
    // eslint-disable-next-line no-console
    console.log(String(r.target));
  },
});

suite.run();
