import React, { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef } from "react";

const modifyThreshold = () => {
    const {sensorThreshold, setSensorThreshold} = useState({
        maxTemp: "",
        maxHumid: "",
        tempThreshold: "",
        humidThreshold: ""
    });

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


    return (
        <div className="modify-threshold">
            <div className="modify-threshold-title">
                <h2>Điều chỉnh ngưỡng nhiệt độ, độ ẩm</h2>
            </div>
            <div className="modify-threshold-section">
                <form className="modify-threshold-form">
                    <div className="form-field">
                        <label htmlFor="maxTemp" className="form-label">
                            <span className="form-name">Nhiệt độ tối đa (độ C)</span>
                            <span className="form-desc">Khi nhiệt độ vượt quá giá trị này hệ thống sẽ tự động bật điều hòa và quạt.</span>
                            <input 
                                type="number" 
                                id="maxTemp"
                                name="maxTemp"
                                value={sensorThreshold.maxTemp}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, maxTemp: e.target.value}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="maxTemp" className="form-label">
                            <span className="form-name">Độ ẩm tối đa (%)</span>
                            <span className="form-desc">Khi độ ẩm vượt quá giá trị này hệ thống sẽ tự động bật điều hòa và quạt.</span>
                            <input 
                                type="number" 
                                id="maxTemp"
                                name="maxTemp"
                                value={sensorThreshold.maxHumid}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, maxHumid: e.target.value}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="maxTemp" className="form-label">
                            <span className="form-name">Ngưỡng nhiệt độ thay đổi (độ C)</span>
                            <span className="form-desc">Khi chênh lệch nhiệt độ vượt quá giá trị này hệ thống sẽ lưu lại.</span>
                            <input 
                                type="number" 
                                id="maxTemp"
                                name="maxTemp"
                                value={sensorThreshold.tempThreshold}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, tempThreshold: e.target.value}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="maxTemp" className="form-label">
                            <span className="form-name">Ngưỡng độ ẩm thay đổi (%)</span>
                            <span className="form-desc">Khi chênh lệch độ ẩm vượt quá giá trị này hệ thống sẽ lưu lại.</span>
                            <input 
                                type="number" 
                                id="maxTemp"
                                name="maxTemp"
                                value={sensorThreshold.humidThreshold}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, humidThreshold: e.target.value}))}
                            />
                        </label>
                    </div>
                    <div className="form-submit">
                        <button className="submit-btn">
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default modifyThreshold;