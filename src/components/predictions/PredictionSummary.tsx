import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';

interface SummaryStats {
  total: number;
  overdue: number;
  dueSoon: number;
  dueThisMonth: number;
}

const PredictionSummary: React.FC = () => {
  const { carsDueSoon, loading } = useAppSelector(state => state.predictions);
  const [stats, setStats] = useState<SummaryStats>({
    total: 0,
    overdue: 0,
    dueSoon: 0,
    dueThisMonth: 0
  });

  useEffect(() => {
    if (!loading && carsDueSoon.length > 0) {
      const newStats: SummaryStats = {
        total: 0,
        overdue: 0,
        dueSoon: 0,
        dueThisMonth: 0
      };

      // Count services by status
      carsDueSoon.forEach(car => {
        car.services_due.forEach(service => {
          newStats.total++;
          
          if (service.days_to_go < 0 || service.mileage_to_go < 0) {
            newStats.overdue++;
          } else if (service.days_to_go < 7 || service.mileage_to_go < 300) {
            newStats.dueSoon++;
          } else if (service.days_to_go < 30 || service.mileage_to_go < 1000) {
            newStats.dueThisMonth++;
          }
        });
      });

      setStats(newStats);
    }
  }, [carsDueSoon, loading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">Total Services</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          {loading ? '--' : stats.total}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Total scheduled services
        </p>
      </div>
      
      <div className="card bg-red-50 border border-red-200">
        <h3 className="text-lg font-semibold text-red-700">Overdue</h3>
        <p className="text-3xl font-bold text-red-800 mt-2">
          {loading ? '--' : stats.overdue}
        </p>
        <p className="text-sm text-red-600 mt-1">
          Immediate attention required
        </p>
      </div>
      
      <div className="card bg-orange-50 border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-700">Due This Week</h3>
        <p className="text-3xl font-bold text-orange-800 mt-2">
          {loading ? '--' : stats.dueSoon}
        </p>
        <p className="text-sm text-orange-600 mt-1">
          Schedule within 7 days
        </p>
      </div>
      
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-700">Due This Month</h3>
        <p className="text-3xl font-bold text-yellow-800 mt-2">
          {loading ? '--' : stats.dueThisMonth}
        </p>
        <p className="text-sm text-yellow-600 mt-1">
          Plan for upcoming services
        </p>
      </div>
    </div>
  );
};

export default PredictionSummary; 