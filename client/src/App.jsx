import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";

import HomePage from "./assets/pages/HomePage.jsx";
import ProfilePage from "./assets/pages/ProfilePage.jsx";
import LoginPage from "./assets/pages/LoginPage.jsx";
import SignupPage from "./assets/pages/SignupPage.jsx";
import CommunityPage from "./assets/pages/CommunityPage";
import ExplorePage from "./assets/pages/ExplorePage.jsx";
import SettingsPage from "./assets/pages/SettingsPage.jsx";
import SearchPage from "./assets/pages/SearchPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/community/:communityId",
    element: (
      <PrivateRoute>
        <CommunityPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/explore",
    element: (
      <PrivateRoute>
        <ExplorePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/search/:searchTerm",
    element: (
      <PrivateRoute>
        <SearchPage />
      </PrivateRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
