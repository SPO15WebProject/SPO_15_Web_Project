import { Routes, Route } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Footer from './components/Footer/Footer'

import HomePage from './pages/Homepage/Homepage'
import PopularPage from './pages/Popularpage/Popularpage'
import TrendingPage from './pages/Trendingpage/Trendingpage'
import MovieDetails from './pages/Detailspage/MovieDetails'
import SearchPage from './pages/Searchpage/Searchpage'
import LoginPage from './pages/Loginpage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import AccountPage from './pages/Accountpage/AccountPage'
import ProfilePage from './pages/Profilepage/ProfilePage'
import MyReviewsPage from './pages/MyReviewspage/MyReviewsPage'
import CreateGroupPage from './pages/GroupPage/CreateGroupPage'
import GroupPage from './pages/GroupPage/GroupPage'
import MyGroupsPage from './pages/GroupPage/MyGroupPage'

function App() {
  return (
    <>
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <div className="app-content">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/reviews" element={<MyReviewsPage />} />
              <Route path="/groups/new" element={<CreateGroupPage />} />
              <Route path="/groups/:groupId" element={<GroupPage />} />
              <Route path="/profile/groups" element={<MyGroupsPage />} />
              <Route path="*" element={<p>Sivua ei löytynyt.</p>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </>
  )
}

export default App