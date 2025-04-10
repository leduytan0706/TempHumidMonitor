import React, { useEffect, useState } from 'react'
import ModifyThreshold from './ModifyThreshold';
import TempHumidData from './TempHumidData';
import DeviceData from './DeviceData';
import "./Dashboard.css";
import getRecentSensorData from '../utils/getRecentSensorData';
import TempChart from './TempChart';
import formatSensorData from '../utils/formatSensorData';
import listenToDataLogs from '../utils/listenToDataLogs';
import HumidityChart from './HumidityChart';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    tempData: [],
    humidityData: []
  });

  useEffect(() => {
    const loadSensorData = async () => {
      const response = await getRecentSensorData();

      const formattedTempData = formatSensorData("temperature", response);
      const formattedHumidData = formatSensorData("humidity", response);

      setSensorData({
        tempData: formattedTempData,
        humidityData: formattedHumidData
      });
    };

    loadSensorData();

    const unsubscribeDataLogs = listenToDataLogs(setSensorData);

    return () => unsubscribeDataLogs();
  }, []);


  return (
    <div className='dashboard-page'>
      <div className="dashboard-monitor-section">
        <div className="dashboard-card current-card">
          <TempHumidData />
        </div>
        <div className="dashboard-card device-card">
          <DeviceData />
        </div>
      </div>
      
      <div className='dashboard-charts-section'>
        <div className='dashboard-card temp-chart'>
          <TempChart
            data={sensorData?.tempData}
          />
        </div>
        <div className='dashboard-card humid-chart'>
          <HumidityChart 
            data={sensorData?.humidityData}
          />
        </div>
      </div>
      <div className="dashboard-threshold-section">
        <div className="dashboard-card threshhold-card">
            <ModifyThreshold />
        </div>
      </div>
    </div>
  )
}

export default Dashboard