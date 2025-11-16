import { describe, it, expect } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import APIDocs from '@/pages/APIDocs';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Security from '@/pages/Security';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

describe('Navigation Pages', () => {
  // CRITICAL REGRESSION TEST: Ensure root route always renders Index page
  describe('Root Route (/)', () => {
    it('renders Index page at root path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify Index page is rendered by checking for brand tagline
      expect(screen.getByText(/Automate invoices/i)).toBeInTheDocument();
      expect(screen.getByText(/Approve faster/i)).toBeInTheDocument();
    });

    it('Index page does NOT contain banned terms', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </MemoryRouter>
      );

      // Ensure banned terms are not present
      const pageText = document.body.textContent || '';
      expect(pageText).not.toMatch(/never miss a call/i);
      expect(pageText).not.toMatch(/work while you sleep/i);
      expect(pageText).not.toMatch(/tradeline/i);
      expect(pageText).not.toMatch(/call center/i);
    });
  });
  const pages = [
    { path: '/features', Component: Features, title: 'Features' },
    { path: '/pricing', Component: Pricing, title: 'Pricing' },
    { path: '/api-docs', Component: APIDocs, title: 'API' },
    { path: '/about', Component: About, title: 'About' },
    { path: '/contact', Component: Contact, title: 'Contact' },
    { path: '/security', Component: Security, title: 'Security' },
    { path: '/privacy', Component: Privacy, title: 'Privacy' },
    { path: '/terms', Component: Terms, title: 'Terms' },
  ];

  pages.forEach(({ path, Component, title }) => {
    it(`renders ${title} page`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={path} element={<Component />} />
          </Routes>
        </MemoryRouter>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it(`${title} page has footer`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={path} element={<Component />} />
          </Routes>
        </MemoryRouter>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.textContent).toContain('FlowBills.ca');
    });
  });
});
