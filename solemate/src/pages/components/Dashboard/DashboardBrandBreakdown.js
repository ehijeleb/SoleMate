"use client"

import React, { useState, useEffect } from 'react';
import { Pie, PieChart, Cell } from "recharts";
import { supabase } from '../../../lib/supabaseClient';
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
import { TrendingUp } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

const DashboardBrandBreakdown = () => {
  const [inventory, setInventory] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setInventory(data);
        calculateBrandBreakdown(data);
      }
    } catch (err) {
      setError("Error fetching inventory");
    }

    setLoading(false);
  };

  const calculateBrandBreakdown = (inventoryData) => {
    const brandCount = {};
  
    inventoryData.forEach(item => {
      if (item.brand) {
        brandCount[item.brand] = (brandCount[item.brand] || 0) + item.quantity;
      }
    });

    const formattedBrandData = Object.keys(brandCount).map((brand, index) => ({
      name: brand,
      value: brandCount[brand],
      fill: COLORS[index % COLORS.length]
    }));

    setBrandData(formattedBrandData);
  };

  const chartConfig = brandData.reduce((acc, brand) => {
    acc[brand.name] = { label: brand.name, color: brand.fill };
    return acc;
  }, {}); 

  if (loading) return <Spinner color="primary" />;

  return (
    <Card className="flex flex-col bg-zinc-800 border-none">
      <CardHeader className="text-white pb-0">
        <CardTitle>Brand Breakdown</CardTitle>
        <CardDescription className='text-gray-400'>Based on Inventory</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : brandData.length === 0 ? (
          <p className="text-center text-zinc-400">No data available</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                className='bg-zinc-900 border-none'
              />
              <Pie
                data={brandData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className=" gap-2 mt-12 text-sm">
        <div className="leading-none text-gray-400">
          Breakdown of brands currently in your inventory
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardBrandBreakdown;
