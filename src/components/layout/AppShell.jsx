import Header from './Header'
import Footer from './Footer'

export default function AppShell({ children }){
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      <main className="container-px py-6">{children}</main>
      <Footer />
    </div>
  )
}
