import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Market", path: "/market" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <div className="w-60 bg-slate-800 p-4">
        <h2 className="text-xl font-bold mb-6">AI Portfolio</h2>

        <nav className="flex flex-col gap-2">
          {menu.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`p-2 rounded ${
                location.pathname === item.path
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default Layout;