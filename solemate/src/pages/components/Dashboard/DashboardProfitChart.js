"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"; 

export default function DashboardProfitChart() {
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitData = async () => {
      const { data, error } = await supabase.from("sales").select("*");

      if (error) {
        console.error("Error fetching profit data:", error);
      } else {
        const groupedData = data.reduce((acc, sale) => {
          const month = new Date(sale.sale_date).toLocaleString("default", {
            month: "long",
          });

          const existingMonth = acc.find((entry) => entry.month === month);

          if (existingMonth) {
            existingMonth.profit += sale.profit;
          } else {
            acc.push({ month, profit: sale.profit });
          }

          return acc;
        }, []);

        setProfitData(groupedData);
        setLoading(false);
      }
    };

    fetchProfitData();
  }, []);

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) return <div><Spinner size="sm" /></div>;

  return (
    <Card className='bg-zinc-800 border-none'>
      <CardHeader>
        <CardTitle className='text-xl font-bold text-white'>Profit Overview</CardTitle>
        <CardDescription className='text-gray-400'>Profit for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className='ml-24'>
        <ChartContainer config={chartConfig} className="w-full max-w-lg"> {/* Container size */}
          <ResponsiveContainer width="100%" height={300}> {/* Adjust height here */}
            <BarChart data={profitData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} 
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                className='bg-zinc-900 border-none'
              />
              <Bar dataKey="profit" fill="#a78bfa" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-gray-400">
          Showing total profits for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
