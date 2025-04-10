import React, { useEffect, useState, useRef } from "react";

import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import listenToRealtimeData from "../utils/listenToRealtimeData";
import { Thermometer, Droplet } from "lucide-react";
import "./TempHumidData.css";

const TempHumidData = () => {
  const [sensorData, setSensorData] = useState({
    temperature: "--",
    humidity: "--"
  });
  const [sensorThreshold, setSensorThreshold] = useState(null);

  const prevTemp = useRef(null);
  const prevHumid = useRef(null);

  useEffect(() => {
    const unsubscribeThreshold = listenToRealtimeData("/threshold/", async (data) => {
      const {maxTemp, maxHumid, tempThreshold, humidThreshold} = data;
      console.log(data);

      setSensorThreshold({
        maxTemp: maxTemp,
        maxHumid: maxHumid,
        tempThreshold: tempThreshold,
        humidThreshold: humidThreshold
      });
    });

    return () => unsubscribeThreshold();
  }, [])

  useEffect(() => {
    if (!sensorThreshold) return;
    
    const unsubscribeSensor = listenToRealtimeData("/sensor/", async (data) => {
      const { temperature: newTemp, humidity: newHumid } = data;
      console.log(prevTemp.current, prevHumid.current);
      console.log(newTemp, newHumid);

      console.log(prevTemp.current ?? newTemp);

      // So sánh giá trị mới với giá trị cũ
      const isTempChanged = Math.abs(newTemp - (prevTemp.current ?? newTemp)) >= sensorThreshold.tempThreshold;
      const isHumidChanged = Math.abs(newHumid - (prevHumid.current ?? newHumid)) >= sensorThreshold.humidThreshold;

      console.log(isTempChanged, isHumidChanged);

      if (isTempChanged || isHumidChanged) {
        console.log("Đang cập nhật dữ liệu lên database.");

        // Gửi dữ liệu lên FireStore
        await addDoc(collection(fsdb, "/sensorData"), {
          temperature: newTemp,
          humidity: newHumid,
          createdAt: serverTimestamp()
        });

        console.log("Thêm dữ liệu lên Firestore thành công.");
      }

      setSensorData({
        temperature: newTemp,
        humidity: newHumid
      });

      // Cập nhật giá trị cũ
      prevTemp.current = newTemp;
      prevHumid.current = newHumid;
    });

    // Cleanup listeners when component unmounts
    return () => {
      unsubscribeSensor();
    };
  }, [sensorThreshold]);

  return (
    <>
      <div className="dashboard-card-header align-left">
        <h3 className='dashboard-card-title'>
          Nhiệt độ và độ ẩm hiện tại
        </h3>
      </div>
      <div className="dashboard-card-content">
        
        <p className="dashboard-card-text align-left">
          <Thermometer className="dashboard-card-icon" />
          <span>Nhiệt độ hiện tại: {sensorData.temperature}°C </span>
        </p>
        <p className="dashboard-card-text align-left">
          <Droplet className="dashboard-card-icon"/>
          <span>Độ ẩm hiện tại: {sensorData.humidity}%</span>
        </p>
      </div>
    </>
  );
};

export default TempHumidData;
