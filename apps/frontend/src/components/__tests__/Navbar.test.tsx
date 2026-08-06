import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Navbar from '../Navbar';
import * as AuthContext from '@/context/AuthContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Navbar Component', () => {
  it('renders brand title WordForge', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    render(<Navbar />);
    expect(screen.getByText('WordForge')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders user menu when authenticated', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      user: { id: '123', name: 'Demo User', email: 'demo@example.com' },
      logout: vi.fn(),
    });

    render(<Navbar />);
    expect(screen.getByText('My Sets')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
