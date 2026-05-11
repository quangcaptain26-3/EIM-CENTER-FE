import RouterProviderWrapper from '@/app/providers/router-provider';
import { useInitAuth } from '@/presentation/hooks/auth/use-init-auth';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsInitialized } from '@/app/store/auth.selectors';
import { PageLoader } from '@/presentation/layouts/page-loader';

/**
 * Khởi tạo auth (GET /auth/me) và chỉ mount router sau khi `isInitialized`.
 */
const App = () => {
  useInitAuth();
  const isInitialized = useAppSelector(selectIsInitialized);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-base)]">
        <PageLoader className="w-full max-w-md" />
      </div>
    );
  }

  return <RouterProviderWrapper />;
};

export default App;
