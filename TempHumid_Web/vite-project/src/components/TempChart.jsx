import React from 'react'
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'

import "./TempChart.css";

const TempChart = ({data}) => {
  return (
    <div className='temp-chart-container'>
        <h3>Biểu đồ nhiệt độ (8 giờ qua)</h3>
        {data.length > 0 ? (
            <ResponsiveContainer >
                <LineChart 
                    data={data}
                >
                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['auto', 'auto']} unit="°C"/>
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        ): (
            "Chưa có đủ dữ liệu"
        )}
    </div>
    
  )
}

export default TempChart