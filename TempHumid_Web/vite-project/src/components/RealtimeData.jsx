import React, { useEffect, useState, useRef } from "react";
import { onValue, ref } from "firebase/database";
import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import listenToRealtimeData from "../utils/listenToRealtimeData";

const RealtimeData = () => {
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
    <div className="p-4">
      <h2 className="text-xl font-semibold">Nhiệt độ: {sensorData.temperature}°C</h2>
      <h2 className="text-xl font-semibold">Độ ẩm: {sensorData.humidity}%</h2>
    </div>
  );
};

export default RealtimeData;
