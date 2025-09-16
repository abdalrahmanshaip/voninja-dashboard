import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BoxProvider } from './context/BoxContext'
import { ChallengeProvider } from './context/ChallengeContext'
import { CouponProvider } from './context/CouponContext'
import { DataProvider } from './context/DataContext'
import { EventProvider } from './context/EventContext'
import { LibraryProvider } from './context/LibraryContext'
import { TransactionsProvider } from './context/TransationContext'
import { UserProvider } from './context/UserContext'
import router from './routes/app-routes'

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <DataProvider>
          <ChallengeProvider>
            <EventProvider>
              <CouponProvider>
                <TransactionsProvider>
                  <LibraryProvider>
                    <BoxProvider>
                      <RouterProvider
                        router={router}
                        future={{
                          v7_startTransition: true,
                          v7_relativeSplatPath: true,
                        }}
                      />
                    </BoxProvider>
                  </LibraryProvider>
                </TransactionsProvider>
              </CouponProvider>
            </EventProvider>
          </ChallengeProvider>
        </DataProvider>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
