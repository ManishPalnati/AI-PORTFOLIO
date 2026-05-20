import Layout from "../Components/layout/Layout";

const Market = () => {
  const stocks = JSON.parse(localStorage.getItem("stocks")) || [];

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