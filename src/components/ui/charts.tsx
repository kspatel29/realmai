
import * as React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "./chart";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

// BarChart Component
export const BarChart = ({
  className,
  data,
}: {
  className?: string;
  data: ChartData;
}) => {
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  const chartConfig = data.datasets.reduce((acc, dataset) => {
    acc[dataset.label] = {
      label: dataset.label,
      color: Array.isArray(dataset.backgroundColor) 
        ? dataset.backgroundColor[0] 
        : dataset.backgroundColor,
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Bar 
            key={index}
            dataKey={dataset.label}
            fill={Array.isArray(dataset.backgroundColor) 
              ? dataset.backgroundColor[0] 
              : dataset.backgroundColor}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

// LineChart Component
export const LineChart = ({
  className,
  data,
}: {
  className?: string;
  data: ChartData;
}) => {
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  const chartConfig = data.datasets.reduce((acc, dataset) => {
    acc[dataset.label] = {
      label: dataset.label,
      color: dataset.borderColor || dataset.backgroundColor,
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};

// PieChart Component
export const PieChart = ({
  className,
  data,
}: {
  className?: string;
  data: ChartData;
}) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  const chartConfig = data.labels.reduce((acc, label, index) => {
    acc[label] = {
      label,
      color: Array.isArray(data.datasets[0].backgroundColor) 
        ? data.datasets[0].backgroundColor[index] 
        : data.datasets[0].backgroundColor,
    };
    return acc;
  }, {} as Record<string, any>);

  const COLORS = Array.isArray(data.datasets[0].backgroundColor)
    ? data.datasets[0].backgroundColor
    : Array(data.labels.length).fill(data.datasets[0].backgroundColor || "#8884d8");

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};
