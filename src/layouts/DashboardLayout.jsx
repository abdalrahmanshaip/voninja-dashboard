import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaBook,
  FaTrophy,
  FaExchangeAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa'
import { Users } from 'lucide-react'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const menuItems = [
    {
      path: '/',
      name: 'Lessons',
      icon: <FaBook className='w-5 h-5' />,
    },
    {
      path: '/users',
      name: 'Users',
      icon: <Users className='w-5 h-5' />,
    },
    {
      path: '/challenges',
      name: 'Challenges',
      icon: <FaTrophy className='w-5 h-5' />,
    },
    {
      path: '/transactions',
      name: 'Transactions',
      icon: <FaExchangeAlt className='w-5 h-5' />,
    },
    {
      path: '/coupons',
      name: 'Coupons',
      icon: <FaTicketAlt className='w-5 h-5' />,
    },
  ]

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar for larger screens */}
      <aside
        className={`bg-voninja text-white w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          <div className='px-4 py-6 border-b border-voninja-light'>
            <div className='flex items-center justify-between'>
              <h1 className='text-2xl font-bold text-white'>VoNinja</h1>
              <button
                className='lg:hidden text-white hover:text-gray-200 focus:outline-none'
                onClick={toggleSidebar}
              >
                <FaTimes className='h-6 w-6' />
              </button>
            </div>
            <p className='text-sm text-gray-300 mt-1'>Admin Dashboard</p>
          </div>

          <nav className='flex-1 px-2 py-4 overflow-y-auto'>
            <ul className='space-y-1'>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-150 ${
                        isActive
                          ? 'bg-voninja-dark text-white'
                          : 'text-gray-100 hover:bg-voninja-light'
                      }`
                    }
                    onClick={closeSidebar}
                    end={item.path === '/'}
                  >
                    <span className='mr-3'>{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className='p-4 border-t border-voninja-light'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 rounded-full bg-voninja-light flex items-center justify-center'>
                  <span className='text-white font-medium'>
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-white'>
                  {user?.name || 'Admin'}
                </p>
                <p className='text-xs text-gray-300'>
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className='mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-white bg-voninja-dark rounded-lg hover:bg-red-700 transition-colors duration-150'
            >
              <FaSignOutAlt className='mr-2' />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden'
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className='flex flex-col flex-1 lg:ml-64'>
        {/* Top navigation */}
        <header className='z-10 py-4 bg-white shadow-sm'>
          <div className='flex items-center justify-between px-4'>
            <button
              className='p-1 text-voninja hover:text-voninja-dark focus:outline-none focus:text-voninja-dark lg:hidden'
              onClick={toggleSidebar}
            >
              <FaBars className='h-6 w-6' />
            </button>

            <div className='lg:hidden flex-1 px-4 text-center'>
              <h1 className='text-lg font-bold text-voninja'>VoNinja Admin</h1>
            </div>

            <div className='hidden lg:flex'>
              <span className='text-gray-700'>
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto bg-gray-50 p-4'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
