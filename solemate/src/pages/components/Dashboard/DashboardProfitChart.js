"use client";
import { supabase } from '../../../lib/supabaseClient';
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"; // Using Recharts' built-in Tooltip
import {Spinner} from "@nextui-org/spinner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardProfitChart() {
  const [profitData, setProfitData] = useState([]);

  useEffect(() => {
    const fetchProfitData = async () => {
      const { data, error } = await supabase.from("sales").select("*");
  
      if (error) {
        console.error("Error fetching profit data:", error);
      } else {
        // Group the sales data by month and sum the profits
        const groupedData = data.reduce((acc, sale) => {
          const month = new Date(sale.sale_date).toLocaleString("default", {
            month: "long",
          });
          
          // Find if the month is already in the accumulator
          const existingMonth = acc.find((entry) => entry.month === month);
          
          if (existingMonth) {
            existingMonth.profit += sale.profit; // Sum the profits
          } else {
            acc.push({ month, profit: sale.profit });
          }
  
          return acc;
        }, []);
  
        setProfitData(groupedData);
      }
    };
  
    fetchProfitData();
  }, []);
  

  // Return null or a fallback UI if no data is available
  if (profitData.length === 0) {
    return <div><Spinner size="sm" /></div>;
  }

  return (
    <Card className='bg-zinc-800 border-none'>
      <CardHeader>
        <CardTitle className='text-xl font-bold text-white'>Profit Overview</CardTitle>
        <CardDescription>Profit for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart width={500} height={300} data={profitData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)} // Show abbreviated month names
          />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "transparent" }} /> {/* Using Recharts Tooltip */}
          <Bar dataKey="profit" fill="#a78bfa" radius={8} /> {/* Example fill color */}
        </BarChart>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing profit over the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
