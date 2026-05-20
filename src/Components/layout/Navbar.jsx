const Navbar = () => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-slate-800 px-3 py-1 rounded-lg outline-none text-sm"
        />

        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          U
        </div>
      </div>
    </div>
  );
};

export default Navbar;