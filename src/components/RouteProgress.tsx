import React, { memo, useMemo } from 'react';
import { Station } from '@/types';
import { cn } from '@/lib/utils';

interface RouteProgressProps {
  stations: Station[];
  currentStationId: string;
  className?: string;
}

export const RouteProgress = memo(function RouteProgress({ stations, currentStationId, className }: RouteProgressProps) {
  const currentIndex = useMemo(() => 
    stations.findIndex(s => s.id === currentStationId),
    [stations, currentStationId]
  );

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {stations.map((station, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={station.id}>
            <div className="flex flex-col items-center space-y-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  {
                    "bg-green-500 text-white": isCompleted,
                    "bg-blue-500 text-white": isCurrent,
                    "bg-gray-200 text-gray-600": isPending,
                  }
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                "text-xs text-center max-w-16 truncate",
                {
                  "text-green-600 font-medium": isCompleted,
                  "text-blue-600 font-medium": isCurrent,
                  "text-gray-500": isPending,
                }
              )}>
                {station.name}
              </span>
            </div>
            {index < stations.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors",
                  {
                    "bg-green-500": index < currentIndex,
                    "bg-gray-200": index >= currentIndex,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});