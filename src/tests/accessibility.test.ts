import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Accessibility & WCAG 2.2 AA Compliance Tests', () => {
  it('verifies that index.css includes prefers-reduced-motion media query for motion sensitivity', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.01ms !important');
    expect(cssContent).toContain('transition-duration: 0.01ms !important');
  });

  it('verifies that index.css defines prominent visible focus rings for keyboard navigation', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain(':focus-visible');
    expect(cssContent).toContain('outline: 2px solid #B85F80 !important');
    expect(cssContent).toContain('outline-offset: 2px !important');
  });

  it('verifies that NotificationToast uses role="status" and aria-live="polite" for screen reader announcements', () => {
    const toastPath = path.resolve(process.cwd(), 'src/components/NotificationToast.tsx');
    const toastContent = fs.readFileSync(toastPath, 'utf-8');

    expect(toastContent).toContain('aria-live="polite"');
    expect(toastContent).toContain('role="status"');
    expect(toastContent).toContain('aria-label="Dismiss notification"');
  });

  it('verifies that Sidebar navigation includes aria-current="page" on active tabs', () => {
    const sidebarPath = path.resolve(process.cwd(), 'src/components/Sidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

    expect(sidebarContent).toContain("aria-current={isActive ? 'page' : undefined}");
    expect(sidebarContent).toContain('aria-label="Studio Navigation Sidebar"');
    expect(sidebarContent).toContain('aria-label="Main studio sections"');
  });

  it('verifies that all modals utilize useFocusTrap and declare role="dialog" and aria-modal="true"', () => {
    const modals = [
      'src/components/SetupWizardModal.tsx',
      'src/components/RegenerateSectionModal.tsx',
      'src/components/ExportModal.tsx',
      'src/components/PrintModal.tsx',
      'src/components/HelpSupportModal.tsx',
    ];

    for (const modalRelPath of modals) {
      const fullPath = path.resolve(process.cwd(), modalRelPath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      expect(content).toContain('useFocusTrap');
      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-modal="true"');
      expect(content).toContain('ref={trapRef}');
    }
  });

  it('verifies that form inputs across primary views have associated label elements', () => {
    const budgetViewPath = path.resolve(process.cwd(), 'src/components/BudgetPlannerView.tsx');
    const budgetContent = fs.readFileSync(budgetViewPath, 'utf-8');

    expect(budgetContent).toContain('htmlFor="bgt-desc-input"');
    expect(budgetContent).toContain('id="bgt-desc-input"');
    expect(budgetContent).toContain('htmlFor="bgt-category-select"');
    expect(budgetContent).toContain('id="bgt-category-select"');
    expect(budgetContent).toContain('htmlFor="bgt-priority-select"');
    expect(budgetContent).toContain('id="bgt-priority-select"');

    const timelineViewPath = path.resolve(process.cwd(), 'src/components/TimelineView.tsx');
    const timelineContent = fs.readFileSync(timelineViewPath, 'utf-8');

    expect(timelineContent).toContain('htmlFor="task-title-input"');
    expect(timelineContent).toContain('id="task-title-input"');
    expect(timelineContent).toContain('htmlFor="task-due-input"');
    expect(timelineContent).toContain('id="task-due-input"');

    const vendorsViewPath = path.resolve(process.cwd(), 'src/components/VendorsView.tsx');
    const vendorsContent = fs.readFileSync(vendorsViewPath, 'utf-8');

    expect(vendorsContent).toContain('htmlFor="vendor-title-input"');
    expect(vendorsContent).toContain('id="vendor-title-input"');
    expect(vendorsContent).toContain('htmlFor="vendor-cost-input"');
    expect(vendorsContent).toContain('id="vendor-cost-input"');
  });
});
