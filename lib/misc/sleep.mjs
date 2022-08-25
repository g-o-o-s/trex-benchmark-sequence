'use strict';

export async function sleep(ms) {
  // Sleep 1 second
  await new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}
