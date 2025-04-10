const formatSensorData = (option = 'temperature', sensorData) => {
    if (option === "temperature"){
        const formattedTempData = sensorData.map(data => ({
            time: new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: data.temperature
        }));
        return formattedTempData
    }
    else if (option === "humidity"){
        const formattedHumidData = sensorData.map(data => ({
            time: new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            humidity: data.humidity
          }));
        return formattedHumidData
    }
    return null;
    
};

export default formatSensorData;