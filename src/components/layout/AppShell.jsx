import Header from './Header'
import Footer from './Footer'

export default function AppShell({ children }){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="container-px py-6">{children}</main>
      <Footer />
    </div>
  )
}
