import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const PublicLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-shell">
      <Navbar isScrolled={isScrolled} />
      <main className="page-shell pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
