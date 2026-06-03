import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import ShortenForm from '../components/ShortenForm';

function Create() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSuccess = (newUrl) => {
    navigate(`/analytics/${newUrl._id}`);
  };

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72 transition-all duration-300">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">Create Short Link</h1>
            <p className="text-surface-600 dark:text-dark-400">Generate a shortened URL with custom options</p>
          </motion.div>
          <div className="max-w-2xl">
            <ShortenForm onSuccess={handleSuccess} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;