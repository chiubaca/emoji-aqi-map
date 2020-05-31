//Find Mean from a list of numbers 
export function mean(numbers) {
  // mean of [3, 5, 4, 4, 1, 1, 2, 3] is 2.875
  var total = 0,
    i;
  for (i = 0; i < numbers.length; i += 1) {
    total += numbers[i];
  }
  return Math.round(total / numbers.length);
}

//Outputs a range used to for producing a normalised number used for opacity value
export function numberRange(lowAQI, topAQI) {
  return new Array(topAQI - lowAQI).fill().map((d, i) => i + lowAQI);
};

//Normalised score
export function normalise(x, y) {
  return x / y;
};