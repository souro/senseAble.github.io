import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Header from '../components/Common/Header';
import UserAccountForm from '../components/UserAccount/UserAccountForm';

const UserAccountPage: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {user && !isLoginPage && <Header />}
      <UserAccountForm isLoginMode={isLoginPage} />
    </div>
  );
};

export default UserAccountPage;
