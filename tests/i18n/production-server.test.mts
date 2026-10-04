import assert from "node:assert/strict";
import test from "node:test";

import {
  hasProcessExited,
  isServerTreeRunning,
} from "../../scripts/i18n/production-server.mts";

test("process lifecycle treats signal termination as an exit", () => {
  assert.equal(hasProcessExited({ exitCode: null, signalCode: null }), false);
  assert.equal(hasProcessExited({ exitCode: 0, signalCode: null }), true);
  assert.equal(
    hasProcessExited({ exitCode: null, signalCode: "SIGTERM" }),
    true,
  );
  assert.equal(
    hasProcessExited({ exitCode: null, signalCode: "SIGKILL" }),
    true,
  );
});

test("cleanup waits for the child exit event before probing its group", (t) => {
  const probe = t.mock.method(process, "kill", () => {
    throw Object.assign(new Error("group is terminating"), { code: "EPERM" });
  });
  assert.equal(
    isServerTreeRunning({ pid: 123, exitCode: null, signalCode: null }),
    true,
  );
  assert.equal(probe.mock.callCount(), 0);
});

test(
  "an exited child still requires checking for surviving descendants",
  {
    skip: process.platform === "win32",
  },
  (t) => {
    const probe = t.mock.method(process, "kill", () => true);
    assert.equal(
      isServerTreeRunning({ pid: 123, exitCode: null, signalCode: "SIGKILL" }),
      true,
    );
    assert.deepEqual(probe.mock.calls[0].arguments, [-123, 0]);
  },
);

test(
  "only a missing process group counts as stopped; permission errors propagate",
  {
    skip: process.platform === "win32",
  },
  (t) => {
    let code = "ESRCH";
    t.mock.method(process, "kill", () => {
      throw Object.assign(new Error("group probe failed"), { code });
    });
    const child = { pid: 123, exitCode: 0, signalCode: null };
    assert.equal(isServerTreeRunning(child), false);
    code = "EPERM";
    assert.throws(() => isServerTreeRunning(child), { code: "EPERM" });
  },
);
