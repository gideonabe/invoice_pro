function maxNo(intervals){
  // sort by end time
  intervals.sort((a, b) => a[1] - b[1]);

  let count = 1, lastEnd = intervals[0][1];
  for(let i = 1; i < intervals.length; i++){
    if(intervals[i][0] > lastEnd){
      count++;
      lastEnd = intervals[i][1];
    }
  }
  return count;
}


function longestIncreasingSubArrays(arr){
  let maxLen = 0, start = 0;
  for(let i = 1; i < arr.length; i++){
    if(arr[i] <= arr[i - 1]) start = i;
    maxLen = Math.max(maxLen, i - start + 1);
  }

  return maxLen;
}

const lectures = [[1, 3], [2, 4], [6 ,7], [6, 8]];
console.log(maxNo(lectures));