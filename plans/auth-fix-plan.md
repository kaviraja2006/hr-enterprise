# Authentication Fix Plan

## Problem Analysis

The backend returns `401 - Access token is missing` because:

1. **Auth Context URL Issue**: [`auth-context.tsx`](frontend/src/core/auth/auth-context.tsx:38) uses relative URLs like `/api/auth/me` instead of the full backend URL `http://localhost:3002/api/auth/me`

2. **No Login Page**: There's no login page for users to authenticate and obtain tokens

3. **Inconsistent API Usage**: Auth context uses native `fetch` while other modules use the axios instance

## Solution

### Step 1: Fix Auth Context to use Axios

Update [`auth-context.tsx`](frontend/src/core/auth/auth-context.tsx:1) to:
- Use the axios instance from `core/api/axios.ts` 
- Use the correct base URL from env config
- Use `authService` from `auth-service.ts`

### Step 2: Create Login Page

Create a login page at `modules/auth/pages/LoginPage.tsx`:
- Email/password form
- Calls `login()` from auth context
- Redirects to dashboard on success
- Shows error messages on failure

### Step 3: Update Router

Update [`router.tsx`](frontend/src/app/router.tsx:1) to:
- Add `/login` route (public)
- Redirect authenticated users away from login
- Redirect unauthenticated users to login

### Step 4: Create Register Page (Optional)

Create a registration page for new users.

## Files to Modify/Create

```
frontend/src/
- core/auth/auth-context.tsx     [MODIFY] - Use axios instead of fetch
- modules/auth/                   [CREATE]
  - pages/LoginPage.tsx           [CREATE]
  - pages/RegisterPage.tsx        [CREATE] (optional)
  - components/LoginForm.tsx      [CREATE]
  - index.ts                      [CREATE]
- app/router.tsx                  [MODIFY] - Add login route
```

## Implementation Details

### Auth Context Fix

```typescript
// Before (broken)
const response = await fetch('/api/auth/me', { ... });

// After (fixed)
import axios from '../api/axios';
const response = await axios.get('/auth/me');
```

### Login Page Structure

```tsx
// LoginPage.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        {/* Email/Password inputs */}
        {/* Submit button */}
      </form>
    </div>
  );
}
```

### Router Update

```tsx
// Add public login route
<Route path="/login" element={<LoginPage />} />

// Protect other routes
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<ExecutiveDashboard />} />
  {/* ... other protected routes */}
</Route>
```

## Testing Steps

1. Start backend: `cd backend && pnpm dev`
2. Start frontend: `cd frontend && pnpm dev`
3. Navigate to `http://localhost:5173/login`
4. Login with seeded user credentials
5. Verify token is stored in localStorage
6. Verify protected routes work