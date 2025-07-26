import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RouteProgress } from './RouteProgress';
import { Product } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Clock, User, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const currentStation = product.route.stations.find(s => s.id === product.currentStation);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 rounded-2xl"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>{product.model}</span>
            </div>
          </div>
          <Badge 
            variant={product.status === "overdue" ? "error" : "success"}
            className={getStatusColor(product.status)}
          >
            {getStatusLabel(product.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{product.progress}%</span>
          </div>
          <Progress value={product.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Current Owner:</span>
            <span className="font-medium">{currentStation?.owner || 'Unassigned'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{formatDate(product.updatedAt)}</span>
          </div>
        </div>

        <div className="pt-2">
          <RouteProgress 
            stations={product.route.stations}
            currentStationId={product.currentStation}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm font-medium text-muted-foreground mb-1">Current Station</div>
          <div className="text-base font-semibold">{currentStation?.name || 'Unknown Station'}</div>
        </div>
      </CardContent>
    </Card>
  );
}