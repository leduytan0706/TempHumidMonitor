import React, { useEffect, useState } from "react";
import "./ModifyThreshold.css";
import { ref, set } from "firebase/database";
import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";
import listenToRealtimeData from "../utils/listenToRealtimeData";
import toast from "react-hot-toast";

const ModifyThreshold = () => {
    const [sensorThreshold, setSensorThreshold] = useState({
        maxTemp: "",
        maxHumid: "",
        tempThreshold: "",
        humidThreshold: ""
    });

    useEffect(() => {
        const unsubscribeThreshold = listenToRealtimeData("/threshold/", async (data) => {
            const {maxTemp, maxHumid, tempThreshold, humidThreshold} = data;
      
            setSensorThreshold({
              maxTemp: maxTemp,
              maxHumid: maxHumid,
              tempThreshold: tempThreshold,
              humidThreshold: humidThreshold
            });
          });
      
        return () => unsubscribeThreshold();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(sensorThreshold);
        try {
            await set(ref(rtdb, "/threshold/maxTemp"), sensorThreshold.maxTemp || null);
            await set(ref(rtdb, "/threshold/maxHumid"), sensorThreshold.maxHumid || null);
            await set(ref(rtdb, "/threshold/tempThreshold"), sensorThreshold.tempThreshold || null);
            await set(ref(rtdb, "/threshold/humidThreshold"), sensorThreshold.humidThreshold || null);
            toast.success("Cập nhật dữ liệu thành công!");
        } catch (error) {
            console.log(`Error in ModifyThreshold submit function: ${error.message}`);
            toast.error("Có lỗi xảy ra khi điều chỉnh dữ liệu. Hãy thử lại sau.");
        }
        
    };


    return (
        <>
            <div className="modify-threshold-header">
                <h3 className="modify-threshold-title">Điều chỉnh ngưỡng nhiệt độ, độ ẩm</h3>
            </div>
            <div className="modify-threshold-section">
                <form className="modify-threshold-form" action="" method="POST" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="maxTemp" className="form-label">
                            <span className="form-name">Nhiệt độ tối đa (°C)</span>
                            <span className="form-desc">Khi nhiệt độ vượt quá giá trị này hệ thống sẽ tự động bật điều hòa và quạt.</span>
                            <input 
                                type="number" 
                                id="maxTemp"
                                name="maxTemp"
                                className="form-input"
                                placeholder="0"
                                value={sensorThreshold?.maxTemp}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, maxTemp: parseFloat(e.target.value) || ""}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="maxHumid" className="form-label">
                            <span className="form-name">Độ ẩm tối đa (%)</span>
                            <span className="form-desc">Khi độ ẩm vượt quá giá trị này hệ thống sẽ tự động bật điều hòa và quạt.</span>
                            <input 
                                type="number" 
                                id="maxHumid"
                                name="maxHumid"
                                className="form-input"
                                placeholder="0"
                                value={sensorThreshold?.maxHumid}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, maxHumid: parseFloat(e.target.value) || ""}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="tempThreshold" className="form-label">
                            <span className="form-name">Ngưỡng nhiệt độ thay đổi (°C)</span>
                            <span className="form-desc">Khi chênh lệch nhiệt độ vượt quá giá trị này hệ thống sẽ lưu lại.</span>
                            <input 
                                type="number" 
                                id="tempThreshold"
                                name="tempThreshold"
                                className="form-input"
                                placeholder="0"
                                step=".01"
                                value={sensorThreshold?.tempThreshold}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, tempThreshold: parseFloat(e.target.value) || ""}))}
                            />
                        </label>
                    </div>
                    <div className="form-field">
                        <label htmlFor="humidThreshold" className="form-label">
                            <span className="form-name">Ngưỡng độ ẩm thay đổi (%)</span>
                            <span className="form-desc">Khi chênh lệch độ ẩm vượt quá giá trị này hệ thống sẽ lưu lại.</span>
                            <input 
                                type="number" 
                                id="humidThreshold"
                                name="humidThreshold"
                                className="form-input"
                                placeholder="0"
                                step=".01"
                                value={sensorThreshold?.humidThreshold}
                                onChange={(e) => setSensorThreshold(prev => ({...prev, humidThreshold: parseFloat(e.target.value) || ""}))}
                            />
                        </label>
                    </div>
                    <div className="form-submit align-right">
                        <button  type="submit" className="submit-btn align-center">
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
};

export default ModifyThreshold;