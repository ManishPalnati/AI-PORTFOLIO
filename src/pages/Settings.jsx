import Layout from "../components/layout/Layout";

const Settings = () => {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">
        ⚙️ Settings
      </h2>

      <div className="bg-slate-800 p-6 rounded-xl shadow space-y-4">

        <div>
          <h3 className="text-lg font-semibold mb-1">
            Application
          </h3>
          <p className="text-gray-400 text-sm">
            AI Portfolio Management Dashboard
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">
            Version
          </h3>
          <p className="text-gray-400 text-sm">
            v1.0.0
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">
            Description
          </h3>
          <p className="text-gray-400 text-sm">
            This system provides real-time portfolio tracking,
            AI-based insights, and dynamic visualization of stock data.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">
            Features
          </h3>
          <ul className="text-gray-400 text-sm list-disc pl-5 space-y-1">
            <li>Real-time stock price updates</li>
            <li>AI-generated portfolio insights</li>
            <li>Interactive charts and graphs</li>
            <li>Portfolio allocation tracking</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">
            Developer
          </h3>
          <p className="text-gray-400 text-sm">
            AI Portfolio System Project
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;