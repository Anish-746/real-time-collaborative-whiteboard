import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-white">
      <button>
        <Link
          to="/room/1266"
          className="text-black font-bold underline hover:text-gray-700"
        >
          Go to Room 
        </Link>
      </button>
    </div>
  );
};

export default Dashboard;
