import AuthLayout from "../layouts/AuthLayout";

export default function Profile({ user: userProp, onLogout }) {
  // Merge provided user data with defaults
  const user = {
    name: userProp?.name || "Alex Johnson",
    email: userProp?.email || "alex.johnson@example.com",
    username: "@alexdraws",
    bio: "Creative thinker | Digital artist | Coffee enthusiast ☕",
    joinedDate: "January 2024",
    projectsCount: 42,
    sketchesCount: 128,
    followersCount: 1234
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto p-4">
        {/* Profile Card */}
        <div className="bg-white border-3 border-black rounded-2xl p-8 shadow-[8px_8px_0_#000] relative">
          {/* Header with Avatar */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_#000]">
                <span className="text-4xl">🎨</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-2 border-black rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1 font-['Comic_Sans_MS',_cursive]">
                {user.name}
              </h1>
              <p className="text-gray-600 mb-1">{user.username}</p>
              <p className="text-sm text-gray-500">
                Joined {user.joinedDate}
              </p>
            </div>

            {/* Edit Button */}
            <button className="px-4 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000]">
              Edit ✏️
            </button>
          </div>

          {/* Bio */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-black rounded-lg">
            <p className="text-gray-800">{user.bio}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-pink-50 border-2 border-black rounded-lg">
              <div className="text-2xl font-bold">{user.projectsCount}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center p-4 bg-purple-50 border-2 border-black rounded-lg">
              <div className="text-2xl font-bold">{user.sketchesCount}</div>
              <div className="text-sm text-gray-600">Sketches</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border-2 border-black rounded-lg">
              <div className="text-2xl font-bold">{user.followersCount}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-3 font-['Comic_Sans_MS',_cursive]">
              Account Details
            </h3>

            <div className="p-4 border-2 border-black rounded-lg bg-white">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div className="p-4 border-2 border-black rounded-lg bg-white">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <p className="text-gray-900">{user.username}</p>
            </div>

            <div className="p-4 border-2 border-black rounded-lg bg-white">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <p className="text-gray-900">••••••••</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-[4px_4px_0_#666]">
              Save Changes
            </button>
            <button 
              onClick={onLogout}
              className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0_#000]"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="mt-6 bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000]">
          <h3 className="text-xl font-bold mb-4 font-['Comic_Sans_MS',_cursive]">
            Recent Activity 🎯
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-black rounded-lg">
              <span className="text-2xl">🎨</span>
              <div className="flex-1">
                <p className="font-medium">Completed "Sunset Landscape"</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-black rounded-lg">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <p className="font-medium">Started new project "Abstract Ideas"</p>
                <p className="text-sm text-gray-600">Yesterday</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-black rounded-lg">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <p className="font-medium">Received 50 likes on sketch</p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}