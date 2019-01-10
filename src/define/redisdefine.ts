export const SET_MODE = {
  EX: 'EX', // seconds -- Set the specified expire time, in seconds.
  PX: 'PX', // milliseconds -- Set the specified expire time, in milliseconds.
  NX: 'NX', // -- Only set the key if it does not already exist.
  XX: 'XX', // -- Only set the key if it already exist.
};