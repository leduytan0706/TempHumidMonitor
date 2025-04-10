import { getFirestore, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";


const getRecentSensorData = async () => {
    // Tính thời gian 8 giờ trước (theo mili giây)
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

    // Tạo query để lọc các bản ghi có timestamp >= 8 giờ trước
    const q = query(
        collection(fsdb, "sensorData"),
        where("createdAt", ">=", Timestamp.fromDate(eightHoursAgo))
    );

    try {
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        console.log("Dữ liệu trong 8 giờ qua:", results);
        return results;
    } catch (error) {
       console.log(`Error in getRecentSensorData: ${error.message}`);
       toast.error("Đã xảy ra lỗi khi lấy dữ liệu cảm biến gần đây. Hãy thử lại sau.");
    }

};

export default getRecentSensorData;