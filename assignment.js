const fs = require('fs');

// Read heart rate data from heartrate json file
const heartRateData = JSON.parse(fs.readFileSync('heartrate.json', 'utf8'));

// Function to calculate median
const calculateMedian = (arr) => {
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sortedArr.length / 2);
    if (sortedArr.length % 2 === 0) {
        return (sortedArr[middle - 1] + sortedArr[middle]) / 2;
    } else {
        return sortedArr[middle];
    }
};

// Calculate statistics for each day
const dailyStatistics = {};
heartRateData.forEach(entry => {
    const date = entry.timestamps.startTime.split('T')[0];
    if (!dailyStatistics[date]) {
        dailyStatistics[date] = {
            min: entry.beatsPerMinute,
            max: entry.beatsPerMinute,
            beats: [entry.beatsPerMinute],
            latestDataTimestamp: entry.timestamps.endTime
        };
    } else {
        const stats = dailyStatistics[date];
        stats.min = Math.min(stats.min, entry.beatsPerMinute);
        stats.max = Math.max(stats.max, entry.beatsPerMinute);
        stats.beats.push(entry.beatsPerMinute);
        stats.latestDataTimestamp = entry.timestamps.endTime;
    }
});

// Calculate median for each day
for (const date in dailyStatistics) {
    dailyStatistics[date].median = calculateMedian(dailyStatistics[date].beats);
    delete dailyStatistics[date].beats;
}

// Convert dailyStatistics object to array
const output = Object.entries(dailyStatistics).map(([date, stats]) => ({
    date,
    min: stats.min,
    max: stats.max,
    median: stats.median,
    latestDataTimestamp: stats.latestDataTimestamp
}));

// Write output to output.json
fs.writeFileSync('output.json', JSON.stringify(output, null, 2));