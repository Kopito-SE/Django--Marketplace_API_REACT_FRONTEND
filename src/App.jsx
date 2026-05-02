import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="app-shell">
                    <Navbar />
                    <main className="flex-1">
                        <AppRoutes />
                    </main>
                    <footer className="border-t border-[#dfe7e2] bg-white/70">
                        <div className="page-shell !py-5 flex flex-col gap-2 text-sm muted sm:flex-row sm:items-center sm:justify-between">
                            <span>MarketHub marketplace</span>
                            <span>Secure shopping, vendor tools, and M-Pesa checkout.</span>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
