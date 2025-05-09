const createSimulatedData = (numDevices, numDatapointsPerDevice, minutesDeltaBetweenMeasurements) => {
    return {
    "dboeventstable": 
        Array.from(Array(numDevices).keys()).map(deviceId => Array.from(Array(numDatapointsPerDevice).keys()).map(localDataId => {
            const timestamp = new Date(Date.now() - (minutesDeltaBetweenMeasurements * 60 * 1000 * localDataId)).toISOString();
            return {
                Id: localDataId + deviceId * numDatapointsPerDevice,
                PartitionId: "0",
                EventEnqueuedUtcTime: timestamp,
                EventProcessedUtcTime: timestamp,
                temperature: Math.random() * 10 + 20, // Random temperature between 20 and 30
                humidity: Math.random() * 10 + 30, // Random humidity between 30 and 40
                timestamp: timestamp,
                device_id: String(deviceId + 1)
            };
        })).reduce((acc, cur) => acc.concat(cur), [])
    }
}
module.exports = createSimulatedData;