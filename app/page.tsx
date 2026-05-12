// app/(organizer)/dashboard/page.tsx
// Example: organizer-only page
import ProtectedRoute from "@/components/ui/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your events here.</p>
        {/* Your organizer dashboard content */}
      </div>
    </ProtectedRoute>
  );
}

// app/(attendee)/my-tickets/page.tsx
// Example: attendee-only page
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
//
// export default function MyTicketsPage() {
//   return (
//     <ProtectedRoute requiredRole="attendee">
//       <div className="p-4">
//         <h1>My Tickets</h1>
//       </div>
//     </ProtectedRoute>
//   );
// }

// app/explore/page.tsx
// Example: any logged-in user
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
//
// export default function ExplorePage() {
//   return (
//     <ProtectedRoute>   {/* no requiredRole = any auth'd user */}
//       <div className="p-4">
//         <h1>Explore Events</h1>
//       </div>
//     </ProtectedRoute>
//   );
// }
