import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>P</div>
          <span style={styles.logoText}>Paylink</span>
        </Link>

        <div style={styles.links}>
          {[
            { to: '/', label: 'Home' },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/about', label: 'About' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                color: pathname === to ? 'var(--green)' : 'var(--ink-soft)',
                borderBottom:
                  pathname === to
                    ? '2px solid var(--green)'
                    : '2px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}
          <Link to="/dashboard" style={styles.btn}>
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'rgba(250,250,247,0.96)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'var(--green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--mustard)',
    fontWeight: 700,
    fontSize: 16,
    fontFamily: 'var(--font-display)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 20,
    color: 'var(--ink)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  link: {
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 4,
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
  btn: {
    padding: '9px 22px',
    background: 'var(--mustard)',
    color: 'white',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition)',
  },
};

export default Navbar;
