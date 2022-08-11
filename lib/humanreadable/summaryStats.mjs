'use strict';

// const summaryStats = {
// 	tx_bps: [],
// 	rx_bps: [],
// 	tx_pps: [],
// 	rx_pps: [],
// 	rx_drop_bps: [],
// 	active_flows: [],
// 	tx_cps: [],
// };

export function printSummaryStats(summaryStats) {
  // some basic analysis
  summaryStats.tx_bps = filterOutliers(summaryStats.tx_bps);
  summaryStats.rx_bps = filterOutliers(summaryStats.rx_bps);
  summaryStats.tx_pps = filterOutliers(summaryStats.tx_pps);
  summaryStats.rx_pps = filterOutliers(summaryStats.rx_pps);
  summaryStats.rx_drop_bps = filterOutliers(summaryStats.rx_drop_bps);
  summaryStats.active_flows = filterOutliers(summaryStats.active_flows);
  summaryStats.tx_cps = filterOutliers(summaryStats.tx_cps);

  summaryStats.tx_bps_stddev = arr_stddev(summaryStats.tx_bps);
  summaryStats.rx_bps_stddev = arr_stddev(summaryStats.rx_bps);
  summaryStats.tx_pps_stddev = arr_stddev(summaryStats.tx_pps);
  summaryStats.rx_pps_stddev = arr_stddev(summaryStats.rx_pps);
  summaryStats.rx_drop_bps_stddev = arr_stddev(summaryStats.rx_drop_bps);
  summaryStats.active_flows_stddev = arr_stddev(summaryStats.active_flows);
  summaryStats.tx_cps_stddev = arr_stddev(summaryStats.tx_cps);

  summaryStats.tx_bps_mean = arr_mean(summaryStats.tx_bps);
  summaryStats.rx_bps_mean = arr_mean(summaryStats.rx_bps);
  summaryStats.tx_pps_mean = arr_mean(summaryStats.tx_pps);
  summaryStats.rx_pps_mean = arr_mean(summaryStats.rx_pps);
  summaryStats.rx_drop_bps_mean = arr_mean(summaryStats.rx_drop_bps);
  summaryStats.active_flows_mean = arr_mean(summaryStats.active_flows);
  summaryStats.tx_cps_mean = arr_mean(summaryStats.tx_cps);

  summaryStats.tx_bps_max = Math.max(...summaryStats.tx_bps);
  summaryStats.rx_bps_max = Math.max(...summaryStats.rx_bps);
  summaryStats.tx_pps_max = Math.max(...summaryStats.tx_pps);
  summaryStats.rx_pps_max = Math.max(...summaryStats.rx_pps);
  summaryStats.rx_drop_bps_max = Math.max(...summaryStats.rx_drop_bps);
  summaryStats.active_flows_max = Math.max(...summaryStats.active_flows);
  summaryStats.tx_cps_max = Math.max(...summaryStats.tx_cps);

  summaryStats.tx_bps_min = Math.min(...summaryStats.tx_bps);
  summaryStats.rx_bps_min = Math.min(...summaryStats.rx_bps);
  summaryStats.tx_pps_min = Math.min(...summaryStats.tx_pps);
  summaryStats.rx_pps_min = Math.min(...summaryStats.rx_pps);
  summaryStats.rx_drop_bps_min = Math.min(...summaryStats.rx_drop_bps);
  summaryStats.active_flows_min = Math.min(...summaryStats.active_flows);
  summaryStats.tx_cps_min = Math.min(...summaryStats.tx_cps);

  console.log('');
    console.log('averages:');
    console.log(`tx_bps: ${summaryStats.tx_bps_mean}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_mean}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_mean}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_mean}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_mean}`);
    console.log(`active_flows: ${summaryStats.active_flows_mean}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_mean}`);

    console.log('');
    console.log('stddevs:');
    console.log(`tx_bps: ${summaryStats.tx_bps_stddev}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_stddev}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_stddev}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_stddev}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_stddev}`);
    console.log(`active_flows: ${summaryStats.active_flows_stddev}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_stddev}`);

    console.log('');
    console.log('max:');
    console.log(`tx_bps: ${summaryStats.tx_bps_max}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_max}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_max}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_max}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_max}`);
    console.log(`active_flows: ${summaryStats.active_flows_max}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_max}`);

    console.log('');
    console.log('min:');
    console.log(`tx_bps: ${summaryStats.tx_bps_min}`);
    console.log(`rx_bps: ${summaryStats.rx_bps_min}`);
    console.log(`tx_pps: ${summaryStats.tx_pps_min}`);
    console.log(`rx_pps: ${summaryStats.rx_pps_min}`);
    console.log(`rx_drop_bps: ${summaryStats.rx_drop_bps_min}`);
    console.log(`active_flows: ${summaryStats.active_flows_min}`);
    console.log(`tx_cps: ${summaryStats.tx_cps_min}`);
}

// stole these from various stackoverflow threads
export function arr_stddev(arr) {
  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr)=>{
    return acc + curr;
  }, 0) / arr.length;

  // Assigning (value - mean) ^ 2 to every array item
  arr = arr.map((k)=>{
    return (k - mean) ** 2;
  })

  // Calculating the sum of updated array
 let sum = arr.reduce((acc, curr)=> acc + curr, 0);

 // Calculating the variance
 let variance = sum / arr.length;

 // Returning the Standered deviation
 return Math.sqrt(sum / arr.length);
}

function arr_mean(arr) {
  const total = arr.reduce((acc, c) => acc + c, 0);
  const mean = total / arr.length;
  return mean;
}

// Clear outliers from our datasets - only used in human readable display
export function filterOutliers(someArray) {

  // Copy the values, rather than operating on references to existing values
  var values = someArray.concat();

  // Then sort
  values.sort( function(a, b) {
          return a - b;
       });

  /* Then find a generous IQR. This is generous because if (values.length / 4)
   * is not an int, then really you should average the two elements on either
   * side to find q1.
   */
  var q1 = values[Math.floor((values.length / 4))];
  // Likewise for q3.
  var q3 = values[Math.ceil((values.length * (3 / 4)))];
  var iqr = q3 - q1;

  // Then find min and max values
  var maxValue = q3 + iqr*1.5;
  var minValue = q1 - iqr*1.5;

  // Then filter anything beyond or beneath these values.
  var filteredValues = values.filter(function(x) {
      return (x <= maxValue) && (x >= minValue);
  });

  // Then return
  return filteredValues;
}
