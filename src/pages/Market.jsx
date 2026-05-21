import Layout from "../Components/layout/Layout";
import { useEffect, useState } from "react";

const Market = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId")) || 1;
    const saved = localStorage.getItem(`portfolioData_${userId}`);

    if (saved) {
      const parsed = JSON.parse(saved);
      setStocks(parsed.allStocks || []);
    } else {
      // fallback API (just in case)
      fetch(`${import.meta.env.VITE_API_URL}/portfolio?user_id=${userId}`)
        .then((res) => res.json())
        .then((res) => {
          setStocks(res.allStocks || []);
        });
    }
  }, []);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">📈 Market</h2>

      <div className="grid grid-cols-4 gap-4">
        {stocks.map((s, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded">
            {s}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Market;