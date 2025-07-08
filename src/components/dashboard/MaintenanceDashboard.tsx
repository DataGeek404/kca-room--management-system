
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRequests } from "@/components/maintenance/MaintenanceRequests";
import { RoomStatusView } from "@/components/maintenance/RoomStatusView";
import { MaintenanceHistory } from "@/components/maintenance/MaintenanceHistory";

interface MaintenanceDashboardProps {
  activeView: string;
}

export const MaintenanceDashboard = ({ activeView }: MaintenanceDashboardProps) => {
  if (activeView === "requests") {
    return <MaintenanceRequests />;
  }
  
  if (activeView === "rooms") {
    return <RoomStatusView />;
  }
  
  if (activeView === "history") {
    return <MaintenanceHistory />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-red-100 text-sm">High priority</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-orange-100 text-sm">Awaiting action</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-blue-100 text-sm">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-green-100 text-sm">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { room: "A101", issue: "Projector not working", priority: "high", reported: "2 hours ago" },
              { room: "B205", issue: "Air conditioning issues", priority: "high", reported: "4 hours ago" },
              { room: "C301", issue: "Whiteboard needs cleaning", priority: "medium", reported: "1 day ago" },
              { room: "D102", issue: "Chair replacement needed", priority: "low", reported: "2 days ago" },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Room {task.room}</p>
                  <p className="text-sm text-gray-600">{task.issue}</p>
                  <p className="text-xs text-gray-500">Reported {task.reported}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium' 
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.priority.toUpperCase()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {[
                { building: "Building A", total: 8, available: 6, maintenance: 2 },
                { building: "Building B", total: 10, available: 9, maintenance: 1 },
                { building: "Building C", total: 6, available: 6, maintenance: 0 },
              ].map((building, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{building.building}</div>
                    <div className="text-sm text-gray-600">{building.total} rooms</div>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="text-green-600">
                      {building.available} Available
                    </div>
                    <div className="text-red-600">
                      {building.maintenance} Maintenance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
