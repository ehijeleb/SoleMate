import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { supabase } from '../../../lib/supabaseClient';
import DashboardProfitChart from "./DashboardProfitChart";

const Dashboard = () => {
    const [userName, setUserName] = useState('');
    const [sales, setSales] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSalesCount, setTotalSalesCount] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalSpentTimePeriod, setTotalSpentTimePeriod] = useState('All Time'); // Independent state for Total Spent
    const [totalItems, setTotalItems] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [profitTimePeriod, setProfitTimePeriod] = useState('All Time'); // Independent state for Profit

    useEffect(() => {
        const fetchUserName = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const firstName = user.user_metadata.first_name || '';
                const lastName = user.user_metadata.last_name || '';
                setUserName(`${firstName} ${lastName}`);
            }
        };

        const fetchSales = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: salesData, error: salesError } = await supabase
              .from('sales')
              .select('*')  // Ensure this includes 'sale_date' and 'profit'
              .eq('user_id', user.id);
          
            if (salesError) {
              console.error("Error fetching sales:", salesError.message);
            } else {
              console.log('Fetched sales data:', salesData);  // Log the full sales data
              setSales(salesData);
              calculateTotalRevenueAndSales(salesData);  // Calculate total revenue and sales count
            }
          };
        
          
        
        const fetchInventory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('user_id', user.id);
        
            if (inventoryError) {
                console.error("Error fetching inventory:", inventoryError.message);
            } else {
                console.log('Fetched inventory data:', inventoryData);  // Debugging log
                setInventory(inventoryData);
            }
        };

        fetchUserName();
        fetchSales();
        fetchInventory();
    }, []);

    useEffect(() => {
        calculateTotalSpent();
    }, [sales, inventory, totalSpentTimePeriod]);

    useEffect(() => {
        calculateTotalProfit(sales);  // Call calculateTotalProfit after definition
    }, [sales, profitTimePeriod]);

    // Define calculateTotalProfit before using it
    const calculateTotalProfit = (sales) => {
        const filteredSales = filterSalesByTimePeriod(sales, profitTimePeriod);
        console.log("Filtered sales for profit:", filteredSales);  // Debugging log
      
        const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
        setTotalProfit(totalProfit.toFixed(2));
      };
      
    
      

    const calculateTotalRevenueAndSales = (sales) => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.price_sold, 0);
        setTotalRevenue(totalRevenue.toFixed(2));
        setTotalSalesCount(sales.length);
    };

    const calculateTotalSpent = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.error('User not logged in');
            return;
          }
      
          // Fetch all shoes from the shoe_log table
          const { data: shoeLog, error } = await supabase
            .from('shoe_log')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error fetching shoe log:', error.message);
            return;
          }
      
          console.log("Fetched shoe log data:", shoeLog);  // Log the fetched shoe log
      
          // Filter sales by the selected time period
          const filteredShoeLog = filterSalesByTimePeriod(shoeLog, totalSpentTimePeriod);
          console.log("Filtered shoe log for total spent:", filteredShoeLog);  // Debugging log
      
          const totalSpent = filteredShoeLog.reduce((sum, shoe) => {
            if (shoe.price) {
              return sum + (shoe.quantity * shoe.price);
            }
            return sum;
          }, 0);
      
          const totalItems = filteredShoeLog.reduce((sum, shoe) => sum + shoe.quantity, 0);
      
          setTotalSpent(totalSpent.toFixed(2));
          setTotalItems(totalItems);
        } catch (error) {
          console.error('Error calculating total spent:', error);
        }
      };
      
      

      const filterSalesByTimePeriod = (data, timePeriod) => {
        const now = new Date();
        let filteredData = data;
      
        switch (timePeriod) {
          case 'Last Week':
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 7);
            filteredData = data.filter(item => new Date(item.date_added || item.sale_date) >= lastWeek);
            break;
          case 'Last Month':
            const lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);
            filteredData = data.filter(item => new Date(item.date_added || item.sale_date) >= lastMonth);
            break;
          case 'Last 6 Months':
            const lastSixMonths = new Date();
            lastSixMonths.setMonth(now.getMonth() - 6);
            filteredData = data.filter(item => new Date(item.date_added || item.sale_date) >= lastSixMonths);
            break;
          case 'Last Year':
            const lastYear = new Date();
            lastYear.setFullYear(now.getFullYear() - 1);
            filteredData = data.filter(item => new Date(item.date_added || item.sale_date) >= lastYear);
            break;
          default:
            // 'All Time' case, no filtering needed
            filteredData = data;
            break;
        }
      
        console.log("Filtered data based on time period:", filteredData);  // Debugging log
        return filteredData;
      };
      
    
      
      
      
      
      

    const handleTotalSpentTimePeriodChange = (e) => {
        setTotalSpentTimePeriod(e.target.value);
    };

    const handleProfitTimePeriodChange = (e) => {
        setProfitTimePeriod(e.target.value);
    };

    return (
        <Layout>
            <div className="w-full h-full p-0 m-0 ">
                <div className="mb-14">
                    <h1 className="text-4xl font-extrabold text-violet-300">Welcome, {userName}!</h1>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-8 mb-6 mx-8 h-32">
                    <div className="bg-zinc-800 p-4 border border-zinc-700 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-1 text-violet-100">Total Revenue</h2>
                        <p className="text-2xl mb-2 text-violet-300">£{totalRevenue}</p>
                        <p className="text-sm text-gray-400">{totalSalesCount} Sales</p>
                    </div>
                    <div className="bg-zinc-800 p-4 border border-zinc-700 rounded-lg shadow-md relative">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-white">Total Spent</h2>
                            <select
                                value={totalSpentTimePeriod}
                                onChange={handleTotalSpentTimePeriodChange}
                                className="text-sm bg-zinc-700 text-white rounded-lg px-2 py-1 border border-zinc-600 focus:outline-none"
                            >
                                <option>Last Week</option>
                                <option>Last Month</option>
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                                <option>All Time</option>
                            </select>
                        </div>
                        <p className="text-2xl text-violet-300 mt-2">£{totalSpent}</p>
                        <p className="text-sm text-gray-400 mt-2">{totalItems} Transactions</p>
                    </div>
                    <div className="bg-zinc-800 p-4 border border-zinc-700 rounded-lg shadow-md relative">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-white">Profit</h2>
                            <select
                                value={profitTimePeriod}
                                onChange={handleProfitTimePeriodChange}
                                className="text-sm bg-zinc-700 text-white rounded-lg px-2 py-1 border border-zinc-600 focus:outline-none"
                            >
                                <option>Last Week</option>
                                <option>Last Month</option>
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                                <option>All Time</option>
                            </select>
                        </div>
                        <p className="text-2xl text-violet-300 mt-2">£{totalProfit}</p>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]  mx-8 gap-6">
                    <div className="bg-zinc-800 p-4 border border-zinc-700 rounded-lg shadow-md">
                        {/* Content for Retail value */}
                    </div>
                    <div className="bg-zinc-800 p-4 border border-zinc-700 rounded-lg shadow-md">
                    <DashboardProfitChart />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
