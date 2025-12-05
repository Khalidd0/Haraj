import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import VerifyPage from './pages/VerifyPage'
import ListingDetailPage from './pages/ListingDetailPage'
import PostItemPage from './pages/PostItemPage'
import AddProductPage from './pages/AddProductPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import SavedPage from './pages/SavedPage'
import NotFound from './pages/NotFound'
import { ListingsProvider } from './context/ListingsContext'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import ProtectedRoute from './routes/ProtectedRoute'

function RootRoutes() {
  return (
    <Routes>
      <Route path='/' element={user? <HomePage/> : <LandingPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/signup' element={<SignUpPage/>}/>
      <Route path='/verify' element={<VerifyPage/>}/>
      <Route path='/listing/:id' element={<ListingDetailPage/>}/>
      <Route path='/post' element={<ProtectedRoute><PostItemPage/></ProtectedRoute>}/>
      <Route path='/add' element={<ProtectedRoute><AddProductPage/></ProtectedRoute>}/>
      <Route path='/messages/*' element={<ProtectedRoute><MessagesPage/></ProtectedRoute>}/>
      <Route path='/profile' element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
      <Route path='/saved' element={<ProtectedRoute><SavedPage/></ProtectedRoute>}/>
      <Route path='/admin' element={<ProtectedRoute><AdminPage/></ProtectedRoute>}/>
      <Route path='*' element={<NotFound/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <ListingsProvider>
            <AppShell>
              <RootRoutes/>
            </AppShell>
          </ListingsProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  )
}
