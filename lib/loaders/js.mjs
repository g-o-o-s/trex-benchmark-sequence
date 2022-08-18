'use strict';

export async function loadJsProfile(testProfile, dirname) {
  try {
    const profile = await import(`${dirname}/${testProfile.file}`);
    return JSON.parse(profile.default);
  } catch (error) {
    return error
  }
}
