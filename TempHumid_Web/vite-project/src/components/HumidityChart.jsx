import React from 'react'
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'

import "./HumidityChart.css";

const HumidityChart = ({data}) => {
  return (
        <div className='humid-chart-container'>
            <h3>Biểu đồ độ ẩm (8 giờ qua)</h3>
            {data.length > 0 ? (
                <ResponsiveContainer >
                    <LineChart 
                        data={data}
                    >
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={['auto', 'auto']} unit="%"/>
                        <Tooltip />
                        <Line type="monotone" dataKey="humidity" stroke="#C2175B" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            ): (
                "Chưa có đủ dữ liệu"
            )}
        </div>
    )
}

export default HumidityChart