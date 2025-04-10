import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { fireStoreDatabase as fsdb } from "../lib/firebase";
import formatSensorData from "./formatSensorData";

const listenToDataLogs = (onDataUpdate) => {
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

    // Tạo query để lọc các bản ghi có timestamp >= 8 giờ trước
    const q = query(
        collection(fsdb, "sensorData"),
        where("createdAt", ">=", Timestamp.fromDate(eightHoursAgo))
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedData = [];
        querySnapshot.forEach((doc) => {
          updatedData.push({ id: doc.id, ...doc.data() });
        });

        const formattedTempData = formatSensorData("temperature", updatedData);
        const formattedHumidData = formatSensorData("humidity", updatedData);

        onDataUpdate({
            tempData: formattedTempData,
            humidityData: formattedHumidData
        }); // callback để set state
      });
    
    return unsubscribe; // trả lại để huỷ lắng nghe khi cần
};

export default listenToDataLogs;