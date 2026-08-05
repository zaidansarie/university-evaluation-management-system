export const getGrade = (percentage) => {
  if (percentage === null || percentage === undefined || percentage === 'N/A' || percentage === '-') return 'N/A';
  
  const p = parseFloat(percentage);
  if (isNaN(p)) return 'N/A';
  
  if (p >= 90) return 'O';
  if (p >= 80) return 'A+';
  if (p >= 70) return 'A';
  if (p >= 60) return 'B+';
  if (p >= 50) return 'B';
  if (p >= 40) return 'C';
  return 'F';
};
