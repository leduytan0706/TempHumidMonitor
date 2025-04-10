import React, { useEffect, useRef, useState } from 'react'
import {AirVent, Fan} from 'lucide-react';
import listenToRealtimeData from '../utils/listenToRealtimeData';
import toast from 'react-hot-toast';

const DeviceData = () => {
    const [deviceData, setDeviceData] = useState({
        air_conditioner: false,
        fan: false
    });

    const prevAC = useRef(null);
    const prevFan = useRef(null);

    useEffect(() => {
        const unsubscribeDevice = listenToRealtimeData("/device/", async (data) => {
          const {air_conditioner, fan} = data;

          if (air_conditioner !== prevAC.current){
            toast.success(`Điều hòa đã được ${air_conditioner? 'bật': 'tắt'}`);
          }

          if (fan !== prevFan.current){
            toast.success(`Quạt đã được ${fan? 'bật': 'tắt'}`);
          }

          prevAC.current = air_conditioner;
          prevFan.current = fan;
    
          setDeviceData({
            air_conditioner: air_conditioner,
            fan: fan
          });
        });
    
        return () => unsubscribeDevice();
    }, [])

  return (
    <>
        <div className="dashboard-card-header align-left">
            <h3 className='dashboard-card-title'>
                Trạng thái thiết bị
            </h3>
        </div>
        <div className="dashboard-card-content">
            <p className="dashboard-card-text align-left">
                <AirVent className='dashboard-card-icon'/>
                <span>Trạng thái điều hòa: {deviceData.air_conditioner? "Đang bật": "Đang tắt"} </span>
            </p>
                <p className="dashboard-card-text align-left">
                <Fan className='dashboard-card-icon'/>
                <span> Trạng thái quạt: {deviceData.fan? "Đang bật": "Đang tắt"}</span>
            </p>
        </div>
    </>
  )
}

export default DeviceData