const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-slate-900 p-5 border-r border-slate-800">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">
        AI Portfolio
      </h1>

      <ul className="space-y-4">
        {["Dashboard", "Portfolio", "Risk", "AI Insights"].map((item, i) => (
          <li
            key={i}
            className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;