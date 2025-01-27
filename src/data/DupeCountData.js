// State management for duplicateCount
let duplicateCount = 0;

export const getDuplicateCount = () => duplicateCount;
export const setDuplicateCount = (value) => {
  duplicateCount = value;
};
export const incrementDuplicateCount = () => {
  duplicateCount++;
};
export const resetDuplicateCount = () => {
  duplicateCount = 0;
};
