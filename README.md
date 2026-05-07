# SoleMate

SoleMate is a web application designed for sneaker resellers to track their inventory, sales, profit, and revenue. Built using Next.js for the frontend and Supabase for both image storage and PostgreSQL database services, SoleMate makes it easy to manage and track your sneaker business in one place.

## Features

- **Dashboard**: View a summary of your total profit, revenue, and spending. Get a detailed brand breakdown of your inventory.
- **Inventory Management**: Add, edit, and manage sneakers in your inventory, including details like brand, price, and quantity.
- **Sales Tracking**: Keep track of sales, including sold items, revenue generated, and the cost of goods sold.
- **Authentication**: Secure login system using Supabase Auth for user authentication.
- **Responsive Design**: Fully responsive layout for use on any device.
- **Deployed on Vercel**: SoleMate is deployed using Vercel for seamless performance and scalability.

## Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/) (React framework)
- **Backend**: [Supabase](https://supabase.io/) for PostgreSQL and image storage
- **Authentication**: Supabase Auth
- **Deployment**: [Vercel](https://vercel.com/) for hosting

## Pages

1. **Dashboard**: Provides an overview of your business performance. It includes:
   - Profit, revenue, and total spent.
   - A breakdown of your inventory by brand.

2. **Inventory**: Manage your inventory with the ability to:
   - Add new sneakers to track your stock.
   - Update existing entries with price or brand information.
   - View your inventory list.

3. **Sales**: Track your sales by:
   - Adding sales entries for sold items.
   - Viewing the revenue generated from individual sales.
   - Managing your overall sales history.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- Supabase account
- Vercel account for deployment

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/ehijeleb/SoleMate.git
    cd solemate
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env.local` file in the root of your project with the following Supabase and Vercel environment variables:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Visit the app at `http://localhost:3000`.

### Deployment

To deploy SoleMate on Vercel:

1. Push your project to GitHub or another Git repository.
2. Go to [Vercel](https://vercel.com/), connect your repository, and follow the deployment steps.
3. Set up your environment variables in Vercel to match your `.env.local` file.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you have suggestions or bug reports.

## License

This project is licensed under the MIT License.
