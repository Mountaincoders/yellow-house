import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AuthPage } from './pages/Auth.js';
import { GroupsPage } from './pages/Groups.js';
import { GroupDetailPage } from './pages/GroupDetail.js';
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('groups');
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-gray-600", children: "Loading..." }) }));
    }
    if (!user) {
        return _jsx(AuthPage, {});
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Yellow House" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Welcome, ", user.name] }), _jsx("button", { onClick: handleLogout, className: "btn-secondary", children: "Logout" })] })] }), _jsxs("div", { className: "flex gap-2 border-t border-gray-200 pt-4", children: [_jsx("button", { onClick: () => setCurrentPage('groups'), className: `px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 'groups'
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'}`, children: "Groups" }), _jsx("button", { onClick: () => setCurrentPage('dashboard'), className: `px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 'dashboard'
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'}`, children: "Dashboard" })] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [currentPage === 'groups' && (_jsx(GroupsPage, { onSelectGroup: (groupId) => {
                            setSelectedGroupId(groupId);
                            setCurrentPage('group-detail');
                        } })), currentPage === 'group-detail' && selectedGroupId && (_jsx(GroupDetailPage, { groupId: selectedGroupId, onBack: () => setCurrentPage('groups') })), currentPage === 'dashboard' && (_jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-gray-800", children: "Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Welcome to Yellow House!" })] }))] })] }));
}
export default App;
//# sourceMappingURL=App.js.map