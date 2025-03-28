# React Frontend Development Rules

## Technology Stack
- **React** with **TypeScript**
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Shadcn UI** for component library
- **Tailwind CSS** for styling
- **i18next** for multilingual support (French and English)

## Garage Theme Mandate
All components and screens MUST comply with the dark-themed garage UI as documented in `theming-guidelines.md`. This includes:

1. **Black backgrounds** as the primary surface color (#000000)
2. **Dark gray cards** for content sections (#111111, #1a1a1a)
3. **Purple/indigo accents** for headings and highlights (#6366f1)
4. **Consistent theming** for all states (regular, loading, error, empty)
5. **Card-based layout** for all content sections

## Application Structure
- **Garage Dashboard**: For administrators to manage the car service garage
- **Components**: Reusable UI components organized by feature
- **State Management**: Redux store with dedicated slices for each entity
- **Routing**: Organized routes with consistent layout

## Component Organization
- **Layout components**: Horizontal navigation, content areas
- **Feature components**: Forms, lists, detail views for each entity
- **Shared components**: Buttons, inputs, cards, loading indicators
- **UI components**: Styled versions of basic HTML elements

## State Management
- Use **Redux Toolkit** for global state
- Configure slices for each major entity
- Handle API integration with async thunks
- Use local state for component-specific concerns

## Routing
- Implement **React Router** for navigation
- Create routes for main sections: dashboard, cars, customers, services
- Use nested routes where appropriate
- Implement protected routes for admin-only access

## Form Handling
- Use controlled components for forms
- Implement proper form validation
- Use the Select component for dropdowns
- Show validation errors inline

## API Integration
- Use axios for API requests
- Create API service modules for each entity
- Handle loading, error, and success states properly
- Cache responses where appropriate

## UI/UX Standards
- **ALWAYS apply the dark garage theme** to all components and screens
- Responsive design for all screen sizes
- Loading indicators for asynchronous operations
- Consistent error messaging
- Accessible design (WCAG compliance)
- Use icons consistently across the UI for better visual cues

## Component Implementation Pattern
Always structure components following this pattern:

```tsx
const MyComponent: React.FC = () => {
  // State and hooks
  const { data, loading, error } = useMyData();
  
  // Event handlers
  const handleAction = () => {
    // ...
  };
  
  // Always wrap with themed container
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6">Component Title</h1>
        
        {/* Handle different states while maintaining theme */}
        {loading ? (
          <Card className="mb-6 border-gray-800 bg-gray-900 shadow-xl">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-pulse text-gray-300">Loading...</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="mb-6 border-gray-800 bg-gray-900 shadow-xl">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-red-400">Error: {error}</div>
            </CardContent>
          </Card>
        ) : data ? (
          <ThemedContent data={data} onAction={handleAction} />
        ) : null}
      </div>
    </div>
  );
};
```

## Testing
- Write tests for all components
- Test all states (loading, error, success)
- Mock API responses
- Test user interactions

## Performance
- Avoid unnecessary re-renders
- Use memoization where appropriate
- Implement virtualization for long lists
- Use code splitting for larger features

## Accessibility
- Use semantic HTML elements
- Provide appropriate ARIA attributes
- Ensure proper focus management
- Support keyboard navigation
- Ensure sufficient color contrast for all text

## Theme Compliance Review
All pull requests MUST include a theme compliance review to ensure:

1. Black backgrounds are used consistently
2. All screens maintain dark theme styling
3. Card-based components use the correct styling
4. Loading and error states are properly themed
5. Component styling follows the guidelines
6. Icons are used consistently for better UX

By adhering to these rules, we ensure a consistent, dark-themed garage UI across the entire application. 