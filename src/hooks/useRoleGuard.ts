import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from './useSession';
import type { Role } from '../data/types';

export function useRoleGuard(allowedRoles: Role[]): boolean {
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (!allowedRoles.includes(session.role)) {
      navigate('/blocked', { replace: true });
    }
  }, []);

  if (!session) return false;
  return allowedRoles.includes(session.role);
}
